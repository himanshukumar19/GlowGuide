import { Document } from "@langchain/core/documents";
import type { Chunk } from "./types";
import { splitMarkdown } from "./markdownSplitter";
import { chunkTables } from "./tableChunker";

export type { Chunk, ChunkMetadata } from "./types";

/**
 * Chunk a Document into optimally-sized pieces for embedding.
 * Routes .txt-derived documents to markdown splitting only.
 * CSV/table documents are routed to tableChunker (currently stub).
 *
 * @param doc - The Document to chunk
 * @returns Array of Chunk objects
 */
export async function chunkDocument(doc: Document): Promise<Chunk[]> {
  // Check if this is a CSV-derived document (has table metadata)
  const isTable = doc.metadata.sourceType === "csv" || doc.metadata.isTable === true;

  if (isTable) {
    return chunkTables(doc);
  }

  // For .txt-derived documents, use markdown splitting only
  return splitMarkdown(doc);
}
