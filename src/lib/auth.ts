import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import type { DecodedIdToken } from "firebase-admin/auth";

export interface AuthResult {
  uid: string;
  decoded: DecodedIdToken;
}

export async function verifyAuth(
  request: NextRequest
): Promise<AuthResult | { error: NextResponse }> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        {
          error: {
            code: "MISSING_TOKEN",
            message: "Missing or invalid token",
          },
        },
        { status: 401 }
      ),
    };
  }

  try {
    const token = header.split("Bearer ")[1]!;
    const decoded = await auth.verifyIdToken(token);
    return { uid: decoded.uid, decoded };
  } catch {
    return {
      error: NextResponse.json(
        {
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid or expired token",
          },
        },
        { status: 401 }
      ),
    };
  }
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<AuthResult | { error: NextResponse }> {
  const authResult = await verifyAuth(request);
  if ("error" in authResult) return authResult;

  const role = authResult.decoded.role as string | undefined;
  if (!role || !allowedRoles.includes(role)) {
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

  return authResult;
}
