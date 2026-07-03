import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getCustomerById } from "@/lib/models";
import { getAnalysisById } from "@/lib/models";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await verifyAuth(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  const customer = await getCustomerById(authResult.uid);
  if (!customer) {
    return NextResponse.json(
      { error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found" } },
      { status: 404 }
    );
  }

  const analysis = await getAnalysisById(params.id);
  if (!analysis) {
    return NextResponse.json(
      { error: { code: "ANALYSIS_NOT_FOUND", message: "Analysis not found" } },
      { status: 404 }
    );
  }

  if (analysis.customerId !== customer.uid) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Forbidden" } },
      { status: 403 }
    );
  }

  return NextResponse.json(analysis);
}
