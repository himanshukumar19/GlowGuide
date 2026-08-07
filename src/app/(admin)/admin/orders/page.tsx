'use client';

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, Download, Loader2 } from "lucide-react";
import { api } from "@/api/client";
import type { Order } from "@/lib/schemas";

const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await api.get<Order[]>("/api/admin/orders");
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast({ title: "No orders to export", variant: "destructive" });
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Email",
      "Phone",
      "Items Count",
      "Subtotal",
      "Tax",
      "Total",
      "Status",
    ];

    const rows = filteredOrders.map((order) => [
      order.id,
      new Date(order.createdAt).toISOString().split("T")[0],
      `"${(order.shippingAddress?.fullName || "N/A").replace(/"/g, '""')}"`,
      `"${(order.shippingAddress?.email || "N/A").replace(/"/g, '""')}"`,
      `"${(order.shippingAddress?.phone || "N/A").replace(/"/g, '""')}"`,
      order.items?.length || 0,
      order.subtotal || 0,
      order.tax || 0,
      order.total || 0,
      order.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `glowguide_orders_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Orders Exported",
      description: `Successfully exported ${filteredOrders.length} orders to CSV.`,
    });
  };

  return (
    <AdminLayout title="Orders">
      <Card className="shadow-card">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1.5" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium font-mono text-xs">
                        {order.id.slice(0, 12)}...
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-center">
                        {order.items.length}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{order.total.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={statusColorMap[order.status]}
                          variant="outline"
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {!loading && filteredOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No orders found matching the selected filter.
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminOrders;
