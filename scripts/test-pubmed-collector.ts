export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { collectFromPubMed } = await import(
    "../src/lib/rag/collectors/pubmed"
  );

  console.log("Query: niacinamide acne (retmax: 3)\n");

  const docs = await collectFromPubMed("niacinamide acne", { retmax: 3 });
  console.log(`Returned ${docs.length} RawDoc(s)\n`);

  if (docs.length > 0) {
    console.log("--- docs[0] ---");
    console.log("sourceType:", docs[0].sourceType);
    console.log("title:", docs[0].title);
    console.log("sourceUrl:", docs[0].sourceUrl);
    console.log("text (first 200 chars):", docs[0].text.slice(0, 200));
    console.log("metadata:", JSON.stringify(docs[0].metadata, null, 2));
    console.log("retrievedAt:", docs[0].retrievedAt);
  }

  if (docs.length > 1) {
    console.log("\n--- docs[1] ---");
    console.log("sourceType:", docs[1].sourceType);
    console.log("title:", docs[1].title);
    console.log("text (first 150 chars):", docs[1].text.slice(0, 150));
    console.log("metadata:", JSON.stringify(docs[1].metadata, null, 2));
  }
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
