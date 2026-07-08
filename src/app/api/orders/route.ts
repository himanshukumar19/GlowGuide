import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { listOrdersByCustomer } from "@/lib/models/order";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if ("error" in authResult) return authResult.error;
    const uid = authResult.uid;

    const orders = await listOrdersByCustomer(uid);
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("listOrders error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch orders" } },
      { status: 500 }
    );
  }
}
