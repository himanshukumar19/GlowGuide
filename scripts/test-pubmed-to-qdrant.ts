export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Document } from "@langchain/core/documents";

async function main() {
  const { collectFromPubMed } = await import(
    "../src/lib/rag/collectors/pubmed"
  );
  const { parseDocuments } = await import(
    "../src/lib/rag/loaders/parseDocument"
  );
  const { chunkDocument } = await import("../src/lib/rag/chunking");
  const { getVectorStore } = await import("../src/lib/rag/vectorstore");

  // 1. Collect from PubMed
  console.log('Querying PubMed: "vitamin C skin" (retmax: 2)...');
  const rawDocs = await collectFromPubMed("vitamin C skin", { retmax: 2 });
  console.log(`Collected ${rawDocs.length} RawDoc(s)\n`);

  if (rawDocs.length === 0) {
    console.log("No results from PubMed. Exiting.");
    return;
  }

  for (let i = 0; i < rawDocs.length; i++) {
    console.log(`  RawDoc ${i + 1}: "${rawDocs[i].title.slice(0, 80)}..."`);
  }

  // 2. Parse RawDocs → Documents
  const docs = parseDocuments(rawDocs);
  console.log(`\nParsed ${docs.length} Document(s)\n`);

  // 3. Chunk each Document
  const chunkResults = await Promise.all(
    docs.map((doc) => chunkDocument(doc))
  );
  const allChunks = chunkResults.flat();
  console.log(`Created ${allChunks.length} chunk(s) from ${docs.length} document(s)`);

  if (allChunks.length === 0) {
    console.log("\nNo chunks produced. Nothing to upsert.");
    return;
  }

  // 4. Convert Chunk[] → Document[] for the vector store
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

  // 5. Upsert into Qdrant
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
