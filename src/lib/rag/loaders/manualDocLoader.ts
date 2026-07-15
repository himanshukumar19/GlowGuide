import { readdirSync, readFileSync } from "fs";
import { join, extname, basename } from "path";
import { Document } from "@langchain/core/documents";

const SOURCE_TYPE_MAP: Record<string, string> = {
  pubmed: "peer_reviewed",
  aad: "clinical_education",
  incidecoder: "brand_educational",
  kaggle: "dataset",
};

function inferSourceType(filename: string): string {
  const prefix = filename.split("-")[0].toLowerCase();
  return SOURCE_TYPE_MAP[prefix] ?? "web";
}

function parseTxtFile(filePath: string): Document {
  const raw = readFileSync(filePath, "utf-8");
  const filename = basename(filePath, extname(filePath));
  const separatorIdx = raw.indexOf("\n---\n");

  if (separatorIdx === -1) {
    return new Document({
      pageContent: raw.trim(),
      metadata: {
        docId: filename,
        title: filename,
        sourceUrl: "",
        sourceType: inferSourceType(filename),
        retrievedAt: new Date().toISOString(),
      },
    });
  }

  const headerBlock = raw.slice(0, separatorIdx);
  const content = raw.slice(separatorIdx + 5).trim();

  const header: Record<string, string> = {};
  for (const line of headerBlock.split("\n")) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      header[match[1]] = match[2].trim();
    }
  }

  return new Document({
    pageContent: content,
    metadata: {
      docId: filename,
      title: header.Title ?? filename,
      sourceUrl: header.URL ?? "",
      sourceType: inferSourceType(filename),
      retrievedAt: header.Retrieved ?? new Date().toISOString(),
      ...(header.Authors && { authors: header.Authors }),
      ...(header.Year && { year: header.Year }),
      ...(header.Source && { source: header.Source }),
    },
  });
}

export function loadManualDocs(dirPath: string): Document[] {
  const files = readdirSync(dirPath).filter(
    (f) => extname(f) === ".txt"
  );

  return files.map((file) => parseTxtFile(join(dirPath, file)));
}
