/**
 * Shared RAG type re-exports.
 * Import from here when you need types across multiple modules.
 */

export type { RawDoc, SourceType } from "../src/lib/rag/collectors/types";
export type { Chunk, ChunkMetadata } from "../src/lib/rag/chunking/types";
export type { ChatRequest, ChatResponse } from "../src/app/api/chat/route";
export type { IngestRequest, IngestResponse } from "../src/app/api/ingest/route";
