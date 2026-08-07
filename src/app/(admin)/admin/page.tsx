'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Users,
  FileBarChart,
  Activity,
  Package,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/api/client";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
  pending: "outline",
};

interface AdminStats {
  productCount: number;
  customerCount: number;
  orderCount: number;
  analysisCount: number;
  lowStockCount: number;
  analysesToday: number;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    customerName: string;
  }>;
  recentAnalyses: Array<{
    id: string;
    date: string;
    skinType: string;
    healthScore: number;
    confidence: number;
    status: string;
  }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    productCount: 0,
    customerCount: 0,
    orderCount: 0,
    analysisCount: 0,
    lowStockCount: 0,
    analysesToday: 0,
    recentOrders: [],
    recentAnalyses: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.get<AdminStats>("/api/admin/stats");
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatsCard
            icon={Package}
            label="Total Products"
            value={stats.productCount}
          />
          <AdminStatsCard
            icon={ShoppingBag}
            label="Total Orders"
            value={stats.orderCount}
          />
          <AdminStatsCard
            icon={Users}
            label="Total Customers"
            value={stats.customerCount}
          />
          <AdminStatsCard
            icon={Activity}
            label="Analyses Today"
            value={stats.analysesToday}
          />
        </div>

        {/* Low Stock Warning Alert */}
        {stats.lowStockCount > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Low Stock Inventory Alert</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {stats.lowStockCount} {stats.lowStockCount === 1 ? "product has" : "products have"} less than 5 items remaining in stock.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-amber-300 bg-white hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900 dark:hover:bg-amber-800" asChild>
              <Link href="/admin/products">View Products</Link>
            </Button>
          </div>
        )}

        {/* Analytics & History Tables */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
                Recent Orders
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No orders recorded yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium font-mono text-xs">
                          {order.id.slice(0, 10)}...
                        </TableCell>
                        <TableCell className="max-w-[120px] truncate">{order.customerName}</TableCell>
                        <TableCell className="text-right">
                          ₹{order.total.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[order.status] || "outline"}>
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Analyses */}
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Recent Skin Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentAnalyses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No skin analyses completed yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Skin Type</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentAnalyses.map((analysis) => (
                      <TableRow key={analysis.id}>
                        <TableCell className="font-medium">
                          {new Date(analysis.date).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell className="capitalize">{analysis.skinType}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {analysis.healthScore}
                        </TableCell>
                        <TableCell>{(analysis.confidence * 100).toFixed(0)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
