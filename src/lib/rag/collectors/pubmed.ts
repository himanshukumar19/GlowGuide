import type { RawDoc } from "./types";

/**
 * Collect documents from PubMed via NCBI E-utilities API.
 *
 * @param query - Search term (e.g. "retinoid dermatitis")
 * @param maxResults - Maximum number of articles to fetch (default 20)
 * @returns Array of RawDoc from PubMed
 */
export async function collectFromPubMed(
  query: string,
  maxResults: number = 20
): Promise<RawDoc[]> {
  // TODO: Implement PubMed collection
  // 1. Call esearch.fcgi to get PMIDs
  // 2. Call efetch.fcgi to get abstracts (XML)
  // 3. Parse XML into RawDoc[]
  // 4. Use NCBI_API_KEY from env if available for higher rate limits
  throw new Error("Not implemented");
}
