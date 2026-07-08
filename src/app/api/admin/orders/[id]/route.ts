import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getCustomerById } from "@/lib/models";
import { getOrderById, updateOrderStatus } from "@/lib/models/order";

async function requireAdmin(request: NextRequest) {
  const authResult = await verifyAuth(request);
  if ("error" in authResult) return { error: authResult.error };

  const customer = await getCustomerById(authResult.uid);
  if (!customer || customer.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      ),
    };
  }
  return { uid: authResult.uid };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await requireAdmin(request);
    if ("error" in adminCheck) return adminCheck.error;

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
    const adminCheck = await requireAdmin(request);
    if ("error" in adminCheck) return adminCheck.error;

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
