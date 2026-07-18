import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { embeddings } from "../embeddings";

export async function getVectorStore(): Promise<QdrantVectorStore> {
  return new QdrantVectorStore(embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: "skincare_chunks",
  });
}

/**
 * Delete and recreate the "skincare_chunks" collection, wiping all points.
 * Same config: 768-dimensional vectors, Cosine distance.
 */
export async function resetCollection(): Promise<void> {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });

  const collections = await client.getCollections();
  const exists = collections.collections.some((c) => c.name === "skincare_chunks");

  if (exists) {
    await client.deleteCollection("skincare_chunks");
    console.log("[vectorstore] Deleted existing skincare_chunks collection");
  }

  await client.createCollection("skincare_chunks", {
    vectors: { size: 768, distance: "Cosine" },
  });
  console.log("[vectorstore] Created fresh skincare_chunks collection (768d, Cosine)");
}
