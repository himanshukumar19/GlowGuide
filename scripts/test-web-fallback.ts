export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { getVectorStore } = await import("../src/lib/rag/vectorstore");
  const { answerQuery } = await import("../src/lib/rag/retrieve");

  const missingKeys: string[] = [];
  if (!process.env.TAVILY_API_KEY) missingKeys.push("TAVILY_API_KEY");
  if (!process.env.FIRECRAWL_API_KEY) missingKeys.push("FIRECRAWL_API_KEY");

  if (missingKeys.length > 0) {
    console.warn(
      `\nWARNING: Missing env vars: ${missingKeys.join(", ")}\n` +
      "Web fallback will be skipped. Add these to .env.local to enable live web search.\n"
    );
  }

  const question =
    process.argv[2] ??
    "what is the latest trending skincare ingredient on TikTok in July 2026?";

  console.log("Question:", question);
  console.log();

  // Show similarity scores before running full pipeline
  const vectorStore = await getVectorStore();
  const scored = await vectorStore.similaritySearchWithScore(question, 4);
  console.log("=== KB Similarity Scores ===");
  for (const [doc, score] of scored) {
    console.log(`  ${score.toFixed(4)} — ${doc.metadata.title}`);
  }
  console.log();

  const result = await answerQuery(question);

  console.log("\n=== Answer ===\n");
  console.log(result.answer);

  console.log("\n=== Sources ===\n");
  for (const src of result.sources) {
    const tag = src.sourceType === "web_live" ? " [LIVE WEB]" : "";
    console.log(`- ${src.title}${tag}`);
  }

  console.log("\n=== Meta ===");
  console.log("Provider:", result.provider);
  console.log("Used web fallback:", result.usedWebFallback);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
