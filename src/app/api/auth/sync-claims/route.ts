import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getCustomerById, setUserRole } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if ("error" in authResult) return authResult.error;

    const customer = await getCustomerById(authResult.uid);
    if (!customer) {
      return NextResponse.json(
        { error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found" } },
        { status: 404 }
      );
    }

    await setUserRole(authResult.uid, customer.role);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("sync-claims error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to sync claims" } },
      { status: 500 }
    );
  }
}
