import { db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const CONVERSATIONS_COLLECTION = "conversations";

export type ConversationDoc = {
  userId: string;
  title: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  messageCount: number;
};

export type MessageDoc = {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; sourceUrl: string; score: number }[];
  createdAt: FirebaseFirestore.Timestamp;
};

/**
 * Create a new conversation document in Firestore.
 */
export async function createConversation(
  userId: string,
  title: string
): Promise<string> {
  // TODO: Implement conversation creation
  // 1. Add doc to CONVERSATIONS_COLLECTION with userId, title, timestamps, messageCount: 0
  // 2. Return the new conversation ID
  const ref = await db.collection(CONVERSATIONS_COLLECTION).add({
    userId,
    title,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    messageCount: 0,
  });
  return ref.id;
}

/**
 * Add a message to a conversation's messages subcollection.
 */
export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  sources?: { title: string; sourceUrl: string; score: number }[]
): Promise<string> {
  // TODO: Implement message addition
  // 1. Add doc to conversations/{conversationId}/messages with role, content, sources, createdAt
  // 2. Increment parent conversation's messageCount and update updatedAt
  const msgRef = await db
    .collection(CONVERSATIONS_COLLECTION)
    .doc(conversationId)
    .collection("messages")
    .add({
      role,
      content,
      sources: sources ?? [],
      createdAt: FieldValue.serverTimestamp(),
    });

  await db.collection(CONVERSATIONS_COLLECTION).doc(conversationId).update({
    updatedAt: FieldValue.serverTimestamp(),
    messageCount: FieldValue.increment(1),
  });

  return msgRef.id;
}

/**
 * Get a conversation document by ID.
 */
export async function getConversation(
  conversationId: string
): Promise<(ConversationDoc & { id: string }) | null> {
  // TODO: Implement conversation retrieval
  const doc = await db
    .collection(CONVERSATIONS_COLLECTION)
    .doc(conversationId)
    .get();

  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as ConversationDoc) };
}

/**
 * Get all messages for a conversation, ordered by creation time.
 */
export async function getMessages(
  conversationId: string
): Promise<(MessageDoc & { id: string })[]> {
  // TODO: Implement message retrieval
  const snapshot = await db
    .collection(CONVERSATIONS_COLLECTION)
    .doc(conversationId)
    .collection("messages")
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as MessageDoc),
  }));
}
