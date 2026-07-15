import { Document } from "@langchain/core/documents";
import type { Chunk } from "./types";

/**
 * Extract tables from a Document's pageContent and create dedicated chunks
 * for each table, preserving structure.
 *
 * @param doc - The Document to extract tables from
 * @returns Array of Chunk objects, one per table found
 */
export function chunkTables(doc: Document): Chunk[] {
  // TODO: Implement table chunking
  // 1. Detect markdown tables (lines with | delimiters)
  // 2. Group consecutive table rows into a single chunk
  // 3. Include table caption/context if available
  // 4. Format as: "Table from [title]:\n\n| col1 | col2 |\n|---|---|\n| val1 | val2 |"
  return [];
}
