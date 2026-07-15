import type { RawDoc } from "./types";

/**
 * Collect datasets/documents from Hugging Face Hub.
 *
 * @param datasetId - HF dataset identifier (e.g. "skincare-reviews")
 * @param subset - Optional dataset subset/config name
 * @param split - Dataset split to read (default "train")
 * @param maxRows - Maximum rows to fetch (default 100)
 * @returns Array of RawDoc from the dataset
 */
export async function collectFromHuggingFace(
  datasetId: string,
  subset?: string,
  split: string = "train",
  maxRows: number = 100
): Promise<RawDoc[]> {
  // TODO: Implement HuggingFace dataset collection
  // 1. Use HF datasets API or parquet endpoint
  // 2. Stream rows and map to RawDoc
  // 3. Handle pagination if needed
  throw new Error("Not implemented");
}
