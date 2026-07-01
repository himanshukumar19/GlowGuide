import { Router, Request, Response } from "express";
import crypto from "crypto";
import { requireAuth } from "../middleware/requireAuth";
import { db } from "../config/firebase-admin";
import { razorpay, SUBSCRIPTION_AMOUNT, SUBSCRIPTION_CURRENCY, SUBSCRIPTION_DESCRIPTION } from "../lib/razorpay";

const router = Router();

router.post("/create-order", requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;
    const doc = await db.collection("customers").doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found" } });
    }

    const customer = doc.data()!;
    if (customer.subscriptionTier === "PAID") {
      return res.status(400).json({ error: { code: "ALREADY_PAID", message: "Already subscribed to Pro" } });
    }

    const order = await razorpay.orders.create({
      amount: SUBSCRIPTION_AMOUNT,
      currency: SUBSCRIPTION_CURRENCY,
      receipt: `sub_${uid}_${Date.now()}`,
      notes: { customerId: uid, type: "subscription" },
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID!,
      description: SUBSCRIPTION_DESCRIPTION,
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to create order" } });
  }
});

router.post("/verify", requireAuth, async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: { code: "INVALID_INPUT", message: "Missing payment details" } });
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: { code: "INVALID_SIGNATURE", message: "Payment verification failed" } });
    }

    const uid = req.uid!;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await db.collection("customers").doc(uid).update({
      subscriptionTier: "PAID",
      subscriptionExpiresAt: expiresAt.toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.json({ success: true, subscriptionExpiresAt: expiresAt.toISOString() });
  } catch (error: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to verify payment" } });
  }
});

export default router;
