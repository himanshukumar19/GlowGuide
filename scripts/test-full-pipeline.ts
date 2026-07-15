export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { join } from "path";
import { Document } from "@langchain/core/documents";

const UPLOADS_DIR = join(__dirname, "..", "data", "manual-uploads");

async function main() {
  // Dynamic imports so env vars are loaded first
  const { loadManualDocs } = await import("../src/lib/rag/loaders/manualDocLoader");
  const { chunkDocument } = await import("../src/lib/rag/chunking");
  const { getVectorStore } = await import("../src/lib/rag/vectorstore");

  // 1. Load raw documents
  console.log("Loading documents from:", UPLOADS_DIR);
  const docs = loadManualDocs(UPLOADS_DIR);
  console.log(`Loaded ${docs.length} document(s)\n`);

  // 2. Chunk each document (chunkDocument is async now)
  const chunkResults = await Promise.all(docs.map((doc) => chunkDocument(doc)));
  const allChunks = chunkResults.flat();
  console.log(`Created ${allChunks.length} chunk(s) from ${docs.length} document(s)`);

  if (allChunks.length === 0) {
    console.log("\nNo chunks produced — chunking stubs return []. Nothing to upsert.");
    console.log("Once splitMarkdown/tableChunker are implemented, this will work end-to-end.");
    return;
  }

  // 3. Convert Chunk[] → Document[] for the vector store
  const chunkDocs = allChunks.map(
    (chunk) =>
      new Document({
        pageContent: chunk.text,
        metadata: {
          ...chunk.metadata,
          chunkId: chunk.chunkId,
        },
      })
  );

  // 4. Upsert into Qdrant (embedding happens automatically)
  console.log("\nConnecting to Qdrant...");
  const vectorStore = await getVectorStore();

  console.log(`Adding ${chunkDocs.length} chunk(s) to "skincare_chunks" collection...`);
  await vectorStore.addDocuments(chunkDocs);

  console.log("\nDone. Chunks embedded and stored in Qdrant.");
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
