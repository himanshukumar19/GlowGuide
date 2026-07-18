import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";
import { getVectorStore } from "./vectorstore";
import { searchWeb } from "./collectors/webSearch";
import { fetchAndClean } from "./collectors/webFetch";

const LOW_SCORE_THRESHOLD = 0.5;
const HIGH_SCORE_THRESHOLD = 0.75;
const WEB_FALLBACK_MAX_RESULTS = 3;

let webLiveCounter = 0;

const SYSTEM_PROMPT = `You are GlowGuide's skincare assistant. Answer the user's question using the provided context.

Sources labeled "(Source: Live web search)" are live web results fetched specifically for this query. Sources with other labels (peer_reviewed, dataset, web) are from the curated knowledge base. Use ALL relevant sources to answer the question.

IMPORTANT: Do NOT use inline numbered citation markers like [1], [2], [5] in your answer. Write in natural, flowing language. If you need to attribute a specific claim, reference the source naturally within the sentence (e.g., "According to the AAD...", "One study found...", or "As noted by Incidecoder..."). The full source list with titles and URLs will be displayed separately after your answer — you do not need to include URLs in the answer text.

HARD RULE — NO HALLUCINATED PRODUCTS: Never state a specific product or brand name unless it appears verbatim in the provided context. For ingredient-level advice, general knowledge is fine — you can discuss ingredients, their benefits, what to look for, and general product categories. But named brands and specific product recommendations must come strictly from the knowledge base. If the context does not contain any specific product names, give ingredient and routine guidance without inventing brand names from your training data. Do not say things like "Try CeraVe" or "La Roche-Posay" unless those exact brand names are present in the provided context.

STYLE: Keep answers concise and conversational. For simple factual or yes/no questions, limit your response to 3-5 sentences. Prioritize the 1-2 most directly relevant facts from the context rather than listing every retrieved detail. Expand into deeper explanations, mechanisms of action, or combination therapy notes ONLY when the question itself asks for detail (e.g., "explain how it works," "tell me everything about X," or "what are all the options"). Always keep safety-relevant caveats (e.g., blood clotting risks, medical supervision requirements, pregnancy warnings) even in short answers — those are important regardless of length.

Only say "I don't have enough information to answer that." if neither the curated knowledge base nor the live web sources provide enough information.

Always include: This is not medical advice. Please consult a dermatologist for diagnosis or treatment.

Context:
{context}`;

type Source = {
  title: string;
  url: string;
  sourceType: string;
};

type QueryResult = {
  answer: string;
  sources: Source[];
  provider: "openrouter" | "groq";
  usedWebFallback: boolean;
};

function formatDocs(docs: Document[]): string {
  return docs
    .map((doc) => {
      const { title, sourceUrl, sourceType } = doc.metadata;
      const label = sourceType === "web_live"
        ? `${title} (Source: Live web search)`
        : `${title} (${sourceType})`;
      return `Source: ${label}\nURL: ${sourceUrl}\n\n${doc.pageContent}`;
    })
    .join("\n\n---\n\n");
}

