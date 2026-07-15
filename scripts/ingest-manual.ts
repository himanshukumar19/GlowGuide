export {};

/**
 * Manual document ingestion script.
 *
 * Usage:
 *   npx tsx scripts/ingest-manual.ts <file-or-url> [--type pubmed|web|...]
 *
 * Reads a local file or URL, parses, chunks, embeds, and upserts to Supabase.
 */

async function main() {
  // TODO: Implement manual ingestion CLI
  // 1. Parse CLI args (file path or URL, source type)
  // 2. If local file, read and wrap in RawDoc
  // 3. If URL, use collectFromWeb
  // 4. Call parseDocument -> chunkDocument -> embedDocuments -> upsertChunks
  // 5. Print summary (docs processed, chunks created)

  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: npx tsx scripts/ingest-manual.ts <file-or-url> [--type sourceType]");
    process.exit(1);
  }

  console.log("Manual ingestion not yet implemented.");
  console.log("Args:", args);
}

main().catch(console.error);
