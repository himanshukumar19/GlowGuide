import type { RawDoc } from "./types";

/**
 * Collect content from a web URL by extracting readable text.
 *
 * @param url - The URL to fetch and parse
 * @param metadata - Optional extra metadata to attach
 * @returns A single RawDoc extracted from the page
 */
export async function collectFromWeb(
  url: string,
  metadata?: Record<string, any>
): Promise<RawDoc> {
  // TODO: Implement web content collection
  // 1. Fetch HTML via fetch()
  // 2. Use @mozilla/readability + jsdom to extract article text
  // 3. Fall back to cheerio for structured extraction
  // 4. Return as RawDoc
  throw new Error("Not implemented");
}

/**
 * Batch-collect from multiple URLs.
 *
 * @param urls - List of URLs to fetch
 * @param concurrency - Max concurrent fetches (default 5)
 * @returns Array of RawDoc (failed URLs are skipped)
 */
export async function collectFromWebBatch(
  urls: string[],
  concurrency: number = 5
): Promise<RawDoc[]> {
  // TODO: Implement batch web collection with concurrency control
  throw new Error("Not implemented");
}
