export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Document } from "@langchain/core/documents";

async function main() {
  const { collectFromWeb } = await import(
    "../src/lib/rag/collectors/webFetch"
  );
  const { parseDocument } = await import(
    "../src/lib/rag/loaders/parseDocument"
  );
  const { chunkDocument } = await import("../src/lib/rag/chunking");
  const { getVectorStore } = await import("../src/lib/rag/vectorstore");

  // 1. Collect from web
  console.log('Fetching: https://www.aad.org/public/everyday-care/skin-care-secrets/anti-aging/reduce-premature-aging-skin\n');
  const rawDoc = await collectFromWeb(
    "https://www.aad.org/public/everyday-care/skin-care-secrets/anti-aging/reduce-premature-aging-skin",
    { sourceType: "clinical_education" }
  );
  console.log(`Collected 1 RawDoc: "${rawDoc.title.slice(0, 80)}..." (${rawDoc.text.length} chars)\n`);

  // 2. Parse → Document
  const doc = parseDocument(rawDoc);
  console.log(`Parsed to Document: docId=${doc.metadata.docId}\n`);

  // 3. Chunk
  const chunks = await chunkDocument(doc);
  console.log(`Created ${chunks.length} chunk(s)\n`);

  if (chunks.length === 0) {
    console.log("No chunks produced. Nothing to upsert.");
    return;
  }

  // 4. Convert Chunk[] → Document[] for Qdrant
  const chunkDocs = chunks.map(
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
  console.log("Connecting to Qdrant...");
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
