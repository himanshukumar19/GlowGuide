import { QdrantClient } from "@qdrant/js-client-rest";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

async function test() {
  try {
    console.log("Testing Qdrant connection...");

    // 1. Check connection by listing collections
    const collections = await client.getCollections();
    console.log("✅ Connected to Qdrant!");
    console.log("Existing collections:", collections.collections.map(c => c.name));

    // 2. Create the collection if it doesn't exist
    const exists = collections.collections.some(c => c.name === "skincare_chunks");
    if (!exists) {
      await client.createCollection("skincare_chunks", {
        vectors: { size: 768, distance: "Cosine" },
      });
      console.log("✅ Created collection: skincare_chunks");
    } else {
      console.log("ℹ️ Collection already exists: skincare_chunks");
    }

    // 3. Count total points in the collection
    const count = await client.count("skincare_chunks", { exact: true });
    console.log(`📊 Total points in collection: ${count.count}`);

    // 3b. Debug: scroll all points (--debug or --list flag)
    const debug = process.argv.includes("--debug") || process.argv.includes("--list");
    if (debug) {
      console.log("\n🔍 Debug: scrolling all points...\n");
      const scrollResult = await client.scroll("skincare_chunks", {
        limit: 20,
        with_payload: true,
        with_vector: false,
      });

      for (const point of scrollResult.points) {
        const payload = point.payload as Record<string, any> | undefined;
        const text = payload?.text ?? payload?.pageContent ?? payload?.title ?? JSON.stringify(payload);
        const preview = String(text).slice(0, 120).replace(/\n/g, " ");
        console.log(`  [id: ${point.id}] ${preview}${String(text).length > 120 ? "..." : ""}`);
      }
      console.log(`\n  (showing ${scrollResult.points.length} points)\n`);
    }

    // 4. Insert one test point
    await client.upsert("skincare_chunks", {
      points: [
        {
          id: 1,
          vector: Array(768).fill(0).map(() => Math.random() * 0.1), // dummy vector for now
          payload: { text: "Niacinamide is a form of vitamin B3 used in skincare.", source: "test" },
        },
      ],
    });
    console.log("✅ Inserted a test point");

    // 4. Search for it back
    const results = await client.search("skincare_chunks", {
      vector: Array(768).fill(0).map(() => Math.random() * 0.1),
      limit: 1,
    });
    console.log("✅ Search returned:", results);
  } catch (error) {
    console.error("❌ Qdrant test failed:");
    console.error(error);
  }
}

test();