import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";
import { getVectorStore } from "./vectorstore";

const SYSTEM_PROMPT = `You are GlowGuide's skincare assistant. Answer the user's question using ONLY the provided context. If the context does not contain enough information to answer, say "I don't have enough information to answer that."

When referencing information, cite the source by its title and URL.

Always include: This is not medical advice. Please consult a dermatologist for diagnosis or treatment.

Context:
{context}`;

function formatDocs(docs: Document[]): string {
  return docs
    .map((doc, i) => {
      const { title, sourceUrl, sourceType } = doc.metadata;
      return `[${i + 1}] ${title} (${sourceType})\n${sourceUrl}\n${doc.pageContent}`;
    })
    .join("\n\n---\n\n");
}

type QueryResult = {
  answer: string;
  sources: { title: string; url: string }[];
  provider: "gemini" | "groq";
};

function buildChain(model: ChatGoogleGenerativeAI | ChatGroq, retriever: any) {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ["human", "{question}"],
  ]);

  return RunnableSequence.from([
    {
      context: async (input: { question: string }) => {
        const docs = await retriever.invoke(input.question);
        return formatDocs(docs);
      },
      question: (input: { question: string }) => input.question,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);
}

export async function answerQuery(query: string): Promise<QueryResult> {
  const vectorStore = await getVectorStore();
  const retriever = vectorStore.asRetriever({ k: 4 });
  const docs = await retriever.invoke(query);

  const primaryModel = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0.2,
    maxRetries: 2,
  });

  const fallbackModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.2,
    maxRetries: 2,
  });

  try {
    const chain = buildChain(primaryModel, retriever);
    const answer = await chain.invoke({ question: query });
    console.log("[retrieve] Answered via: Groq");
    return {
      answer,
      sources: deduplicateSources(docs),
      provider: "groq",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn("[retrieve] Groq failed:", reason);
    console.log("[retrieve] Gemini fallback triggered");
    const chain = buildChain(fallbackModel, retriever);
    const answer = await chain.invoke({ question: query });
    return {
      answer,
      sources: deduplicateSources(docs),
      provider: "gemini",
    };
  }
}

function deduplicateSources(docs: Document[]): { title: string; url: string }[] {
  return docs
    .map((doc) => ({
      title: doc.metadata.title as string,
      url: doc.metadata.sourceUrl as string,
    }))
    .filter(
      (source, index, arr) =>
        arr.findIndex((s) => s.url === source.url) === index
    );
}
