import type { RawDoc } from "./types";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const HF_API_BASE = "https://datasets-server.huggingface.co";
const BATCH_SIZE = 100;
const MAX_ROWS_CAP = 1500;

/**
 * Collect datasets/documents from Hugging Face Hub using the free
 * datasets-server API (no auth required).
 *
 * @param datasetId - HF dataset identifier (e.g. "ingredient-dataset/skincare")
 * @param subset    - Optional dataset config/subset (defaults to "default")
 * @param split     - Dataset split to read (default "train")
 * @param maxRows   - Maximum rows to fetch (capped at MAX_ROWS_CAP=1500, default 100)
 * @returns Array of RawDoc from the dataset
 */
export async function collectFromHuggingFace(
  datasetId: string,
  subset: string = "default",
  split: string = "train",
  maxRows: number = 100
): Promise<RawDoc[]> {
  const cap = Math.min(maxRows, MAX_ROWS_CAP);
  const docs: RawDoc[] = [];
  const datasetUrl = `https://huggingface.co/datasets/${datasetId}`;

  console.log(`[huggingface] Fetching dataset "${datasetId}" (split=${split}, max=${cap})...`);

  let offset = 0;
  while (docs.length < cap) {
    const length = Math.min(BATCH_SIZE, cap - docs.length);
    const url =
      `${HF_API_BASE}/rows?dataset=${encodeURIComponent(datasetId)}` +
      `&config=${encodeURIComponent(subset)}&split=${encodeURIComponent(split)}` +
      `&offset=${offset}&length=${length}`;

    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(30_000),
      });
    } catch (e) {
      console.warn(`[huggingface] Network error at offset ${offset}:`, e instanceof Error ? e.message : e);
      break;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[huggingface] API error ${res.status} for ${datasetId}: ${body.slice(0, 200)}`);
      break;
    }

    let data: any;
    try {
      data = await res.json();
    } catch {
      console.warn(`[huggingface] Failed to parse JSON response for ${datasetId}`);
      break;
    }

    const rows: any[] = Array.isArray(data?.rows) ? data.rows : [];
    if (rows.length === 0) break;

    for (const rowWrapper of rows) {
      const row: Record<string, any> = rowWrapper?.row ?? rowWrapper ?? {};
      const rawDoc = rowToRawDoc(row, datasetId, datasetUrl);
      if (rawDoc) docs.push(rawDoc);
    }

    offset += rows.length;

    // If fewer rows returned than requested, we've reached the end
    if (rows.length < length) break;
  }

  console.log(`[huggingface] Collected ${docs.length} docs from "${datasetId}"`);
  return docs;
}

/**
 * Map a HuggingFace dataset row to a RawDoc.
 * Tries common skincare-relevant column names and falls back to
 * concatenating all non-empty string fields.
 */
function rowToRawDoc(
  row: Record<string, any>,
  datasetId: string,
  datasetUrl: string
): RawDoc | null {
  // Common text columns in skincare/ingredient datasets
  const TEXT_COLS = [
    "text", "content", "description", "ingredients", "ingredient_list",
    "product_description", "highlights", "composition", "inci", "formula",
    "pageContent", "body", "review_text", "review", "summary",
  ];
  const TITLE_COLS = ["product_name", "name", "title", "product", "item_name", "brand"];
  const URL_COLS = ["url", "product_url", "link", "source_url"];

  // Pick the best text field
  let text = "";
  for (const col of TEXT_COLS) {
    if (row[col] && typeof row[col] === "string" && row[col].trim().length > 10) {
      text = row[col].trim();
      break;
    }
  }

  // If no dedicated text column found, concatenate all string fields
  if (!text) {
    const parts = Object.entries(row)
      .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
      .map(([k, v]) => `${k}: ${String(v).trim()}`);
    text = parts.join(". ");
  }

  if (!text || text.trim().length < 10) return null;

  // Pick title
  let title = "";
  for (const col of TITLE_COLS) {
    if (row[col] && typeof row[col] === "string" && row[col].trim().length > 0) {
      title = row[col].trim();
      break;
    }
  }
  if (!title) title = datasetId.split("/").pop() ?? datasetId;

  // Pick URL
  let sourceUrl = datasetUrl;
  for (const col of URL_COLS) {
    if (row[col] && typeof row[col] === "string" && row[col].trim().startsWith("http")) {
      sourceUrl = row[col].trim();
      break;
    }
  }

  // Build metadata (capture all primitive fields as strings)
  const metadata: Record<string, any> = { datasetId };
  for (const [k, v] of Object.entries(row)) {
    if (v !== null && v !== undefined && typeof v !== "object") {
      metadata[k] = String(v);
    }
  }

  return {
    sourceType: "huggingface",
    sourceUrl,
    title,
    text,
    metadata,
    retrievedAt: new Date().toISOString(),
  };
}

/**
 * Convenience wrapper: collect from HuggingFace and save the results as a CSV
 * in data/manual-uploads/ so the existing csvLoader can pick them up.
 *
 * @param datasetId - HF dataset identifier
 * @param options   - { subset, split, maxRows, saveDir }
 * @returns Absolute path of the saved CSV (or null if nothing was collected)
 */
export async function collectAndSaveHuggingFace(
  datasetId: string,
  options?: {
    subset?: string;
    split?: string;
    maxRows?: number;
    saveDir?: string;
  }
): Promise<string | null> {
  const { subset = "default", split = "train", maxRows = 100, saveDir } = options ?? {};

  const docs = await collectFromHuggingFace(datasetId, subset, split, maxRows);
  if (docs.length === 0) {
    console.warn(`[huggingface] No docs collected from "${datasetId}", skipping CSV save`);
    return null;
  }

  const dir = saveDir ?? join(process.cwd(), "data", "manual-uploads");
  mkdirSync(dir, { recursive: true });

  // Sanitize datasetId for filename: replace slashes/spaces with hyphens
  const slug = datasetId.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").toLowerCase();
  const filename = `hf-${slug}.csv`;
  const filePath = join(dir, filename);

  // Collect all unique keys across all docs for CSV header
  const allKeys = Array.from(
    new Set(docs.flatMap((d) => Object.keys(d.metadata)))
  ).filter((k) => k !== "datasetId");

  const csvHeader = ["title", "text", "sourceUrl", "sourceType", "retrievedAt", ...allKeys].join(",");

  function escapeCsv(val: string): string {
    const s = String(val ?? "").replace(/"/g, '""');
    return `"${s}"`;
  }

  const csvRows = docs.map((d) => {
    const base = [
      escapeCsv(d.title),
      escapeCsv(d.text),
      escapeCsv(d.sourceUrl),
      escapeCsv(d.sourceType),
      escapeCsv(d.retrievedAt),
    ];
    const extra = allKeys.map((k) => escapeCsv(String(d.metadata[k] ?? "")));
    return [...base, ...extra].join(",");
  });

  const csv = [csvHeader, ...csvRows].join("\n");
  writeFileSync(filePath, csv, "utf-8");
  console.log(`[huggingface] Saved ${docs.length} rows → ${filePath}`);
  return filePath;
}
