import { Document } from "@langchain/core/documents";
import { MarkdownTextSplitter, RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getEncoding } from "js-tiktoken";
import type { Chunk } from "./types";

const CHUNK_SIZE = 400;
const CHUNK_OVERLAP = 0;
const RESPLIT_CHUNK_SIZE = 400;
const RESPLIT_CHUNK_OVERLAP = 40;
const MIN_CHUNK_TOKENS = 50;

const encoding = getEncoding("cl100k_base");

function countTokens(text: string): number {
  return encoding.encode(text).length;
}

/**
 * Split a Document's pageContent into chunks using markdown-aware splitting
 * with token-based sizing via js-tiktoken.
 *
 * @param doc - The Document to split
 * @returns Array of Chunk objects
 */
export async function splitMarkdown(doc: Document): Promise<Chunk[]> {
  const docId = doc.metadata.docId as string;
  const fullText = doc.pageContent;

  if (!fullText || fullText.trim().length === 0) {
    return [];
  }

  const totalTokens = countTokens(fullText);

  // If document fits in a single chunk, return as-is
  if (totalTokens <= CHUNK_SIZE) {
    return [
      {
        chunkId: `${docId}-chunk-0`,
        text: fullText,
        metadata: {
          docId,
          sourceUrl: doc.metadata.sourceUrl ?? "",
          title: doc.metadata.title ?? "",
          sourceType: doc.metadata.sourceType ?? "",
          retrievedAt: doc.metadata.retrievedAt ?? "",
          ...(doc.metadata.sectionHeading && { sectionHeading: doc.metadata.sectionHeading }),
        },
      },
    ];
  }

  // Primary split using MarkdownTextSplitter with tiktoken length function
  const markdownSplitter = new MarkdownTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    lengthFunction: countTokens,
  });

  let rawChunks = await markdownSplitter.splitText(fullText);

  // Re-split any chunks that still exceed the token limit
  const resplitter = new RecursiveCharacterTextSplitter({
    chunkSize: RESPLIT_CHUNK_SIZE,
    chunkOverlap: RESPLIT_CHUNK_OVERLAP,
    lengthFunction: countTokens,
  });

  const finalTextChunks: string[] = [];
  for (const chunk of rawChunks) {
    if (countTokens(chunk) > CHUNK_SIZE) {
      const reSplit = await resplitter.splitText(chunk);
      finalTextChunks.push(...reSplit);
    } else {
      finalTextChunks.push(chunk);
    }
  }

  // Merge chunks under MIN_CHUNK_TOKENS into the previous chunk
  const mergedChunks: string[] = [];
  for (const chunk of finalTextChunks) {
    const tokens = countTokens(chunk);
    if (tokens < MIN_CHUNK_TOKENS && mergedChunks.length > 0) {
      mergedChunks[mergedChunks.length - 1] += "\n\n" + chunk;
    } else {
      mergedChunks.push(chunk);
    }
  }

  // Build Chunk objects with metadata
  const chunks: Chunk[] = mergedChunks.map((text, index) => ({
    chunkId: `${docId}-chunk-${index}`,
    text,
    metadata: {
      docId,
      sourceUrl: doc.metadata.sourceUrl ?? "",
      title: doc.metadata.title ?? "",
      sourceType: doc.metadata.sourceType ?? "",
      retrievedAt: doc.metadata.retrievedAt ?? "",
      ...(doc.metadata.sectionHeading && { sectionHeading: doc.metadata.sectionHeading }),
    },
  }));

  return chunks;
}
