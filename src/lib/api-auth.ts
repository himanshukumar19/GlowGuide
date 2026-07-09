import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getCustomerById } from "@/lib/models";

type Role = "CUSTOMER" | "ADMIN";

export async function authorize(
  request: NextRequest,
  allowedRoles: Role[]
): Promise<{ uid: string } | { error: NextResponse }> {
  const authResult = await requireRole(request, allowedRoles);
  if ("error" in authResult) return authResult;

  const customer = await getCustomerById(authResult.uid);
  if (!customer || !allowedRoles.includes(customer.role)) {
    return {
      error: NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Insufficient permissions",
          },
        },
        { status: 403 }
      ),
    };
  }

  return { uid: authResult.uid };
}
