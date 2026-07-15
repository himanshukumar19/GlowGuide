import type { RawDoc } from "./types";

/**
 * Collect documents/datasets from Kaggle.
 *
 * @param datasetSlug - Kaggle dataset slug (e.g. "owner/dataset-name")
 * @param maxFiles - Max number of files to process from the dataset
 * @returns Array of RawDoc from Kaggle dataset files
 */
export async function collectFromKaggle(
  datasetSlug: string,
  maxFiles: number = 10
): Promise<RawDoc[]> {
  // TODO: Implement Kaggle collection
  // 1. Use Kaggle CLI or API to download dataset
  // 2. Parse CSV/JSON files into RawDoc
  // 3. Use KAGGLE_USERNAME and KAGGLE_KEY from env
  throw new Error("Not implemented");
}
