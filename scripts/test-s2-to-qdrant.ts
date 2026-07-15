export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Document } from "@langchain/core/documents";

async function main() {
  const { collectFromSemanticScholar } = await import(
    "../src/lib/rag/collectors/semanticScholar"
  );
  const { chunkDocument } = await import("../src/lib/rag/chunking");
  const { getVectorStore } = await import("../src/lib/rag/vectorstore");

  // 1. Collect from Semantic Scholar (returns Document[] directly)
  console.log('Querying Semantic Scholar: "retinol skin aging" (limit: 2)...');
  const docs = await collectFromSemanticScholar("retinol skin aging", { limit: 2 });
  console.log(`Collected ${docs.length} Document(s)\n`);

  if (docs.length === 0) {
    console.log("No results from Semantic Scholar. Exiting.");
    return;
  }

  for (let i = 0; i < docs.length; i++) {
    console.log(`  Doc ${i + 1}: "${(docs[i].metadata.title as string).slice(0, 80)}..."`);
  }

  // 2. Chunk each Document
  const chunkResults = await Promise.all(
    docs.map((doc) => chunkDocument(doc))
  );
  const allChunks = chunkResults.flat();
  console.log(`\nCreated ${allChunks.length} chunk(s) from ${docs.length} document(s)`);

  if (allChunks.length === 0) {
    console.log("\nNo chunks produced. Nothing to upsert.");
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

  // 4. Upsert into Qdrant
  console.log("\nConnecting to Qdrant...");
  const vectorStore = await getVectorStore();

  console.log(
    `Adding ${chunkDocs.length} chunk(s) to "skincare_chunks" collection...`
  );
  await vectorStore.addDocuments(chunkDocs);

  console.log(`\nDone. Upserted ${chunkDocs.length} point(s) into Qdrant.`);
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
