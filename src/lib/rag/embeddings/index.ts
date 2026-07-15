import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const EXPECTED_DIM = 768;

class DimensionValidatedEmbeddings extends GoogleGenerativeAIEmbeddings {
  private verified = false;

  private validate(vector: number[]): number[] {
    if (!this.verified) {
      if (vector.length !== EXPECTED_DIM) {
        console.warn(
          `[embeddings] gemini-embedding-001 returned ${vector.length}d, expected ${EXPECTED_DIM}d. Truncating.`
        );
      }
      this.verified = true;
    }
    return vector.length > EXPECTED_DIM
      ? vector.slice(0, EXPECTED_DIM)
      : vector;
  }

  private validateBatch(vectors: number[][]): number[][] {
    if (!this.verified && vectors.length > 0) {
      this.validate(vectors[0]);
    }
    return vectors.map((v) =>
      v.length > EXPECTED_DIM ? v.slice(0, EXPECTED_DIM) : v
    );
  }

  async embedQuery(document: string): Promise<number[]> {
    return this.validate(await super.embedQuery(document));
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return this.validateBatch(await super.embedDocuments(documents));
  }
}

// gemini-embedding-001 outputs 768-dimensional vectors by default,
// matching our Qdrant "skincare_chunks" collection dimension.
// The wrapper validates on first use and truncates if the model
// ever returns a larger vector (defensive guard).
export const embeddings = new DimensionValidatedEmbeddings({
  model: "gemini-embedding-001",
  apiKey: process.env.GEMINI_API_KEY,
});
