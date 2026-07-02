import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getCustomerById } from "@/lib/models";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if ("error" in authResult) return authResult.error;
    const uid = authResult.uid;

    const customer = await getCustomerById(uid);
    if (!customer) {
      return NextResponse.json(
        { error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ customer });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch customer" } },
      { status: 500 }
    );
  }
}
