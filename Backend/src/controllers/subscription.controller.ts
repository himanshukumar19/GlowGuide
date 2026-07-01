import crypto from "crypto";
import { Request, Response } from "express";
import { razorpay } from "../lib/razorpay";
import { DEFAULT_PAID_PLAN } from "../config/subscription-plans";
import { ValidationError } from "../validators";
import { getCustomerById, updateCustomer, createPayment, updatePayment, setSubscription } from "../models";

async function createOrder(req: Request, res: Response) {
  try {
    const uid = req.uid!;
    const customer = await getCustomerById(uid);
    if (!customer) {
      return res.status(404).json({ error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found" } });
    }

    if (customer.subscriptionTier === "PAID") {
      return res.status(400).json({ error: { code: "ALREADY_PAID", message: "Already subscribed to Pro" } });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: DEFAULT_PAID_PLAN.price,
      currency: DEFAULT_PAID_PLAN.currency,
      receipt: `sub_${Date.now()}`,
      notes: { customerId: uid, type: "subscription" },
    });

    const nowISO = new Date().toISOString();

    await createPayment(razorpayOrder.id, {
      id: razorpayOrder.id,
      customerId: uid,
      type: "SUBSCRIPTION",
      amount: DEFAULT_PAID_PLAN.price,
      currency: DEFAULT_PAID_PLAN.currency,
      razorpayOrderId: razorpayOrder.id,
      status: "PENDING",
      description: DEFAULT_PAID_PLAN.name,
      createdAt: nowISO,
      updatedAt: nowISO,
    });

    return res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID!,
      description: DEFAULT_PAID_PLAN.name,
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
    }
    console.error("createOrder error:", error);
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to create order" } });
  }
}

async function verifyPayment(req: Request, res: Response) {
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
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + DEFAULT_PAID_PLAN.durationMonths);

    const nowISO = now.toISOString();
    const expiresISO = expiresAt.toISOString();

    await updatePayment(razorpayOrderId, {
      razorpayPaymentId,
      razorpaySignature,
      status: "CAPTURED",
    });

    await setSubscription(uid, {
      customerId: uid,
      tier: "PAID",
      status: "ACTIVE",
      planId: DEFAULT_PAID_PLAN.id,
      startedAt: nowISO,
      expiresAt: expiresISO,
      renewedAt: nowISO,
      currentPeriodStart: nowISO,
      currentPeriodEnd: expiresISO,
      createdAt: nowISO,
      updatedAt: nowISO,
    });

    await updateCustomer(uid, {
      subscriptionTier: "PAID",
      subscriptionStatus: "ACTIVE",
      subscriptionExpiresAt: expiresISO,
      subscriptionStartedAt: nowISO,
      subscriptionPlanId: DEFAULT_PAID_PLAN.id,
    });

    return res.json({ success: true, subscriptionExpiresAt: expiresISO });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
    }
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to verify payment" } });
  }
}

export const subscriptionController = { createOrder, verifyPayment };
