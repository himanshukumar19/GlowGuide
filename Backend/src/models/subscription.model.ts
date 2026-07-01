import { db } from "../config/firebase-admin";
import { validate } from "../validators";
import { subscriptionSchema, type Subscription } from "../schemas";

export async function setSubscription(uid: string, data: Subscription): Promise<void> {
  const sub = validate(subscriptionSchema, data);
  await db.collection("subscriptions").doc(uid).set(sub);
}

export async function getSubscriptionByCustomerId(uid: string): Promise<Subscription | null> {
  const doc = await db.collection("subscriptions").doc(uid).get();
  if (!doc.exists) return null;
  return validate(subscriptionSchema, doc.data());
}
