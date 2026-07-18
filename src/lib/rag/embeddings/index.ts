import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const EXPECTED_DIM = 768;
const QUERY_MAX_RETRIES = 5;
const QUERY_BASE_DELAY_MS = 3000;
const BATCH_MAX_RETRIES = 1;
const BATCH_BASE_DELAY_MS = 5000;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isEmpty(vector: number[]): boolean {
  return vector.length === 0;
}

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
    if (!this.verified && vectors.length > 0 && vectors[0].length > 0) {
      this.validate(vectors[0]);
    }
    return vectors.map((v) =>
      v.length > EXPECTED_DIM ? v.slice(0, EXPECTED_DIM) : v
    );
  }

  async embedQuery(document: string): Promise<number[]> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= QUERY_MAX_RETRIES; attempt++) {
      const result = await super.embedQuery(document);
      if (!isEmpty(result)) return this.validate(result);
      lastError = new Error(
        `[embeddings] embedQuery returned empty vector (attempt ${attempt + 1}/${QUERY_MAX_RETRIES + 1})`
      );
      console.warn(lastError.message);
      if (attempt < QUERY_MAX_RETRIES) {
        const delay = QUERY_BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`[embeddings] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
    throw lastError!;
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= BATCH_MAX_RETRIES; attempt++) {
      const results = await super.embedDocuments(documents);
      const validated = this.validateBatch(results);

      const emptyIndices: number[] = [];
      for (let i = 0; i < validated.length; i++) {
        if (isEmpty(validated[i])) emptyIndices.push(i);
      }

      if (emptyIndices.length === 0) return validated;

      if (attempt < BATCH_MAX_RETRIES) {
        const delay = BATCH_BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `[embeddings] ${emptyIndices.length}/${documents.length} vectors came back empty (attempt ${attempt + 1}/${BATCH_MAX_RETRIES + 1}). Retrying in ${delay}ms...`
        );
        await sleep(delay);
      } else {
        lastError = new Error(
          `[embeddings] ${emptyIndices.length}/${documents.length} vectors still empty after ${BATCH_MAX_RETRIES + 1} attempts`
        );
      }
    }
    throw lastError!;
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

export function createEmbeddings(apiKey: string): DimensionValidatedEmbeddings {
  return new DimensionValidatedEmbeddings({
    model: "gemini-embedding-001",
    apiKey,
  });
}
