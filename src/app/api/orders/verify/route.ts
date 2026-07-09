import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/api-auth";
import { updatePayment, getPaymentById } from "@/lib/models";
import { getOrderById, updateOrderStatus } from "@/lib/models/order";
import { getProductById, updateProduct } from "@/lib/models/product";

export async function POST(request: NextRequest) {
  try {
    const authCheck = await authorize(request, ["CUSTOMER"]);
    if ("error" in authCheck) return authCheck.error;

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

    await updatePayment(razorpayOrderId, {
      razorpayPaymentId,
      razorpaySignature,
      status: "CAPTURED",
    });

    const payment = await getPaymentById(razorpayOrderId);
    if (!payment?.orderId) {
      return NextResponse.json(
        { error: { code: "ORDER_NOT_FOUND", message: "No order linked to this payment" } },
        { status: 404 }
      );
    }

    const order = await getOrderById(payment.orderId);
    if (!order) {
      return NextResponse.json(
        { error: { code: "ORDER_NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    for (const item of order.items) {
      const product = await getProductById(item.id);
      if (product) {
        const newStock = Math.max(0, product.stockCount - item.quantity);
        await updateProduct(item.id, { stockCount: newStock });
      }
    }

    await updateOrderStatus(payment.orderId, "confirmed", {
      razorpayPaymentId,
    });

    return NextResponse.json({
      success: true,
      orderId: payment.orderId,
    });
  } catch (error: any) {
    console.error("verifyOrder error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to verify payment" } },
      { status: 500 }
    );
  }
}
