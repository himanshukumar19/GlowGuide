export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { answerQuery } = await import("../src/lib/rag/retrieve");

  const question = "Does niacinamide help with acne?";

  console.log(`Question: ${question}\n`);

  const { answer, sources } = await answerQuery(question);

  console.log("Answer:\n");
  console.log(answer);

  console.log("\nSources:\n");
  for (const source of sources) {
    console.log(`- ${source.title}`);
    console.log(`  ${source.url}`);
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
