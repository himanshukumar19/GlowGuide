import { readdirSync, readFileSync, existsSync } from "fs";
import { join, extname, basename } from "path";
import { Document } from "@langchain/core/documents";

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const rows: Record<string, string>[] = [];
  let headers: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let currentRow: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\n") {
        currentRow.push(currentField.trim());
        if (headers.length === 0) {
          headers = currentRow;
        } else if (currentRow.length === headers.length && currentRow.some((f) => f !== "")) {
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = currentRow[idx] ?? "";
          });
          rows.push(row);
        }
        currentRow = [];
        currentField = "";
      } else if (char === "\r") {
        if (i + 1 < text.length && text[i + 1] === "\n") {
          i++;
        }
        currentRow.push(currentField.trim());
        if (headers.length === 0) {
          headers = currentRow;
        } else if (currentRow.length === headers.length && currentRow.some((f) => f !== "")) {
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = currentRow[idx] ?? "";
          });
          rows.push(row);
        }
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.length === headers.length && currentRow.some((f) => f !== "")) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = currentRow[idx] ?? "";
      });
      rows.push(row);
    }
  }

  return { headers, rows };
}

function rowToPageContent(
  row: Record<string, string>,
  _headers: string[]
): string {
  const entries = Object.entries(row).filter(
    ([, v]) => v && v.trim().length > 0
  );

  if (entries.length === 0) return "";

  const label = entries[0][0];
  const value = entries[0][1];

  if (entries.length === 1) {
    return `${label}: ${value}`;
  }

  const rest = entries
    .slice(1)
    .map(([k, v]) => `${k.toLowerCase()}: ${v}`)
    .join(", ");

  return `${label}: ${value}. ${rest}.`;
}

function loadSidecar(dirPath: string, filename: string): Record<string, string> | null {
  const sidecarPath = join(dirPath, `${filename}.json`);
  if (!existsSync(sidecarPath)) return null;

  try {
    const raw = readFileSync(sidecarPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const URL_COLUMNS = ["product_url", "url", "link", "source_url"];
const NAME_COLUMNS = ["product_name", "name", "title"];

function extractRowUrl(row: Record<string, string>): string {
  for (const col of URL_COLUMNS) {
    const val = row[col];
    if (val && val.trim().startsWith("http")) return val.trim();
  }
  return "";
}

function extractRowTitle(row: Record<string, string>): string {
  for (const col of NAME_COLUMNS) {
    const val = row[col];
    if (val && val.trim().length > 0) return val.trim();
  }
  return "";
}

/**
 * Read all .csv files in a directory and return one Document per row.
 * Each Document's pageContent is a natural-language sentence derived
 * from the row's fields. Metadata includes sourceUrl from a matching
 * .json sidecar file if one exists (same filename, .json extension).
 *
 * @param dirPath - Directory containing .csv files
 * @returns Array of Document objects, one per CSV row
 */
export async function loadCsvDocs(dirPath: string): Promise<Document[]> {
  const files = readdirSync(dirPath).filter((f) => extname(f) === ".csv");
  const documents: Document[] = [];

  for (const file of files) {
    const filePath = join(dirPath, file);
    const raw = readFileSync(filePath, "utf-8");
    const filename = basename(file, extname(file));
    const { headers, rows } = parseCSV(raw);

    const sidecar = loadSidecar(dirPath, filename);
    const sourceUrl = sidecar?.sourceUrl ?? sidecar?.url ?? sidecar?.URL ?? "";

    for (let i = 0; i < rows.length; i++) {
      const pageContent = rowToPageContent(rows[i], headers);
      if (!pageContent) continue;

      const rowUrl = extractRowUrl(rows[i]);
      const rowTitle = extractRowTitle(rows[i]);

      documents.push(
        new Document({
          pageContent,
          metadata: {
            docId: `${filename}-row-${i}`,
            title: rowTitle || filename,
            sourceType: "dataset",
            sourceUrl: rowUrl || sourceUrl,
            retrievedAt: new Date().toISOString(),
          },
        })
      );
    }
  }

  return documents;
}

export { parseCSV };
