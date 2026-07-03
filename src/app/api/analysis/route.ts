import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getCustomerById } from "@/lib/models";
import { listAnalysesByCustomer } from "@/lib/models";
import type { Analysis } from "@/lib/schemas/analysis";

const FREE_TIER_LIMIT = 3;

interface AnalysisListItem {
  id: string;
  date: string;
  healthScore: number;
  skinType: Analysis["result"]["skinType"];
  confidence: number;
  concerns: { name: string; severity: number }[];
  notes?: string;
  routine: Analysis["result"]["routine"];
}

function toListItem(analysis: Analysis): AnalysisListItem {
  return {
    id: analysis.id,
    date: analysis.createdAt,
    healthScore: analysis.result.healthScore,
    skinType: analysis.result.skinType,
    confidence: analysis.result.confidence,
    concerns: analysis.result.concerns.map((c) => ({
      name: c.name,
      severity: c.severity,
    })),
    notes: analysis.skinNotes ?? undefined,
    routine: analysis.result.routine,
  };
}

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 50) : 20;

  const { items, hasMore } = await listAnalysesByCustomer(customer.uid, {
    limit,
  });

  // Apply tier-based visibility rules
  let visibleItems = items;
  if (customer.subscriptionTier === "FREE") {
    visibleItems = items.slice(0, FREE_TIER_LIMIT);
  } else {
    // Paid tier: last 12 months
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 12);
    const cutoffIso = cutoff.toISOString();
    visibleItems = items.filter((item) => item.createdAt >= cutoffIso);
  }

  return NextResponse.json({
    items: visibleItems.map(toListItem),
    total: visibleItems.length,
    limit,
    hasMore: customer.subscriptionTier === "FREE" ? false : hasMore,
  });
}
