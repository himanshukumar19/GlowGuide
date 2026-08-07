import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/api-auth";
import { countProducts } from "@/lib/models/product";
import { countAllCustomers } from "@/lib/models/customer";
import { db } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await authorize(request, ["ADMIN"]);
    if ("error" in authCheck) return authCheck.error;

    const todayStr = new Date().toISOString().split("T")[0];

    const [
      productCount,
      customerCount,
      orderSnapshot,
      lowStockSnapshot,
      analysesCountSnapshot,
      recentOrdersSnapshot,
      recentAnalysesSnapshot,
    ] = await Promise.all([
      countProducts(),
      countAllCustomers(),
      db.collection("orders").count().get(),
      db.collection("products").where("stockCount", "<", 5).get(),
      db.collection("analyses").count().get(),
      db.collection("orders").orderBy("createdAt", "desc").limit(5).get(),
      db.collection("analyses").orderBy("createdAt", "desc").limit(5).get(),
    ]);

    const orderCount = orderSnapshot.data().count;
    const analysisCount = analysesCountSnapshot.data().count;
    const lowStockCount = lowStockSnapshot.size;

    const recentOrders = recentOrdersSnapshot.docs.map((doc) => ({
      id: doc.id,
      total: doc.data().total || 0,
      status: doc.data().status || "pending",
      createdAt: doc.data().createdAt || new Date().toISOString(),
      customerName: doc.data().shippingAddress?.fullName || "Unknown",
    }));

    const recentAnalyses = recentAnalysesSnapshot.docs.map((doc) => {
      const data = doc.data();
      const result = data.result || {};
      return {
        id: doc.id,
        date: data.createdAt || new Date().toISOString(),
        skinType: result.skinType || "normal",
        healthScore: result.healthScore || 80,
        confidence: result.confidence || 0.85,
        status: data.status || "completed",
      };
    });

    const analysesToday = recentAnalyses.filter((a) =>
      a.date.startsWith(todayStr)
    ).length;

    return NextResponse.json({
      productCount,
      customerCount,
      orderCount,
      analysisCount,
      lowStockCount,
      analysesToday,
      recentOrders,
      recentAnalyses,
    });
  } catch (error: any) {
    console.error("admin stats error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch stats" } },
      { status: 500 }
    );
  }
}
