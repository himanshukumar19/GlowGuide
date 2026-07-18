export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { join } from "path";
import { Document } from "@langchain/core/documents";
import { QdrantClient } from "@qdrant/js-client-rest";

const UPLOADS_DIR = join(__dirname, "..", "data", "manual-uploads");

async function main() {
  const { resetCollection, getVectorStore } = await import(
    "../src/lib/rag/vectorstore"
  );
  const { loadManualDocs } = await import(
    "../src/lib/rag/loaders/manualDocLoader"
  );
  const { chunkDocument } = await import("../src/lib/rag/chunking");

  // 1. Wipe the collection
  console.log("=== Step 1: Reset collection ===\n");
  await resetCollection();

  // 2. Load all .txt documents
  console.log("\n=== Step 2: Load documents ===\n");
  console.log("Loading from:", UPLOADS_DIR);

  const txtDocs = loadManualDocs(UPLOADS_DIR);
  console.log(`Loaded ${txtDocs.length} .txt document(s)`);
  for (const doc of txtDocs) {
    console.log(`  [txt] ${doc.metadata.title}`);
  }

  const { loadCsvDocs } = await import("../src/lib/rag/loaders/csvLoader");
  const csvDocs = await loadCsvDocs(UPLOADS_DIR);
  console.log(`Loaded ${csvDocs.length} .csv-derived document(s) (one per row)`);
  if (csvDocs.length > 0) {
    const fileCounts = new Map<string, number>();
    for (const d of csvDocs) {
      const docId = (d.metadata as any).docId ?? "";
      const filename = docId.split("-row-")[0] ?? docId;
      fileCounts.set(filename, (fileCounts.get(filename) ?? 0) + 1);
    }
    for (const [filename, count] of fileCounts) {
      console.log(`  [csv] ${filename} — ${count} row(s)`);
    }
  }

  // Deduplicate by docId (across multiple CSV loads)
  const seen = new Set<string>();
  const deduped: Document[] = [];
  for (const doc of [...txtDocs, ...csvDocs]) {
    const id = (doc.metadata as any).docId ?? "";
    if (id && seen.has(id)) continue;
    if (id) seen.add(id);
    deduped.push(doc);
  }
  const dupeCount = txtDocs.length + csvDocs.length - deduped.length;
  if (dupeCount > 0) console.log(`Removed ${dupeCount} duplicate docId(s)`);

  const docs = deduped;
  console.log(`\nTotal: ${txtDocs.length} .txt + ${csvDocs.length} .csv-derived = ${docs.length} Document(s)`);

  // 3. Chunk each document
  console.log("\n=== Step 3: Chunk documents ===\n");
  const chunkResults = await Promise.all(
    docs.map((doc) => chunkDocument(doc))
  );
  const allChunks = chunkResults.flat();
  console.log(`Created ${allChunks.length} chunk(s) from ${docs.length} document(s)`);

  // 4. Convert Chunk[] → Document[] and upsert
  console.log("=== Step 4: Embed & upsert into Qdrant ===\n");
  const chunkDocs = allChunks.map(
    (chunk) =>
      new Document({
        pageContent: chunk.text,
        metadata: { ...chunk.metadata, chunkId: chunk.chunkId },
      })
  );

  const vectorStore = await getVectorStore();

  const BATCH_SIZE = 5;
  const BATCH_DELAY_MS = 4000;
  const BACKOFF_DELAYS = [10_000, 20_000, 40_000, 80_000];
  const MAX_RETRIES = BACKOFF_DELAYS.length;

  const totalBatches = Math.ceil(chunkDocs.length / BATCH_SIZE);
  let totalUpserted = 0;
  let totalSkipped = 0;
  const upsertedDocIds: string[] = [];
  const skippedDocIds: string[] = [];

  for (let i = 0; i < chunkDocs.length; i += BATCH_SIZE) {
    const batch = chunkDocs.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const rangeStart = i + 1;
    const rangeEnd = Math.min(i + BATCH_SIZE, chunkDocs.length);
    const batchDocIds = batch.map((d) => (d.metadata as any).docId ?? "unknown");

    let embedded = false;

    for (let retry = 0; retry <= MAX_RETRIES; retry++) {
      try {
        await vectorStore.addDocuments(batch);
        embedded = true;
        break;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (retry < MAX_RETRIES) {
          const delay = BACKOFF_DELAYS[retry];
          console.warn(
            `  Batch ${batchNum}/${totalBatches} (docs ${rangeStart}-${rangeEnd}) attempt ${retry + 1} failed (${msg.slice(0, 80)}). Retrying in ${delay / 1000}s...`
          );
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    if (embedded) {
      totalUpserted += batch.length;
      upsertedDocIds.push(...batchDocIds);
      console.log(
        `  Batch ${batchNum}/${totalBatches} (docs ${rangeStart}-${rangeEnd}) embedded successfully`
      );
    } else {
      totalSkipped += batch.length;
      skippedDocIds.push(...batchDocIds);
      console.warn(
        `  Batch ${batchNum}/${totalBatches} (docs ${rangeStart}-${rangeEnd}) FAILED after ${MAX_RETRIES} retries, skipping ${batch.length} document(s)`
      );
    }

    if (i + BATCH_SIZE < chunkDocs.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  // Summary
  console.log("\n=== Embed/Upsert Summary ===");
  console.log(`  Total chunks attempted:  ${chunkDocs.length}`);
  console.log(`  Successfully stored:     ${totalUpserted}`);
  console.log(`  Skipped due to failures: ${totalSkipped}`);
  if (skippedDocIds.length > 0) {
    console.log(`  Skipped docIds (${skippedDocIds.length}):`);
    for (const id of skippedDocIds) {
      console.log(`    - ${id}`);
    }
  }

  // 5. Verify: count and preview
  console.log("\n=== Step 5: Verify ===\n");
  const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });

  const count = await client.count("skincare_chunks", { exact: true });
  console.log(`📊 Total points in collection: ${count.count}\n`);

  const scrollResult = await client.scroll("skincare_chunks", {
    limit: 20,
    with_payload: true,
    with_vector: false,
  });

  console.log("Content previews:");
  for (const point of scrollResult.points) {
    const payload = point.payload as Record<string, any> | undefined;
    const text = payload?.text ?? payload?.pageContent ?? payload?.content ?? "";
    const preview = String(text).slice(0, 100).replace(/\n/g, " ");
    console.log(`  [id: ${point.id}] ${preview}...`);
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
