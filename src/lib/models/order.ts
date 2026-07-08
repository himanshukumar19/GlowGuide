import { db } from "@/lib/firebase-admin";
import { validate } from "@/lib/validators";
import { orderSchema, type Order } from "@/lib/schemas";

export async function createOrder(id: string, data: Order): Promise<void> {
  const order = validate(orderSchema, data);
  await db.collection("orders").doc(id).set({
    ...order,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function getOrderById(id: string): Promise<Order | null> {
  const doc = await db.collection("orders").doc(id).get();
  if (!doc.exists) return null;
  return validate(orderSchema, doc.data());
}

export async function listOrdersByCustomer(
  customerId: string
): Promise<Order[]> {
  const snapshot = await db
    .collection("orders")
    .where("customerId", "==", customerId)
    .get();
  const orders = snapshot.docs.map((doc) => validate(orderSchema, doc.data()));
  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function listAllOrders(): Promise<Order[]> {
  const snapshot = await db
    .collection("orders")
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) =>
    validate(orderSchema, { id: doc.id, ...doc.data() })
  );
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"],
  extra?: Partial<Order>
): Promise<void> {
  await db.collection("orders").doc(id).update({
    status,
    ...extra,
    updatedAt: new Date().toISOString(),
  });
}
