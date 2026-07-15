export {};

/**
 * Full ingestion pipeline script.
 *
 * Usage:
 *   npx tsx scripts/ingest-pipeline.ts [--source pubmed|semantic_scholar|huggingface|kaggle|web] [--query "..."]
 *
 * Runs the complete collect -> parse -> chunk -> embed -> upsert pipeline
 * for a given source and query.
 */

async function main() {
  // TODO: Implement full pipeline orchestration
  // 1. Parse CLI args (--source, --query, --limit, etc.)
  // 2. Select collector based on --source
  // 3. Run collection
  // 4. Run parseDocument on each RawDoc
  // 5. Run chunkDocument on each ParsedDoc
  // 6. Run embedDocuments on all chunk texts (batched)
  // 7. Run upsertChunks with EmbeddedChunks
  // 8. Print pipeline summary

  const args = process.argv.slice(2);
  console.log("Ingestion pipeline not yet implemented.");
  console.log("Args:", args);
}

main().catch(console.error);
