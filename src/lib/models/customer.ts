import { auth, db } from "@/lib/firebase-admin";
import { validate } from "@/lib/validators";
import { customerSchema, type Customer } from "@/lib/schemas";

export async function getCustomerById(uid: string): Promise<Customer | null> {
  const doc = await db.collection("customers").doc(uid).get();
  if (!doc.exists) return null;
  return validate(customerSchema, doc.data());
}

export async function updateCustomer(
  uid: string,
  data: Partial<Customer>
): Promise<void> {
  const validated = validate(customerSchema.partial(), data);
  await db.collection("customers").doc(uid).update({
    ...validated,
    updatedAt: new Date().toISOString(),
  });
}

export async function createCustomer(
  uid: string,
  data: {
    email: string;
    displayName: string;
    photoURL?: string | null;
  }
): Promise<Customer> {
  const now = new Date().toISOString();
  const customer = validate(customerSchema, {
    uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL || null,
    phone: "",
    role: "CUSTOMER",
    subscriptionTier: "FREE",
    subscriptionStatus: null,
    subscriptionExpiresAt: null,
    subscriptionStartedAt: null,
    subscriptionCancelledAt: null,
    subscriptionPlanId: null,
    analysisCount: 0,
    skinProfile: null,
    profileCompleted: false,
    createdAt: now,
    updatedAt: now,
  });
  await db.collection("customers").doc(uid).set(customer);
  return customer;
}

export async function countAllCustomers(): Promise<number> {
  const snapshot = await db.collection("customers").count().get();
  return snapshot.data().count;
}

export async function setUserRole(
  uid: string,
  role: "CUSTOMER" | "ADMIN"
): Promise<void> {
  await auth.setCustomUserClaims(uid, { role });
}
