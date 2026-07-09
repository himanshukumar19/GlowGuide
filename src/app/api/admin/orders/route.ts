import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/api-auth";
import { listAllOrders } from "@/lib/models/order";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await authorize(request, ["ADMIN"]);
    if ("error" in authCheck) return authCheck.error;

    const orders = await listAllOrders();
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("admin listOrders error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch orders" } },
      { status: 500 }
    );
  }
}
