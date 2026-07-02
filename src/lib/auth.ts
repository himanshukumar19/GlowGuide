import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";

export async function verifyAuth(
  request: NextRequest
): Promise<{ uid: string } | { error: NextResponse }> {
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
    return { uid: decoded.uid };
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
