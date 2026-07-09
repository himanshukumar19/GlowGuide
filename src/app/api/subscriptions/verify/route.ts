import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/api-auth";
import { DEFAULT_PAID_PLAN } from "@/lib/subscription-plans";
import {
  updatePayment,
  setSubscription,
  updateCustomer,
} from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const authCheck = await authorize(request, ["CUSTOMER"]);
    if ("error" in authCheck) return authCheck.error;
    const uid = authCheck.uid;

    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Missing payment details" } },
        { status: 400 }
      );
    }

    const sigBody = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sigBody)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { error: { code: "INVALID_SIGNATURE", message: "Payment verification failed" } },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      success: true,
      subscriptionExpiresAt: expiresISO,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to verify payment" } },
      { status: 500 }
    );
  }
}
