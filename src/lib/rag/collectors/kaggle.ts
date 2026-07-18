import { writeFileSync, mkdirSync, readFileSync, unlinkSync } from "fs";
import { join, basename } from "path";
import AdmZip from "adm-zip";
import { Document } from "@langchain/core/documents";

const API_BASE = "https://www.kaggle.com/api/v1";
const MAX_ROWS = 1500;

const INGREDIENT_KEYWORDS = [
  "ingredient", "composition", "formulation", "inci",
  "chemical", "compound", "product", "cosmetic",
];

const SURVEY_KEYWORDS = [
  "survey", "demographic", "consumer trend", "shopping prefer",
  "review", "sentiment", "questionnaire",
];

function authHeaders(): Record<string, string> {
  const username = process.env.KAGGLE_USERNAME;
  const key = process.env.KAGGLE_API_TOKEN;
  if (!username || !key) {
    throw new Error(
      "KAGGLE_USERNAME and KAGGLE_API_TOKEN env vars required for Kaggle API"
    );
  }
  const encoded = Buffer.from(`${username}:${key}`).toString("base64");
  return { Authorization: `Basic ${encoded}` };
}

function classifyDataset(title: string, subtitle: string): "ingredient" | "survey" | "other" {
  const text = `${title} ${subtitle}`.toLowerCase();
  if (INGREDIENT_KEYWORDS.some((kw) => text.includes(kw))) return "ingredient";
  if (SURVEY_KEYWORDS.some((kw) => text.includes(kw))) return "survey";
  return "other";
}

async function searchDatasets(
  keyword: string,
  maxDatasets: number
): Promise<any[]> {
  // Fetch more than needed so we can filter down to relevant ones
  const fetchCount = Math.max(maxDatasets * 3, 10);
  const url = `${API_BASE}/datasets/list?search=${encodeURIComponent(keyword)}&pageSize=${fetchCount}`;
  const res = await fetch(url, {
    headers: { ...authHeaders(), Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(
      `Kaggle search failed: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();
  const allDatasets: any[] = Array.isArray(data) ? data : [];

  // Classify and sort: ingredient-type first, then other, survey last
  const classified = allDatasets.map((ds) => {
    const title: string = ds.titleNullable ?? ds.title ?? "";
    const subtitle: string = ds.subtitleNullable ?? ds.subtitle ?? "";
    const kind = classifyDataset(title, subtitle);
    return { ...ds, _kind: kind };
  });

  const ingredient = classified.filter((d) => d._kind === "ingredient");
  const other = classified.filter((d) => d._kind === "other");
  const survey = classified.filter((d) => d._kind === "survey");

  const sorted = [...ingredient, ...other, ...survey];

  for (const ds of sorted) {
    const ref: string = ds.ref ?? "";
    const title: string = ds.titleNullable ?? ds.title ?? "";
    console.log(`[kaggle]   [${ds._kind}] ${ref} — "${title.slice(0, 70)}"`);
  }

  return sorted.slice(0, maxDatasets);
}

function countCsvRows(csvPath: string): number {
  try {
    const content = readFileSync(csvPath, "utf-8");
    let lines = 0;
    let inQuotes = false;
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '"') inQuotes = !inQuotes;
      if (content[i] === "\n" && !inQuotes) lines++;
    }
    // Subtract header row
    return Math.max(0, lines - 1);
  } catch {
    return 0;
  }
}

async function downloadAndExtract(
  ref: string,
  saveDir: string
): Promise<string[]> {
  const savedFiles: string[] = [];

  const downloadUrl = `${API_BASE}/datasets/download/${ref}`;
  const res = await fetch(downloadUrl, {
    headers: authHeaders(),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    console.warn(
      `[kaggle] Download failed for ${ref}: ${res.status} ${res.statusText}`
    );
    return savedFiles;
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  let zip: AdmZip;
  try {
    zip = new AdmZip(buffer);
  } catch {
    console.warn(`[kaggle] Invalid zip for ${ref}, skipping`);
    return savedFiles;
  }

  const entries = zip.getEntries();
  const slug = ref.replace("/", "-");

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    const name = entry.entryName;
    if (!name.endsWith(".csv")) continue;

    try {
      const base = basename(name, ".csv");
      const csvPath = join(saveDir, `kaggle-${slug}-${base}.csv`);
      writeFileSync(csvPath, entry.getData());

      const rowCount = countCsvRows(csvPath);

      if (rowCount > MAX_ROWS) {
        console.warn(
          `[kaggle] SKIPPED: ${csvPath} — ${rowCount} rows (>${MAX_ROWS}), likely survey/transactional data, not suitable for row-to-chunk conversion`
        );
        unlinkSync(csvPath);
        continue;
      }

      savedFiles.push(csvPath);
      console.log(
        `[kaggle] Extracted: ${csvPath} (${entry.getData().length} bytes, ${rowCount} rows)`
      );
    } catch (e) {
      console.warn(
        `[kaggle] Failed to process entry "${name}" in ${ref}:`,
        e instanceof Error ? e.message : e
      );
    }
  }

  if (savedFiles.length === 0) {
    console.log(`[kaggle] No suitable CSV found in ${ref}, skipping dataset`);
  }

  return savedFiles;
}

/**
 * Search Kaggle for skincare ingredient/composition datasets,
 * download them, extract CSV files, and save to data/manual-uploads/.
 *
 * Row-count safeguard: CSVs with >1500 rows are skipped as they are
 * likely survey/transactional data unsuitable for direct row-to-chunk
 * conversion.
 *
 * Ingredient preference: search results are sorted so datasets
 * containing ingredient-related keywords (ingredient, composition,
 * formulation, INCI) appear first; survey/demographic datasets last.
 *
 * @param keyword - Search term (e.g. "skincare ingredients")
 * @param options - { maxDatasets: max datasets to download (default 2) }
 * @returns Array of Document objects pointing to saved CSV files
 */
export async function collectFromKaggle(
  keyword: string,
  options?: { maxDatasets?: number }
): Promise<Document[]> {
  const maxDatasets = options?.maxDatasets ?? 2;
  const saveDir = join(process.cwd(), "data", "manual-uploads");

  mkdirSync(saveDir, { recursive: true });

  console.log(`[kaggle] Searching "${keyword}" (max ${maxDatasets} datasets, preferring ingredient-type)...`);
  const datasets = await searchDatasets(keyword, maxDatasets);
  console.log(`[kaggle] Selected ${datasets.length} dataset(s) for download`);

  const documents: Document[] = [];

  for (const ds of datasets) {
    const ref: string = ds.ref ?? "";
    if (!ref || !ref.includes("/")) continue;

    const title: string = ds.titleNullable ?? ds.title ?? ref;
    const url: string = ds.urlNullable ?? ds.url ?? `https://www.kaggle.com/datasets/${ref}`;

    console.log(`\n[kaggle] Downloading: ${ref} ("${title}")`);

    try {
      const savedFiles = await downloadAndExtract(ref, saveDir);

      if (savedFiles.length === 0) continue;

      documents.push(
        new Document({
          pageContent: "",
          metadata: {
            sourceType: "dataset",
            sourceUrl: url,
            title,
            ref,
            savedPath: savedFiles[0],
            allSavedPaths: savedFiles,
            retrievedAt: new Date().toISOString(),
          },
        })
      );
    } catch (e) {
      console.warn(
        `[kaggle] Skipping ${ref}:`,
        e instanceof Error ? e.message : e
      );
    }
  }

  return documents;
}
