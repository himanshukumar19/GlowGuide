import { db } from "@/lib/firebase-admin";
import { validate } from "@/lib/validators";
import { paymentSchema, type Payment } from "@/lib/schemas";

export async function createPayment(id: string, data: Payment): Promise<void> {
  const payment = validate(paymentSchema, data);
  await db.collection("payments").doc(id).set(payment);
}

export async function updatePayment(
  id: string,
  data: Partial<Payment>
): Promise<void> {
  const validated = validate(paymentSchema.partial(), data);
  await db.collection("payments").doc(id).update({
    ...validated,
    updatedAt: new Date().toISOString(),
  });
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const doc = await db.collection("payments").doc(id).get();
  if (!doc.exists) return null;
  return validate(paymentSchema, doc.data());
}
