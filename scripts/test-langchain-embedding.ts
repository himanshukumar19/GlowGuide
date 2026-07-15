export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { embeddings } = await import("../src/lib/rag/embeddings");

  console.log("Testing LangChain GoogleGenerativeAIEmbeddings...\n");

  const vector = await embeddings.embedQuery("test skincare query");

  console.log(`Vector length: ${vector.length}`);
  console.log(`Expected:      768`);
  console.log(`Match:         ${vector.length === 768 ? "YES" : "NO"}`);
  console.log(`First 5 vals:  [${vector.slice(0, 5).map((v) => v.toFixed(6)).join(", ")}]`);
}

main().catch(console.error);
