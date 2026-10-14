export {};

/**
 * slow-resume-ingestion.ts
 *
 * A rate-limit-safe ingestion script that:
 *  - Skips already-stored docs (safe to re-run)
 *  - Uses GEMINI_INGESTION_API_KEY (separate quota)
 *  - Embeds ONE doc at a time (1 API call per batch)
 *  - Waits 15 seconds between each call (4 RPM → well under free-tier limit)
 *  - Full exponential backoff on failures
 *  - Prints live progress + final summary
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { join } from "path";
import { Document } from "@langchain/core/documents";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";

const UPLOADS_DIR = join(__dirname, "..", "data", "manual-uploads");
const COLLECTION = "skincare_chunks";
const BATCH_SIZE = 1;          // one doc at a time — safest for rate limits
const BATCH_DELAY_MS = 15_000; // 15s between each embedding call (~4 RPM)
const BACKOFF_DELAYS = [30_000, 60_000, 120_000, 240_000]; // up to 4 min
const MAX_RETRIES = BACKOFF_DELAYS.length;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getStoredDocIds(client: QdrantClient): Promise<Set<string>> {
  const ids = new Set<string>();
  let offset: any = null;

  while (true) {
    const params: any = {
      limit: 500,
      with_payload: ["metadata"],
      with_vector: false,
    };
    if (offset !== null) params.offset = offset;

    const result = await client.scroll(COLLECTION, params);

    for (const point of result.points) {
      const payload = point.payload as Record<string, any> | undefined;
      // Handle both metadata.docId and top-level docId in payload
      const docId =
        payload?.metadata?.docId ??
        payload?.docId ??
        null;
      if (docId) ids.add(String(docId));
    }

    const nextOffset = result.next_page_offset;
    if (!nextOffset) break;
    offset = nextOffset;
  }

  return ids;
}

async function main() {
  const ingestionKey = process.env.GEMINI_INGESTION_API_KEY;
  if (!ingestionKey) {
    throw new Error("GEMINI_INGESTION_API_KEY env var required");
  }

  // ── Step 1: Connect & fetch stored docIds ────────────────────────────────
  console.log("=== Step 1: Fetch stored docIds from Qdrant ===\n");
  const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });

  const info = await client.getCollection(COLLECTION);
  console.log(`Collection "${COLLECTION}" — current points: ${info.points_count}`);

  const storedDocIds = await getStoredDocIds(client);
  console.log(`Found ${storedDocIds.size} already-stored docId(s) in Qdrant\n`);

  // ── Step 2: Load all documents ───────────────────────────────────────────
  console.log("=== Step 2: Load documents ===\n");
  const { loadManualDocs } = await import("../src/lib/rag/loaders/manualDocLoader");
  const { loadCsvDocs } = await import("../src/lib/rag/loaders/csvLoader");

  const txtDocs = loadManualDocs(UPLOADS_DIR);
  console.log(`Loaded ${txtDocs.length} .txt document(s)`);

  const csvDocs = await loadCsvDocs(UPLOADS_DIR);
  console.log(`Loaded ${csvDocs.length} .csv-derived document(s)`);

  const allDocs = [...txtDocs, ...csvDocs];

  // ── Step 3: Filter out already-stored docs ───────────────────────────────
  console.log("\n=== Step 3: Filter already-stored documents ===\n");
  const missingDocs: Document[] = [];
  let skippedCount = 0;

  for (const doc of allDocs) {
    const docId = (doc.metadata as any).docId as string;
    if (docId && storedDocIds.has(docId)) {
      skippedCount++;
      continue;
    }
    missingDocs.push(doc);
  }

  console.log(`  Already in Qdrant:   ${skippedCount}`);
  console.log(`  To ingest:           ${missingDocs.length}`);
  console.log(`  Total loaded:        ${allDocs.length}`);

  if (missingDocs.length === 0) {
    console.log("\n✅ Nothing to ingest — all documents already in Qdrant.");
    const finalCount = await client.count(COLLECTION, { exact: true });
    console.log(`📊 Final point count: ${finalCount.count}`);
    return;
  }

  // ── Step 4: Chunk only missing docs ─────────────────────────────────────
  console.log("\n=== Step 4: Chunk missing documents ===\n");
  const { chunkDocument } = await import("../src/lib/rag/chunking");
  const chunkResults = await Promise.all(missingDocs.map((doc) => chunkDocument(doc)));
  const allChunks = chunkResults.flat();
  console.log(`Created ${allChunks.length} chunk(s) from ${missingDocs.length} missing document(s)`);

  const chunkDocs = allChunks.map(
    (chunk) =>
      new Document({
        pageContent: chunk.text,
        metadata: { ...chunk.metadata, chunkId: chunk.chunkId },
      })
  );

  // ── Step 5: Embed & upsert (slow, rate-limit-safe) ──────────────────────
  console.log(`\n=== Step 5: Embed & upsert (${BATCH_SIZE} doc/batch, ${BATCH_DELAY_MS / 1000}s delay) ===\n`);

  const { createEmbeddings } = await import("../src/lib/rag/embeddings");
  const ingestionEmbeddings = createEmbeddings(ingestionKey);
  const vectorStore = new QdrantVectorStore(ingestionEmbeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: COLLECTION,
  });

  const totalBatches = Math.ceil(chunkDocs.length / BATCH_SIZE);
  let totalUpserted = 0;
  let totalFailed = 0;
  const failedDocIds: string[] = [];
  const startTime = Date.now();

  for (let i = 0; i < chunkDocs.length; i += BATCH_SIZE) {
    const batch = chunkDocs.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const rangeEnd = Math.min(i + BATCH_SIZE, chunkDocs.length);
    const batchDocIds = batch.map((d) => (d.metadata as any).docId ?? "unknown");

    // ETA calculation
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = batchNum / elapsed; // batches per second
    const remaining = totalBatches - batchNum;
    const etaSecs = rate > 0 ? Math.round(remaining / rate) : 0;
    const etaStr = etaSecs > 60
      ? `${Math.floor(etaSecs / 60)}m ${etaSecs % 60}s`
      : `${etaSecs}s`;

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
            `  [${batchNum}/${totalBatches}] attempt ${retry + 1} failed (${msg.slice(0, 60)}). Backoff ${delay / 1000}s...`
          );
          await sleep(delay);
        }
      }
    }

    if (embedded) {
      totalUpserted += batch.length;
      if (batchNum % 10 === 0 || batchNum === 1) {
        console.log(`  ✅ [${batchNum}/${totalBatches}] chunk ${rangeEnd} — ETA: ${etaStr}`);
      }
    } else {
      totalFailed += batch.length;
      failedDocIds.push(...batchDocIds);
      console.warn(`  ❌ [${batchNum}/${totalBatches}] chunk ${rangeEnd} FAILED after all retries`);
    }

    if (i + BATCH_SIZE < chunkDocs.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const finalCount = await client.count(COLLECTION, { exact: true });

  console.log("\n=== Slow Resume Summary ===");
  console.log(`  Already in Qdrant (skipped): ${skippedCount}`);
  console.log(`  New chunks attempted:        ${chunkDocs.length}`);
  console.log(`  Successfully stored:         ${totalUpserted}`);
  console.log(`  Failed (skipped):            ${totalFailed}`);
  console.log(`\n📊 Total points in collection: ${finalCount.count}`);

  if (failedDocIds.length > 0) {
    console.log(`\n  Failed docIds (${failedDocIds.length}):`);
    for (const id of failedDocIds.slice(0, 20)) {
      console.log(`    - ${id}`);
    }
    if (failedDocIds.length > 20) {
      console.log(`    ... and ${failedDocIds.length - 20} more`);
    }
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
