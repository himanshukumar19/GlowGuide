import { db } from "@/lib/firebase-admin";
import { validate } from "@/lib/validators";
import { productSchema, type Product } from "@/lib/schemas";

export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await db.collection("products").get();
  return snapshot.docs.map((doc) => validate(productSchema, doc.data()));
}

export async function getProductById(id: string): Promise<Product | null> {
  const doc = await db.collection("products").doc(id).get();
  if (!doc.exists) return null;
  return validate(productSchema, doc.data());
}

export async function createProduct(id: string, data: Product): Promise<void> {
  const product = validate(productSchema, data);
  await db.collection("products").doc(id).set({
    ...product,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<void> {
  const validated = validate(productSchema.partial(), data);
  await db.collection("products").doc(id).update({
    ...validated,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await db.collection("products").doc(id).delete();
}

export async function countProducts(): Promise<number> {
  const snapshot = await db.collection("products").count().get();
  return snapshot.data().count;
}
