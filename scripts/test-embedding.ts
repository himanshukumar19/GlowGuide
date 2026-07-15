export {};

/**
 * Test script for verifying the embedding pipeline.
 *
 * Usage:
 *   npx tsx scripts/test-embedding.ts
 *
 * Sends a test text through the embedding function and prints results.
 */

// async function main() {
//   // TODO: Implement embedding test
//   // 1. Import embedDocuments and embedQuery from lib/embeddings/gemini
//   // 2. Test embedQuery with a sample skincare question
//   // 3. Test embedDocuments with a small batch of sample texts
//   // 4. Print embedding dimensions, sample values, and timing
//   // 5. Verify the output shape matches expectations (e.g. 768-dim vectors)

//   console.log("Embedding test not yet implemented.");
//   console.log("Expected flow:");
//   console.log("  1. embedQuery('What is retinol?') -> number[]");
//   console.log("  2. embedDocuments(['text1', 'text2']) -> number[][]");
//   console.log("  3. Verify dimensions and non-zero values");
// }

// main().catch(console.error);

import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    console.log("Testing Gemini API key...");

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: "Niacinamide is a form of vitamin B3 used in skincare.",
      config: {
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: 768,
      },
    });

    const embedding = response.embeddings?.[0]?.values;

    if (embedding && embedding.length > 0) {
      console.log("✅ API key is working!");
      console.log("Embedding length:", embedding.length);
      console.log("First 5 values:", embedding.slice(0, 5));
    } else {
      console.log("⚠️ Got a response but no embedding values found:", response);
    }
  } catch (error) {
    console.error("❌ API key test failed:");
    console.error(error);
  }
}

test();