function buildChain(
  model: ChatOpenAI | ChatGroq | ChatGoogleGenerativeAI,
  contextDocs: Document[]
) {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ["human", "{question}"],
  ]);

  const context = formatDocs(contextDocs);

  return RunnableSequence.from([
    {
      question: (input: { question: string }) => input.question,
      context: () => context,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);
}

function normalizeAnswerSpacing(text: string): string {
  let normalized = text;

  // Fix camelCase word joins: "Oraltranexamic" -> "Oral tranexamic"
  // Insert space between a lowercase letter and an uppercase letter.
  normalized = normalized.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Fix specific known word-join issues. These are exact whole-word replacements
  // for cases where the LLM omits the space between a short word and a following word.
  const knownJoins: Record<string, string> = {
    // Possessive "its" + noun
    itseffects: "its effects",
    itsbenefits: "its benefits",
    itsuses: "its uses",
    itsrole: "its role",
    itsfunction: "its function",
    itsmechanism: "its mechanism",
    itsaction: "its action",
    itsapplication: "its application",
    itspotential: "its potential",
    itsability: "its ability",

    // "and" + common following words
    andthe: "and the",
    andits: "and its",
    andthis: "and this",
    andthat: "and that",
    andthese: "and these",
    andthose: "and those",
    andthere: "and there",
    andthey: "and they",
    andtheir: "and their",
    andwith: "and with",
    andfor: "and for",
    andfrom: "and from",
    andwhen: "and when",
    andwhere: "and where",
    andwhile: "and while",
    andbecause: "and because",

    // "of" + article/pronoun
    ofthe: "of the",
    ofits: "of its",
    ofthis: "of this",
    ofthat: "of that",
    ofthese: "of these",
    ofthose: "of those",
    oftheir: "of their",

    // Preposition + article
    inthe: "in the",
    onthe: "on the",
    atthe: "at the",
    forthe: "for the",
    withthe: "with the",
    tothe: "to the",
    asthe: "as the",
    bythe: "by the",
    fromthe: "from the",
    overthe: "over the",
    throughthe: "through the",
    witha: "with a",
  };

  normalized = normalized.replace(
    new RegExp(`\\b(${Object.keys(knownJoins).join("|")})\\b`, "gi"),
    (match) => knownJoins[match.toLowerCase()] ?? match
  );

  // Ensure space after sentence-ending punctuation, except when already spaced.
  normalized = normalized.replace(/([.!?])([A-Z])/g, "$1 $2");

  // Ensure space after comma, semicolon, colon when followed by a letter.
  normalized = normalized.replace(/([,;:])([a-zA-Z])/g, "$1 $2");

  // Collapse multiple spaces and normalize whitespace.
  normalized = normalized.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");

  return normalized.trim();
}

function buildSources(docs: Document[]): Source[] {
  const seen = new Set<string>();
  const sources: Source[] = [];

  for (const doc of docs) {
    const url = doc.metadata.sourceUrl as string;
    if (url && !seen.has(url)) {
      seen.add(url);
      sources.push({
        title: doc.metadata.title as string,
        url,
        sourceType: doc.metadata.sourceType as string,
      });
    }
  }

  return sources;
}

function formatMiniContext(docs: Document[]): string {
  return docs
    .map((doc) => `Title: ${doc.metadata.title}\n${doc.pageContent.slice(0, 800)}`)
    .join("\n\n---\n\n");
}

async function judgeRelevance(
  model: ChatGroq,
  query: string,
  docs: Document[]
): Promise<boolean> {
  if (docs.length === 0) return false;

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a strict relevance judge. Given a user's question and retrieved context, decide if the context is sufficient to answer the question directly and accurately.

Rules:
- Answer YES if the context contains enough information to give a specific, helpful answer.
- Answer NO if the context only tangentially relates to the topic or lacks the specific information requested.
- Answer ONLY with the word YES or NO.`,
    ],
    [
      "human",
      `Question: {question}

Context:
{context}

Can the context answer the question? (YES/NO):`,
    ],
  ]);

  const chain = RunnableSequence.from([
    prompt,
    model,
    new StringOutputParser(),
  ]);

  try {
    const result = await chain.invoke({
      question: query,
      context: formatMiniContext(docs),
    });
    const clean = result.replace(/[^a-zA-Z]/g, "").trim().toUpperCase();
    console.log(`[retrieve] Relevance judge: ${clean}`);
    return clean === "YES";
  } catch (e) {
    console.warn("[retrieve] Relevance judge failed:", e instanceof Error ? e.message : e);
    return false;
  }
}

async function fetchWebResults(
  query: string,
  maxResults: number
): Promise<Document[]> {
  const webDocs: Document[] = [];

  try {
    const searchResults = await searchWeb(query, maxResults);

    for (const result of searchResults) {
      try {
        let title = result.title;
        let content = result.rawContent?.trim();
        let source = "tavily";

        if (!content || content.length < 200) {
          const scraped = await fetchAndClean(result.url);
          if (scraped.markdown && scraped.markdown.trim().length > 0) {
            content = scraped.markdown.trim();
            title = scraped.title || title;
            source = "firecrawl";
          }
        }

        if (!content || content.length === 0) {
          console.warn(`[webFetch] No usable content from ${result.url} (tried Tavily + Firecrawl)`);
          continue;
        }

        console.log(
          `  [web_live] ${source}: ${result.url} (${content.length} chars)`
        );

        webDocs.push(
          new Document({
            pageContent: content.slice(0, 4000),
            metadata: {
              docId: `web_live-${++webLiveCounter}`,
              title,
              sourceUrl: result.url,
              sourceType: "web_live",
              retrievedAt: new Date().toISOString(),
            },
          })
        );
      } catch (e) {
        console.warn(`[webFetch] Failed to scrape ${result.url}:`, e instanceof Error ? e.message : e);
      }
    }
  } catch (e) {
    console.warn("[retrieve] Web search failed:", e instanceof Error ? e.message : e);
  }

  return webDocs;
}

async function classifyMessage(
  query: string
): Promise<
  | { type: "GREETING"; response: string }
  | { type: "SKINCARE_QUESTION" | "OFF_TOPIC" }
> {
  const model = new ChatGroq({
    model: "llama-3.1-8b-instant",
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0,
    maxRetries: 1,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `Classify this message into exactly one category:
- GREETING: a greeting, farewell, thanks, or casual small talk with no actual skincare question
- SKINCARE_QUESTION: a question or request related to skincare, dermatology, ingredients, skin conditions, routines, or beauty products
- OFF_TOPIC: any other question or request unrelated to skincare (general knowledge, other topics, unrelated tasks, etc.)

If GREETING: respond with a JSON object containing a friendly, skincare-branded short reply (no medical disclaimer, no sources). The reply should match the context — greet back warmly for hellos, acknowledge thanks for gratitude, say goodbye for farewells, respond casually for small talk. Always steer toward offering skincare help. Format: {{"type":"GREETING","response":"your reply here"}}

If SKINCARE_QUESTION: respond with {{"type":"SKINCARE_QUESTION"}}

If OFF_TOPIC: respond with {{"type":"OFF_TOPIC"}}

Respond with ONLY the JSON object, no other text.`,
    ],
    ["human", "Message: {message}"],
  ]);

  const chain = RunnableSequence.from([
    prompt,
    model,
    new StringOutputParser(),
  ]);

  try {
    const result = await chain.invoke({ message: query });
    const clean = result
      .trim()
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "");
    return JSON.parse(clean);
  } catch (e) {
    console.warn(
      "[retrieve] Intent classification failed:",
      e instanceof Error ? e.message : e
    );
    return { type: "SKINCARE_QUESTION" };
  }
}

export async function answerQuery(query: string): Promise<QueryResult> {
  const classification = await classifyMessage(query);

  if (classification.type === "GREETING") {
    console.log("[retrieve] Detected greeting via LLM, skipping RAG pipeline");
    return {
      answer:
        classification.response ||
        "Hi! I'm your skincare assistant — how can I help you today?",
      sources: [],
      provider: "groq",
      usedWebFallback: false,
    };
  }

  if (classification.type === "OFF_TOPIC") {
    console.log("[retrieve] Detected off-topic via LLM, skipping RAG pipeline");
    return {
      answer:
        "I'm specifically designed to help with skincare-related questions — things like ingredients, routines, skin conditions, or product recommendations. Is there something skincare-related I can help you with?",
      sources: [],
      provider: "groq",
      usedWebFallback: false,
    };
  }

  const vectorStore = await getVectorStore();

  const scoredResults = await vectorStore.similaritySearchWithScore(query, 4);
  const kbDocs = scoredResults.map(([doc]) => doc);
  const scores = scoredResults.map(([, score]) => score);

  const topScore = scores[0] ?? 0;

  let allDocs = [...kbDocs];
  let usedWebFallback = false;

  const needsFallback = await (async () => {
    const judgeModel = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0,
    });

    if (topScore < LOW_SCORE_THRESHOLD) {
      console.log(
        `[retrieve] Low similarity score (${topScore.toFixed(3)} < ${LOW_SCORE_THRESHOLD}), checking relevance`
      );
      const isRelevant = await judgeRelevance(judgeModel, query, kbDocs);
      return !isRelevant;
    }
    if (topScore >= HIGH_SCORE_THRESHOLD) {
      return false;
    }
    console.log(
      `[retrieve] Moderate similarity score (${topScore.toFixed(3)}), checking relevance`
    );
    const isRelevant = await judgeRelevance(judgeModel, query, kbDocs);
    return !isRelevant;
  })();

  if (needsFallback) {
    console.log(
      `[retrieve] Falling back to live web search (low KB confidence — top score: ${topScore.toFixed(3)})`
    );
    usedWebFallback = true;
    const webDocs = await fetchWebResults(query, WEB_FALLBACK_MAX_RESULTS);
    allDocs = [...kbDocs, ...webDocs];
  } else {
    console.log(`[retrieve] KB confidence sufficient — top score: ${topScore.toFixed(3)}`);
  }

  const primaryModel = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0.2,
    maxRetries: 2,
  });

  const openRouterModel = new ChatOpenAI({
    model: "meta-llama/llama-3.3-70b-instruct:free",
    apiKey: process.env.OPENROUTER_API_KEY,
    temperature: 0.2,
    maxRetries: 2,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });

  const geminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.2,
    maxRetries: 2,
  });

  try {
    const chain = buildChain(primaryModel, allDocs);
    const rawAnswer = await chain.invoke({ question: query });
    const answer = normalizeAnswerSpacing(rawAnswer);
    console.log("[retrieve] Answered via: Groq");
    return {
      answer,
      sources: buildSources(allDocs),
      provider: "groq",
      usedWebFallback,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn("[retrieve] Groq failed:", reason);
    console.log("[retrieve] OpenRouter fallback triggered");

    try {
      const chain = buildChain(openRouterModel, allDocs);
      const rawAnswer = await chain.invoke({ question: query });
      const answer = normalizeAnswerSpacing(rawAnswer);
      console.log("[retrieve] Answered via: OpenRouter");
      return {
        answer,
        sources: buildSources(allDocs),
        provider: "openrouter",
        usedWebFallback,
      };
    } catch (openRouterError) {
      const orReason = openRouterError instanceof Error ? openRouterError.message : String(openRouterError);
      const isModelGone = /404|model.*not.*found|unavailable|invalid.*model/i.test(orReason);
      if (isModelGone) {
        console.error("[retrieve] OpenRouter model may have rotated — check https://openrouter.ai/models for current free models. Error:", orReason);
      } else {
        console.warn("[retrieve] OpenRouter failed:", orReason);
      }
      console.log("[retrieve] Gemini fallback triggered");

      try {
        const chain = buildChain(geminiModel, allDocs);
        const rawAnswer = await chain.invoke({ question: query });
        const answer = normalizeAnswerSpacing(rawAnswer);
        console.log("[retrieve] Answered via: Gemini");
        return {
          answer,
          sources: buildSources(allDocs),
          provider: "openrouter",
          usedWebFallback,
        };
      } catch (geminiError) {
        const gReason = geminiError instanceof Error ? geminiError.message : String(geminiError);
        console.error("[retrieve] All providers (Groq, OpenRouter, Gemini) failed:", gReason);
        return {
          answer: "I'm sorry, I'm having technical difficulties right now. Please try again in a moment.",
          sources: buildSources(allDocs),
          provider: "openrouter",
          usedWebFallback,
        };
      }
    }
  }
}
