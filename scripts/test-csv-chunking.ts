export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { join } from "path";

const UPLOADS_DIR = join(__dirname, "..", "data", "manual-uploads");

async function main() {
  const { loadCsvDocs } = await import(
    "../src/lib/rag/loaders/csvLoader"
  );
  const { chunkDocument } = await import("../src/lib/rag/chunking");

  console.log("Loading CSV docs from:", UPLOADS_DIR);
  const docs = loadCsvDocs(UPLOADS_DIR);
  console.log(`Loaded ${docs.length} CSV document(s)\n`);

  if (docs.length === 0) {
    console.log("No CSV files found.");
    return;
  }

  const doc = docs[0];
  console.log("Document metadata:");
  console.log("  docId:", doc.metadata.docId);
  console.log("  title:", doc.metadata.title);
  console.log("  sourceType:", doc.metadata.sourceType);
  console.log("  isTable:", doc.metadata.isTable);
  console.log("  rows count:", (doc.metadata.rows as any[]).length);
  console.log("  headers:", doc.metadata.headers);

  console.log("\nChunking...");
  const chunks = await chunkDocument(doc);

  console.log(`\nProduced ${chunks.length} chunks`);
  console.log(
    `Expected: 20 chunks (one per product row) — ${chunks.length === 20 ? "PASS" : "FAIL"}`
  );

  if (chunks.length > 0) {
    console.log("\n--- chunks[0] ---");
    console.log("chunkId:", chunks[0].chunkId);
    console.log("sectionHeading:", chunks[0].metadata.sectionHeading);
    console.log("text:");
    console.log(chunks[0].text);
    console.log("---");
  }

  if (chunks.length > 1) {
    console.log("\n--- chunks[1] ---");
    console.log("chunkId:", chunks[1].chunkId);
    console.log("sectionHeading:", chunks[1].metadata.sectionHeading);
    console.log("text:");
    console.log(chunks[1].text);
    console.log("---");
  }
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
