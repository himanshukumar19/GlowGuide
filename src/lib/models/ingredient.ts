import { db } from "@/lib/firebase-admin";
import { validate } from "@/lib/validators";
import { ingredientSchema, type Ingredient } from "@/lib/schemas";

export async function getAllIngredients(): Promise<Ingredient[]> {
  const snapshot = await db.collection("ingredients").get();
  return snapshot.docs.map((doc) => validate(ingredientSchema, doc.data()));
}

export async function getIngredientById(id: string): Promise<Ingredient | null> {
  const doc = await db.collection("ingredients").doc(id).get();
  if (!doc.exists) return null;
  return validate(ingredientSchema, doc.data());
}

export async function createIngredient(
  data: Omit<Ingredient, "id" | "createdAt" | "updatedAt">
): Promise<Ingredient> {
  const ref = db.collection("ingredients").doc();
  const now = new Date().toISOString();
  const ingredient: Ingredient = { ...data, id: ref.id, createdAt: now, updatedAt: now };
  await ref.set(ingredient);
  return ingredient;
}

export async function updateIngredient(
  id: string,
  data: Partial<Omit<Ingredient, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  await db.collection("ingredients").doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteIngredient(id: string): Promise<void> {
  await db.collection("ingredients").doc(id).delete();
}

export async function countIngredients(): Promise<number> {
  const snapshot = await db.collection("ingredients").count().get();
  return snapshot.data().count;
}
