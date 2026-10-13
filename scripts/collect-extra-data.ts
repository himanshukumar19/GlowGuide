export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

/**
 * Pre-ingestion data collection:
 *   1. Kaggle: search "skincare ingredients" + "cosmetic INCI"
 *   2. HuggingFace: grab known skincare/ingredient datasets
 *
 * Run before reset-and-reingest.ts:
 *   npx tsx scripts/collect-extra-data.ts
 */

async function main() {
  // ─── Kaggle ──────────────────────────────────────────────────────────────
  console.log("\n═══ Kaggle Collection ═══\n");

  const { collectFromKaggle } = await import("../src/lib/rag/collectors/kaggle");

  const kaggleKeywords = ["skincare ingredients", "cosmetic INCI"];
  for (const kw of kaggleKeywords) {
    try {
      console.log(`\n[kaggle] Keyword: "${kw}"`);
      const docs = await collectFromKaggle(kw, { maxDatasets: 2 });
      console.log(`[kaggle] → ${docs.length} dataset(s) downloaded for "${kw}"`);
    } catch (e) {
      console.warn(
        `[kaggle] Failed for "${kw}":`,
        e instanceof Error ? e.message : e
      );
    }
  }

  // ─── HuggingFace ─────────────────────────────────────────────────────────
  console.log("\n═══ HuggingFace Collection ═══\n");

  const { collectAndSaveHuggingFace } = await import(
    "../src/lib/rag/collectors/huggingface"
  );

  // Well-known skincare/ingredient datasets on HuggingFace
  const hfDatasets: Array<{
    id: string;
    subset?: string;
    split?: string;
    maxRows?: number;
    note: string;
  }> = [
    {
      id: "marmot/skincare-products",
      maxRows: 500,
      note: "Skincare product ingredient lists",
    },
    {
      id: "Prikshit/skincare-product-recommendation",
      maxRows: 500,
      note: "Skincare product recommendations dataset",
    },
    {
      id: "leonoverweel/skincare-products",
      maxRows: 500,
      note: "Skincare products with ingredients",
    },
    {
      id: "mstz/cosmetics",
      maxRows: 500,
      note: "Cosmetics product dataset",
    },
    {
      id: "mstz/skincare",
      maxRows: 500,
      note: "Skincare product descriptions",
    },
  ];

  let hfTotal = 0;
  for (const ds of hfDatasets) {
    try {
      console.log(`\n[hf] Dataset: ${ds.id} — ${ds.note}`);
      const path = await collectAndSaveHuggingFace(ds.id, {
        subset: ds.subset,
        split: ds.split,
        maxRows: ds.maxRows ?? 100,
      });
      if (path) {
        hfTotal++;
        console.log(`[hf] ✅ Saved → ${path}`);
      } else {
        console.log(`[hf] ⚠ No data collected from ${ds.id}`);
      }
    } catch (e) {
      console.warn(
        `[hf] Failed for "${ds.id}":`,
        e instanceof Error ? e.message : e
      );
    }
  }

  console.log(
    `\n═══ Collection Complete ═══\n` +
      `HuggingFace: ${hfTotal} CSV(s) saved\n` +
      `All files saved to data/manual-uploads/\n` +
      `\nNow run: npx tsx scripts/reset-and-reingest.ts\n`
  );
}

main().catch((err) => {
  console.error("Collection failed:", err);
  process.exit(1);
});
