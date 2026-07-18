export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { join } from "path";
import { readdirSync, statSync } from "fs";

const UPLOADS_DIR = join(__dirname, "..", "data", "manual-uploads");

async function main() {
  // Capture cutoff timestamp BEFORE any downloads
  const cutoff = Date.now();
  console.log(`Cutoff timestamp: ${new Date(cutoff).toISOString()}`);

  const before = new Set(
    readdirSync(UPLOADS_DIR).filter((f) => f.endsWith(".csv"))
  );
  console.log(`Before: ${before.size} existing CSV file(s)\n`);

  // 1. Download from Kaggle
  console.log("=== Step 1: collectFromKaggle ===\n");
  const { collectFromKaggle } = await import(
    "../src/lib/rag/collectors/kaggle"
  );

  const docs = await collectFromKaggle("skincare ingredients", { maxDatasets: 2 });
  console.log(`\nReturned ${docs.length} Document(s) after filtering\n`);

  if (docs.length === 0) {
    console.log("All datasets were filtered out (no suitable CSV, or all >500 rows).");
  }

  for (const d of docs) {
    console.log("--- Collector Document ---");
    console.log("title:", d.metadata.title);
    console.log("ref:", d.metadata.ref);
    console.log("savedPath:", d.metadata.savedPath);
    console.log("allSavedPaths:", d.metadata.allSavedPaths);
    console.log("pageContent empty:", d.pageContent === "");
  }

  // 2. Verify new files using timestamp-based detection
  console.log("\n=== Step 2: Verify download (timestamp-based) ===\n");
  const afterFiles = readdirSync(UPLOADS_DIR).filter((f) => f.endsWith(".csv"));
  const newFiles = afterFiles.filter((f) => {
    const stat = statSync(join(UPLOADS_DIR, f));
    return stat.mtimeMs > cutoff;
  });

  console.log(`After: ${afterFiles.length} CSV file(s), ${newFiles.length} new`);

  for (const f of newFiles) {
    const fullPath = join(UPLOADS_DIR, f);
    const stat = statSync(fullPath);
    console.log(`  NEW: ${f}`);
    console.log(`       size: ${stat.size} bytes`);
    console.log(`       modified: ${stat.mtime.toISOString()}`);
    console.log(
      `       is recent (<2 min): ${Date.now() - stat.mtimeMs < 120_000 ? "YES" : "NO"}`
    );
  }

  console.log(
    `\nReal download confirmed: ${newFiles.length > 0 ? "PASS" : "FAIL"}`
  );

  if (newFiles.length === 0) {
    console.log("No new CSV files — all datasets may have been filtered (>500 rows or no CSV).");
    return;
  }

  // 3. csvLoader picks up the new files
  console.log("\n=== Step 3: loadCsvDocs ===\n");
  const { loadCsvDocs } = await import("../src/lib/rag/loaders/csvLoader");
  const csvDocs = await loadCsvDocs(UPLOADS_DIR);

  // Filter to only the newly downloaded files
  const newDocIds = new Set(newFiles.map((f) => f.replace(".csv", "")));
  const newDocs = csvDocs.filter((doc) => {
    const id = doc.metadata.docId as string;
    return newDocIds.has(id.split("-row-")[0]);
  });

  console.log(`loadCsvDocs: ${csvDocs.length} total, ${newDocs.length} from new files`);

  if (newDocs.length > 0) {
    console.log("--- First new Document ---");
    console.log("docId:", newDocs[0].metadata.docId);
    console.log("pageContent:", newDocs[0].pageContent.slice(0, 200));
  }

  // 4. Chunk
  console.log("\n=== Step 4: chunkDocument ===\n");
  const { chunkDocument } = await import("../src/lib/rag/chunking");
  const chunks = await chunkDocument(newDocs[0]);
  console.log(`chunkDocument produced ${chunks.length} chunk(s)`);
  console.log(`Expected: >0 — ${chunks.length > 0 ? "PASS" : "FAIL"}`);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
