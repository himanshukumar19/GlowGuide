import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getOrderById, updateOrderStatus } from "@/lib/models/order";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if ("error" in authResult) return authResult.error;

    const order = await getOrderById(params.id);
    if (!order) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    if (order.customerId !== authResult.uid) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You can only cancel your own orders" } },
        { status: 403 }
      );
    }

    if (order.status !== "pending" && order.status !== "confirmed") {
      return NextResponse.json(
        { error: { code: "INVALID_STATUS", message: "Only pending or confirmed orders can be cancelled" } },
        { status: 400 }
      );
    }

    await updateOrderStatus(params.id, "cancelled");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("cancelOrder error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to cancel order" } },
      { status: 500 }
    );
  }
}
