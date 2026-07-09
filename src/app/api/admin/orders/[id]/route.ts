import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/api-auth";
import { getOrderById, updateOrderStatus } from "@/lib/models/order";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await authorize(request, ["ADMIN"]);
    if ("error" in authCheck) return authCheck.error;

    const order = await getOrderById(params.id);
    if (!order) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("admin getOrder error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch order" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await authorize(request, ["ADMIN"]);
    if ("error" in authCheck) return authCheck.error;

    const body = await request.json();
    const { status } = body;

    if (
      !status ||
      !["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(
        status
      )
    ) {
      return NextResponse.json(
        { error: { code: "INVALID_STATUS", message: "Invalid order status" } },
        { status: 400 }
      );
    }

    const existing = await getOrderById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    await updateOrderStatus(params.id, status);
    const updated = await getOrderById(params.id);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("admin updateOrderStatus error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update order status" } },
      { status: 500 }
    );
  }
}
