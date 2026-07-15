export {};

import { join } from "path";
import { loadManualDocs } from "../src/lib/rag/loaders/manualDocLoader";

const UPLOADS_DIR = join(__dirname, "..", "data", "manual-uploads");

async function main() {
  console.log("Loading manual docs from:", UPLOADS_DIR, "\n");

  const docs = loadManualDocs(UPLOADS_DIR);

  if (docs.length === 0) {
    console.log("No .txt files found.");
    process.exit(0);
  }

  for (const doc of docs) {
    console.log("─".repeat(60));
    console.log(`docId:      ${doc.metadata.docId}`);
    console.log(`title:      ${doc.metadata.title}`);
    console.log(`sourceType: ${doc.metadata.sourceType}`);
    console.log(`sourceUrl:  ${doc.metadata.sourceUrl || "(none)"}`);
    console.log(`content:    ${doc.pageContent.slice(0, 200)}...`);
  }

  console.log("─".repeat(60));
  console.log(`Loaded ${docs.length} document(s).`);
}

main().catch(console.error);
