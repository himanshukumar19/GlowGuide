import type { RawDoc } from "./types";

/**
 * Collect documents from Semantic Scholar API.
 *
 * @param query - Search term
 * @param limit - Max results (default 20)
 * @returns Array of RawDoc from Semantic Scholar
 */
export async function collectFromSemanticScholar(
  query: string,
  limit: number = 20
): Promise<RawDoc[]> {
  // TODO: Implement Semantic Scholar collection
  // 1. GET https://api.semanticscholar.org/graph/v1/paper/search
  // 2. Fetch abstracts via paper details endpoint
  // 3. Map to RawDoc[]
  // 4. Use SEMANTIC_SCHOLAR_API_KEY from env if available
  throw new Error("Not implemented");
}
