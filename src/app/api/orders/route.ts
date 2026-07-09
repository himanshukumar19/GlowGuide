import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/api-auth";
import { listOrdersByCustomer } from "@/lib/models/order";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await authorize(request, ["CUSTOMER"]);
    if ("error" in authCheck) return authCheck.error;

    const orders = await listOrdersByCustomer(authCheck.uid);
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("listOrders error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch orders" } },
      { status: 500 }
    );
  }
}
