import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getCustomerById } from "@/lib/models";
import { listAllOrders } from "@/lib/models/order";

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

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if ("error" in adminCheck) return adminCheck.error;

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
