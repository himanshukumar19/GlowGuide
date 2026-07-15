export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { collectFromWeb } = await import(
    "../src/lib/rag/collectors/webFetch"
  );

  console.log('Fetching: https://incidecoder.com/ingredients/niacinamide\n');

  const doc = await collectFromWeb(
    "https://incidecoder.com/ingredients/niacinamide",
    { sourceType: "brand_educational" }
  );

  console.log("--- RawDoc ---");
  console.log("sourceType:", doc.sourceType);
  console.log("title:", doc.title);
  console.log("sourceUrl:", doc.sourceUrl);
  console.log("text (first 300 chars):", doc.text.slice(0, 300));
  console.log("text length:", doc.text.length);
  console.log("metadata:", JSON.stringify(doc.metadata, null, 2));
  console.log("retrievedAt:", doc.retrievedAt);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
