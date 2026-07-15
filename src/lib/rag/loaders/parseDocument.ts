import { Document } from "@langchain/core/documents";
import type { RawDoc } from "../collectors/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function shortHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).slice(0, 8);
}

const PREFIX_MAP: Record<string, string> = {
  pubmed: "pubmed-",
  semantic_scholar: "s2-",
  peer_reviewed: "pubmed-",
  huggingface: "hf-",
  kaggle: "kaggle-",
  dataset: "kaggle-",
  clinical_education: "aad-",
  brand_educational: "incidecoder-",
  web: "web-",
  manual: "web-",
};

const SOURCE_TYPE_NORMALIZED: Record<string, string> = {
  pubmed: "peer_reviewed",
  semantic_scholar: "peer_reviewed",
  peer_reviewed: "peer_reviewed",
  huggingface: "dataset",
  kaggle: "dataset",
  dataset: "dataset",
  clinical_education: "clinical_education",
  brand_educational: "brand_educational",
  web: "web",
  manual: "web",
};

function generateDocId(sourceType: string, title: string, sourceUrl: string): string {
  const prefix = PREFIX_MAP[sourceType] ?? "web-";
  const slug = slugify(title) || "untitled";
  const hash = shortHash(sourceUrl || title);
  return `${prefix}${slug}-${hash}`;
}

/**
 * Convert a RawDoc (collector output) into a LangChain Document
 * ready for chunking and embedding. Normalizes sourceType to
 * match the vocabulary used by manualDocLoader.ts so all docs
 * are consistent in Qdrant.
 *
 * @param rawDoc - The RawDoc from a collector
 * @returns A LangChain Document
 */
export function parseDocument(rawDoc: RawDoc): Document {
  const normalizedSourceType = SOURCE_TYPE_NORMALIZED[rawDoc.sourceType] ?? "web";
  const docId = generateDocId(rawDoc.sourceType, rawDoc.title, rawDoc.sourceUrl);

  return new Document({
    pageContent: rawDoc.text,
    metadata: {
      docId,
      title: rawDoc.title,
      sourceUrl: rawDoc.sourceUrl,
      sourceType: normalizedSourceType,
      retrievedAt: rawDoc.retrievedAt ?? new Date().toISOString(),
      ...(rawDoc.metadata.authors && { authors: rawDoc.metadata.authors }),
      ...(rawDoc.metadata.year && { year: rawDoc.metadata.year }),
      ...(rawDoc.metadata.Source && { source: rawDoc.metadata.Source }),
    },
  });
}

/**
 * Batch-convert an array of RawDocs to Documents.
 *
 * @param rawDocs - Array of RawDoc objects from a collector
 * @returns Array of LangChain Documents
 */
export function parseDocuments(rawDocs: RawDoc[]): Document[] {
  return rawDocs.map(parseDocument);
}
