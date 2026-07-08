import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getCustomerById } from "@/lib/models";
import { countProducts } from "@/lib/models/product";
import { countAllCustomers } from "@/lib/models/customer";
import { db } from "@/lib/firebase-admin";

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

    const [productCount, customerCount, orderSnapshot] = await Promise.all([
      countProducts(),
      countAllCustomers(),
      db.collection("orders").count().get(),
    ]);

    const orderCount = orderSnapshot.data().count;

    const recentOrdersSnapshot = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    const recentOrders = recentOrdersSnapshot.docs.map((doc) => ({
      id: doc.id,
      total: doc.data().total,
      status: doc.data().status,
      createdAt: doc.data().createdAt,
      customerName: doc.data().shippingAddress?.fullName || "Unknown",
    }));

    return NextResponse.json({
      productCount,
      customerCount,
      orderCount,
      recentOrders,
    });
  } catch (error: any) {
    console.error("admin stats error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch stats" } },
      { status: 500 }
    );
  }
}
