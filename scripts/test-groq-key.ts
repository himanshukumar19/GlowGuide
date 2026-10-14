export {};

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { ChatGroq } = await import("@langchain/groq");

  const model = new ChatGroq({
    model: "llama-3.3-70b",
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0,
    maxRetries: 1,
  });

  console.log("Testing Groq API key with model: llama-3.3-70b-versatile\n");

  try {
    const response = await model.invoke("say hello");
    console.log("OK — Groq responded:\n");
    console.log(response.content);
  } catch (err) {
    console.error("FAILED — Groq error:");
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    process.exit(1);
  }
}

main();
