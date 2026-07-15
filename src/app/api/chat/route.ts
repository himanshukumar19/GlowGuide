import { NextRequest, NextResponse } from "next/server";
import { answerQuery } from "@/lib/rag/retrieve";
import { createConversation, addMessage, getMessages } from "@/lib/rag/db/chatHistory";

export type ChatRequest = {
  message: string;
  conversationId?: string;
};

export type ChatResponse = {
  answer: string;
  sources: { title: string; url: string }[];
  conversationId: string;
  provider: "gemini" | "groq";
};

/**
 * POST /api/chat
 * RAG-powered chatbot endpoint.
 * Receives a user message, retrieves relevant context, generates a response,
 * and persists the exchange to Firestore.
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'message' field" },
        { status: 400 }
      );
    }

    const { message, conversationId } = body;

    // TODO: Get userId from Firebase auth token (Authorization header)
    const userId = "placeholder-user-id";

    const convId =
      conversationId ?? (await createConversation(userId, message.slice(0, 80)));

    await addMessage(convId, "user", message);

    const { answer, sources, provider } = await answerQuery(message);

    await addMessage(
      convId,
      "assistant",
      answer,
      sources.map((s: { title: string; url: string }) => ({ title: s.title, sourceUrl: s.url, score: 0 }))
    );

    return NextResponse.json({
      answer,
      sources,
      conversationId: convId,
      provider,
    } satisfies ChatResponse);
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
