import { db } from "@/lib/firebase-admin";
import { validate } from "@/lib/validators";
import { analysisSchema, type Analysis } from "@/lib/schemas/analysis";

const COLLECTION = "analyses";

export async function createAnalysis(
  data: Omit<Analysis, "id">
): Promise<Analysis> {
  const now = new Date().toISOString();
  const docRef = db.collection(COLLECTION).doc();

  const analysis = validate(analysisSchema, {
    ...data,
    id: docRef.id,
    createdAt: now,
  });

  await docRef.set(analysis);
  return analysis;
}

export async function getAnalysisById(id: string): Promise<Analysis | null> {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return validate(analysisSchema, doc.data());
}

export async function listAnalysesByCustomer(
  customerId: string,
  options: {
    limit?: number;
    startAfter?: string;
  } = {}
): Promise<{ items: Analysis[]; hasMore: boolean }> {
  const limit = options.limit ?? 20;

  let query = db
    .collection(COLLECTION)
    .where("customerId", "==", customerId)
    .limit(limit + 1);

  if (options.startAfter) {
    const startDoc = await db.collection(COLLECTION).doc(options.startAfter).get();
    if (startDoc.exists) {
      query = query.startAfter(startDoc);
    }
  }

  const snapshot = await query.get();
  const docs = snapshot.docs;
  const hasMore = docs.length > limit;
  const sliced = docs.slice(0, limit).map((doc) => validate(analysisSchema, doc.data()));
  const items = sliced.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return { items, hasMore };
}

export async function countAnalysesByCustomer(customerId: string): Promise<number> {
  const snapshot = await db
    .collection(COLLECTION)
    .where("customerId", "==", customerId)
    .count()
    .get();
  return snapshot.data().count;
}
