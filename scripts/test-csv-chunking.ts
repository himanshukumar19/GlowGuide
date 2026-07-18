export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { join } from "path";

const UPLOADS_DIR = join(__dirname, "..", "data", "manual-uploads");

async function main() {
  const { loadCsvDocs } = await import("../src/lib/rag/loaders/csvLoader");
  const { chunkDocument } = await import("../src/lib/rag/chunking");

  console.log("Loading CSV docs from:", UPLOADS_DIR);
  const docs = await loadCsvDocs(UPLOADS_DIR);
  console.log(`Loaded ${docs.length} Document(s) (one per CSV row)\n`);

  if (docs.length === 0) {
    console.log("No CSV files found.");
    return;
  }

  console.log("--- docs[0] ---");
  console.log("docId:", docs[0].metadata.docId);
  console.log("title:", docs[0].metadata.title);
  console.log("sourceType:", docs[0].metadata.sourceType);
  console.log("pageContent:", docs[0].pageContent);
  console.log("");

  if (docs.length > 1) {
    console.log("--- docs[1] ---");
    console.log("docId:", docs[1].metadata.docId);
    console.log("pageContent:", docs[1].pageContent);
    console.log("");
  }

  console.log("Chunking docs[0]...");
  const chunks = await chunkDocument(docs[0]);
  console.log(`Produced ${chunks.length} chunk(s)`);
  console.log(
    `Expected: >0 chunks — ${chunks.length > 0 ? "PASS" : "FAIL"}`
  );
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
