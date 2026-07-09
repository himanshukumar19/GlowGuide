import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/api-auth";
import { razorpay } from "@/lib/razorpay";
import { getCustomerById, createPayment, createOrder } from "@/lib/models";
import { getProductById } from "@/lib/models/product";
import { validate } from "@/lib/validators";
import { addressSchema } from "@/lib/schemas";

interface OrderPayload {
  items: { productId: string; name: string; image: string; price: number; quantity: number }[];
  shippingAddress: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    type: "home" | "office";
  };
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  promoCode?: string;
}

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

    const body: OrderPayload = await request.json();

    // Validate shipping address server-side
    try {
      validate(addressSchema, body.shippingAddress);
    } catch (validationError: any) {
      return NextResponse.json(
        { error: { code: "INVALID_ADDRESS", message: validationError.message } },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: { code: "EMPTY_CART", message: "Cart is empty" } },
        { status: 400 }
      );
    }

    for (const item of body.items) {
      const product = await getProductById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: { code: "PRODUCT_NOT_FOUND", message: `Product ${item.productId} not found` } },
          { status: 404 }
        );
      }
      if (product.stockCount < item.quantity) {
        return NextResponse.json(
          { error: { code: "INSUFFICIENT_STOCK", message: `Insufficient stock for ${product.name}. Available: ${product.stockCount}` } },
          { status: 400 }
        );
      }
    }

    const amountInPaise = Math.round(body.total * 100);
    const receipt = `order_${Date.now()}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: { customerId: uid, type: "order" },
    });

    const nowISO = new Date().toISOString();
    const orderId = `ORD-${Date.now()}`;

    await createOrder(orderId, {
      id: orderId,
      customerId: uid,
      items: body.items.map((item) => ({
        id: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress: body.shippingAddress,
      subtotal: body.subtotal,
      tax: body.tax,
      shipping: body.shipping,
      discount: body.discount,
      total: body.total,
      promoCode: body.promoCode,
      razorpayOrderId: razorpayOrder.id,
      razorpayPaymentId: "",
      status: "pending",
      createdAt: nowISO,
      updatedAt: nowISO,
    });

    await createPayment(razorpayOrder.id, {
      id: razorpayOrder.id,
      customerId: uid,
      type: "ORDER",
      orderId,
      amount: amountInPaise,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      status: "PENDING",
      description: `Order ${orderId}`,
      createdAt: nowISO,
      updatedAt: nowISO,
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      appOrderId: orderId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID!,
    });
  } catch (error: any) {
    console.error("createOrder error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create order" } },
      { status: 500 }
    );
  }
}
