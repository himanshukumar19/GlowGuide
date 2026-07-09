import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/api-auth";
import { razorpay } from "@/lib/razorpay";
import { DEFAULT_PAID_PLAN } from "@/lib/subscription-plans";
import {
  getCustomerById,
  createPayment,
} from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const authCheck = await authorize(request, ["CUSTOMER"]);
    if ("error" in authCheck) return authCheck.error;
    const uid = authCheck.uid;

    const customer = await getCustomerById(uid);
    if (!customer) {
      return NextResponse.json(
        { error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found" } },
        { status: 404 }
      );
    }

    if (customer.subscriptionTier === "PAID") {
      return NextResponse.json(
        { error: { code: "ALREADY_PAID", message: "Already subscribed to Pro" } },
        { status: 400 }
      );
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

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID!,
      description: DEFAULT_PAID_PLAN.name,
    });
  } catch (error: any) {
    console.error("createOrder error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create order" } },
      { status: 500 }
    );
  }
}
