export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { collectFromSemanticScholar } = await import(
    "../src/lib/rag/collectors/semanticScholar"
  );

  console.log('Query: "retinol skin aging" (limit: 3)\n');

  const docs = await collectFromSemanticScholar("retinol skin aging", { limit: 3 });

  console.log(`Returned ${docs.length} Document(s)\n`);

  for (let i = 0; i < docs.length; i++) {
    const m = docs[i].metadata;
    console.log(`--- docs[${i}] ---`);
    console.log("docId:", m.docId);
    console.log("sourceType:", m.sourceType);
    console.log("title:", m.title);
    console.log("sourceUrl:", m.sourceUrl);
    console.log("pageContent (first 200 chars):", docs[i].pageContent.slice(0, 200));
    console.log("metadata:", JSON.stringify(m, null, 2));
    console.log("");
  }
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
