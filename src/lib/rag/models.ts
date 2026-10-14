import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

/**
 * Create a chat model with Gemini as primary and Groq as fallback.
 * If Gemini fails (quota exhausted, rate limit, etc.), Groq takes over automatically.
 */
export function createChatModel() {
  const primary = new ChatGoogleGenerativeAI({
    model: "gemini-3.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.2,
    maxRetries: 2,
  });

  const fallback = new ChatGroq({
    model: "llama-3.3-70b",
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0.2,
    maxRetries: 2,
  });

  return primary.withFallbacks([fallback]);
}
