import { Document } from "@langchain/core/documents";
import type { Chunk } from "./types";

function formatRowAsParagraph(row: Record<string, string>): string {
  const name = row["Name"] ?? "";
  const brand = row["Brand"] ?? "";
  const label = row["Label"] ?? "";
  const price = row["Price"] ?? "";
  const rank = row["Rank"] ?? "";
  const ingredients = row["Ingredients"] ?? "";

  const skinTypes: string[] = [];
  const skinTypeColumns = ["Combination", "Dry", "Normal", "Oily", "Sensitive"];
  for (const col of skinTypeColumns) {
    if (row[col] === "1") {
      skinTypes.push(col);
    }
  }
  const suitable = skinTypes.length > 0 ? skinTypes.join(", ") + " skin" : "not specified";

  const heading = `## ${name}`;
  const byline = brand ? ` (${brand})` : "";
  const categoryLine = `\n\nCategory: ${label}`;
  const priceLine = price ? `\nPrice: $${price}` : "";
  const ratingLine = rank ? `\nRating: ${rank}/5` : "";
  const suitableLine = `\nSuitable for: ${suitable}`;
  const ingredientsLine = ingredients ? `\nIngredients: ${ingredients}` : "";

  return (
    heading +
    byline +
    categoryLine +
    priceLine +
    ratingLine +
    suitableLine +
    ingredientsLine
  );
}

/**
 * Extract individual rows from a table Document and create one Chunk per row.
 * Each chunk contains a natural-language paragraph formatted from the row's fields.
 *
 * @param doc - The Document containing table data (must have metadata.rows)
 * @returns Array of Chunk objects, one per row
 */
export function chunkTables(doc: Document): Chunk[] {
  const rows = doc.metadata.rows as Record<string, string>[] | undefined;
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  const docId = doc.metadata.docId as string;

  return rows.map((row, index) => {
    const name = row["Name"] ?? "";

    return {
      chunkId: `${docId}-row-${index}`,
      text: formatRowAsParagraph(row),
      metadata: {
        docId,
        sourceUrl: doc.metadata.sourceUrl ?? "",
        title: doc.metadata.title ?? "",
        sourceType: doc.metadata.sourceType ?? "",
        retrievedAt: doc.metadata.retrievedAt ?? "",
        ...(name && { sectionHeading: name }),
      },
    };
  });
}
