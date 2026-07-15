import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "../embeddings";

export async function getVectorStore(): Promise<QdrantVectorStore> {
  return new QdrantVectorStore(embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: "skincare_chunks",
  });
}
