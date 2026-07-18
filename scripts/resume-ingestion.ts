export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { join } from "path";
import { Document } from "@langchain/core/documents";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";

const UPLOADS_DIR = join(__dirname, "..", "data", "manual-uploads");
const COLLECTION = "skincare_chunks";
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 4000;
const BACKOFF_DELAYS = [10_000, 20_000, 40_000, 80_000];
const MAX_RETRIES = BACKOFF_DELAYS.length;

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
      const docId = payload?.metadata?.docId;
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
    throw new Error("GEMINI_INGESTION_API_KEY env var required for bulk ingestion");
  }

  // 1. Connect to Qdrant and get already-stored docIds
  console.log("=== Step 1: Fetch stored docIds from Qdrant ===\n");
  const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });
  const storedDocIds = await getStoredDocIds(client);
  console.log(`Found ${storedDocIds.size} already-stored docId(s) in Qdrant\n`);

  // 2. Load all documents
  console.log("=== Step 2: Load documents ===\n");
  const { loadManualDocs } = await import("../src/lib/rag/loaders/manualDocLoader");
  const { loadCsvDocs } = await import("../src/lib/rag/loaders/csvLoader");

  const txtDocs = loadManualDocs(UPLOADS_DIR);
  console.log(`Loaded ${txtDocs.length} .txt document(s)`);

  const csvDocs = await loadCsvDocs(UPLOADS_DIR);
  console.log(`Loaded ${csvDocs.length} .csv-derived document(s)`);

  const allDocs = [...txtDocs, ...csvDocs];

  // 3. Filter out already-stored documents
  console.log("\n=== Step 3: Filter already-stored documents ===\n");
  const missingDocs: Document[] = [];
  let skippedAlreadyPresent = 0;

  for (const doc of allDocs) {
    const docId = (doc.metadata as any).docId as string;
    if (docId && storedDocIds.has(docId)) {
      skippedAlreadyPresent++;
      continue;
    }
    missingDocs.push(doc);
  }

  console.log(`  Already in Qdrant:  ${skippedAlreadyPresent}`);
  console.log(`  Missing (to ingest): ${missingDocs.length}`);
  console.log(`  Total loaded:        ${allDocs.length}`);

  const storedSamples = [...storedDocIds].slice(0, 3);
  console.log(`  Sample stored docIds:    ${storedSamples.join(", ") || "(none)"}`);

  const loadedSamples = allDocs.slice(0, 3).map((d) => (d.metadata as any).docId ?? "(no docId)");
  console.log(`  Sample loaded docIds:    ${loadedSamples.join(", ")}`);

  if (missingDocs.length === 0) {
    console.log("Nothing to ingest — all documents already in Qdrant.");
    return;
  }

  // 4. Chunk only missing documents
  console.log("=== Step 4: Chunk missing documents ===\n");
  const { chunkDocument } = await import("../src/lib/rag/chunking");
  const chunkResults = await Promise.all(
    missingDocs.map((doc) => chunkDocument(doc))
  );
  const allChunks = chunkResults.flat();
  console.log(`Created ${allChunks.length} chunk(s) from ${missingDocs.length} missing document(s)`);

  const chunkDocs = allChunks.map(
    (chunk) =>
      new Document({
        pageContent: chunk.text,
        metadata: { ...chunk.metadata, chunkId: chunk.chunkId },
      })
  );

  // 5. Embed & upsert with ingestion API key
  console.log("\n=== Step 5: Embed & upsert into Qdrant ===\n");
  const { createEmbeddings } = await import("../src/lib/rag/embeddings");
  const ingestionEmbeddings = createEmbeddings(ingestionKey);
  const vectorStore = new QdrantVectorStore(ingestionEmbeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: COLLECTION,
  });

  const totalBatches = Math.ceil(chunkDocs.length / BATCH_SIZE);
  let totalUpserted = 0;
  let totalSkipped = 0;
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

  // 6. Summary
  console.log("\n=== Resume Ingest Summary ===");
  console.log(`  Already in Qdrant:     ${skippedAlreadyPresent}`);
  console.log(`  New chunks attempted:  ${chunkDocs.length}`);
  console.log(`  Newly stored:          ${totalUpserted}`);
  console.log(`  Skipped (failed):      ${totalSkipped}`);
  if (skippedDocIds.length > 0) {
    console.log(`  Failed docIds (${skippedDocIds.length}):`);
    for (const id of skippedDocIds) {
      console.log(`    - ${id}`);
    }
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
