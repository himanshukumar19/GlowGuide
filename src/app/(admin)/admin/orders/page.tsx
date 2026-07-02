'use client';

import { useState, useMemo } from "react";
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
import { Eye } from "lucide-react";

interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  itemsCount: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered";
}

const MOCK_ORDERS: AdminOrder[] = [
  {
    id: "ORD-001",
    customerName: "Priya Sharma",
    customerEmail: "priya@example.com",
    date: "2026-06-25",
    itemsCount: 3,
    total: 124.99,
    status: "delivered",
  },
  {
    id: "ORD-002",
    customerName: "Ananya Patel",
    customerEmail: "ananya@example.com",
    date: "2026-06-24",
    itemsCount: 1,
    total: 49.99,
    status: "shipped",
  },
  {
    id: "ORD-003",
    customerName: "Rahul Verma",
    customerEmail: "rahul@example.com",
    date: "2026-06-24",
    itemsCount: 5,
    total: 299.95,
    status: "processing",
  },
  {
    id: "ORD-004",
    customerName: "Neha Gupta",
    customerEmail: "neha@example.com",
    date: "2026-06-23",
    itemsCount: 2,
    total: 89.98,
    status: "pending",
  },
  {
    id: "ORD-005",
    customerName: "Arjun Singh",
    customerEmail: "arjun@example.com",
    date: "2026-06-22",
    itemsCount: 4,
    total: 189.96,
    status: "pending",
  },
  {
    id: "ORD-006",
    customerName: "Kavya Reddy",
    customerEmail: "kavya@example.com",
    date: "2026-06-21",
    itemsCount: 2,
    total: 74.50,
    status: "shipped",
  },
  {
    id: "ORD-007",
    customerName: "Vikram Joshi",
    customerEmail: "vikram@example.com",
    date: "2026-06-20",
    itemsCount: 1,
    total: 39.99,
    status: "delivered",
  },
  {
    id: "ORD-008",
    customerName: "Isha Kapoor",
    customerEmail: "isha@example.com",
    date: "2026-06-19",
    itemsCount: 6,
    total: 359.94,
    status: "processing",
  },
];

const statusColorMap: Record<AdminOrder["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
};

const AdminOrders = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return MOCK_ORDERS;
    return MOCK_ORDERS.filter((o) => o.status === statusFilter);
  }, [statusFilter]);

  return (
    <AdminLayout title="Orders">
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Orders</CardTitle>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
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
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell className="text-center">{order.itemsCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColorMap[order.status]} variant="outline">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
          </div>
          {filteredOrders.length === 0 && (
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
