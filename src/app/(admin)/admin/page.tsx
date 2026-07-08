'use client';

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Users,
  FileBarChart,
  Activity,
  Package,
  Eye,
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
import { api } from "@/api/client";
import { MOCK_HISTORY } from "@/data/analysisHistory";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
  pending: "outline",
};

const recentAnalyses = MOCK_HISTORY.slice(-3).reverse();

interface AdminStats {
  productCount: number;
  customerCount: number;
  orderCount: number;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    customerName: string;
  }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    productCount: 0,
    customerCount: 0,
    orderCount: 0,
    recentOrders: [],
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.get<AdminStats>("/api/admin/stats");
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      }
    }
    fetchStats();
  }, []);

  const analysesToday = MOCK_HISTORY.filter((h) =>
    h.date.startsWith(new Date().toISOString().split("T")[0])
  ).length;

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatsCard
            icon={Package}
            label="Total Products"
            value={stats.productCount}
            trend={{ direction: "up", percentage: 12 }}
          />
          <AdminStatsCard
            icon={ShoppingBag}
            label="Total Orders"
            value={stats.orderCount}
            trend={{ direction: "up", percentage: 8 }}
          />
          <AdminStatsCard
            icon={Users}
            label="Total Customers"
            value={stats.customerCount}
            trend={{ direction: "up", percentage: 5 }}
          />
          <AdminStatsCard
            icon={Activity}
            label="Analyses Today"
            value={analysesToday || 3}
            trend={{ direction: "up", percentage: 15 }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No orders yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
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
                        <TableCell>{order.customerName}</TableCell>
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

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Recent Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                  {recentAnalyses.map((analysis) => (
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
