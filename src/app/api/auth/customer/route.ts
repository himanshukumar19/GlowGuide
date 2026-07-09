import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getCustomerById, createCustomer, setUserRole } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if ("error" in authResult) return authResult.error;
    const uid = authResult.uid;

    const body = await request.json();
    const { displayName, email, photoURL } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Email is required" } },
        { status: 400 }
      );
    }

    const existing = await getCustomerById(uid);
    if (existing) {
      return NextResponse.json({ message: "Customer already exists" });
    }

    const customer = await createCustomer(uid, { displayName, email, photoURL });
    await setUserRole(uid, "CUSTOMER");
    return NextResponse.json(
      { message: "Customer created", customer },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create customer" } },
      { status: 500 }
    );
  }
}
