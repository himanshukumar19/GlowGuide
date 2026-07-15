import { readdirSync, readFileSync } from "fs";
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

/**
 * Load all .csv files from a directory and return one Document per file.
 * Each Document carries parsed row data in metadata.rows for table chunking.
 *
 * @param dirPath - Directory containing .csv files
 * @returns Array of Document objects, one per CSV file
 */
export function loadCsvDocs(dirPath: string): Document[] {
  const files = readdirSync(dirPath).filter((f) => extname(f) === ".csv");

  return files.map((file) => {
    const filePath = join(dirPath, file);
    const raw = readFileSync(filePath, "utf-8");
    const filename = basename(file, extname(file));
    const { headers, rows } = parseCSV(raw);

    const docId = filename;

    return new Document({
      pageContent: raw.trim(),
      metadata: {
        docId,
        title: `${filename} (${rows.length} products)`,
        sourceUrl: "",
        sourceType: "dataset",
        isTable: true,
        retrievedAt: new Date().toISOString(),
        rows,
        headers,
      },
    });
  });
}

export { parseCSV };
