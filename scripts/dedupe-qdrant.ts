export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { QdrantClient } from "@qdrant/js-client-rest";

const COLLECTION = "skincare_chunks";

async function main() {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });

  const initialCount = await client.count(COLLECTION, { exact: true });
  console.log(`Initial point count: ${initialCount.count}\n`);

  // 1. Scroll all points
  console.log("Scrolling all points...");
  const docIdGroups = new Map<string, string[]>();

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
      const id = String(point.id);
      const payload = point.payload as Record<string, any> | undefined;
      const docId = payload?.metadata?.docId;

      if (docId) {
        const key = String(docId);
        const existing = docIdGroups.get(key);
        if (existing) {
          existing.push(id);
        } else {
          docIdGroups.set(key, [id]);
        }
      }
    }

    const nextOffset = result.next_page_offset;
    if (!nextOffset) break;
    offset = nextOffset;
  }

  const totalDocIds = docIdGroups.size;
  let totalPointsInGroups = 0;
  for (const ids of docIdGroups.values()) {
    totalPointsInGroups += ids.length;
  }

  console.log(`  Total docIds found:   ${totalDocIds}`);
  console.log(`  Total points grouped: ${totalPointsInGroups}`);

  // 2. Identify duplicate groups
  const duplicateGroups: string[][] = [];
  for (const ids of docIdGroups.values()) {
    if (ids.length > 1) duplicateGroups.push(ids);
  }

  console.log(`  Duplicate groups:     ${duplicateGroups.length}`);

  if (duplicateGroups.length === 0) {
    console.log("\nNo duplicates found — nothing to clean up.");
    return;
  }

  // 3. For each group, keep one (prefer deterministic), delete the rest
  console.log("\nResolving duplicates...\n");
  const toDelete: string[] = [];

  for (const ids of duplicateGroups) {
    // Sort: prefer shorter/lexicographically-lower IDs (UUIDs are random;
    // shorter string IDs like bare numbers are deterministic)
    ids.sort((a, b) => {
      if (a.length !== b.length) return a.length - b.length;
      return a.localeCompare(b);
    });
    const keep = ids[0];
    const remove = ids.slice(1);
    toDelete.push(...remove);
    console.log(`  ${ids[0]}: keeping 1, removing ${remove.length} (${remove.join(", ")})`);
  }

  // 4. Delete duplicates in batches
  console.log(`\nDeleting ${toDelete.length} duplicate point(s)...`);
  const DELETE_BATCH = 100;
  for (let i = 0; i < toDelete.length; i += DELETE_BATCH) {
    const batch = toDelete.slice(i, i + DELETE_BATCH);
    await client.delete(COLLECTION, { points: batch });
    console.log(`  Deleted batch ${Math.floor(i / DELETE_BATCH) + 1} (${batch.length} points)`);
  }

  // 5. Final count
  const finalCount = await client.count(COLLECTION, { exact: true });
  console.log(`\n=== Dedup Summary ===`);
  console.log(`  Initial points:    ${initialCount.count}`);
  console.log(`  Duplicate groups:  ${duplicateGroups.length}`);
  console.log(`  Points deleted:    ${toDelete.length}`);
  console.log(`  Final points:      ${finalCount.count}`);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
