'use client';
import { useParams } from "next/navigation";

import { useState } from "react";

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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, Package, Truck, CheckCircle } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetail {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  date: string;
}

const MOCK_ORDER: OrderDetail = {
  id: "ORD-001",
  customerName: "Priya Sharma",
  customerEmail: "priya@example.com",
  customerPhone: "+91 98765 43210",
  shippingAddress: {
    street: "42, Greenfield Apartments, Brigade Road",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    country: "India",
  },
  paymentMethod: "Credit Card (Visa ending in 4242)",
  items: [
    { name: "Centella Calming Serum", quantity: 2, price: 39.99 },
    { name: "Ceramide Moisture Barrier Cream", quantity: 1, price: 45.01 },
  ],
  subtotal: 124.99,
  tax: 9.99,
  shipping: 0,
  discount: 4.99,
  total: 129.99,
  status: "delivered",
  date: "2026-06-25",
};

const statusColorMap: Record<OrderDetail["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
};

const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail>({
    ...MOCK_ORDER,
    id: id || MOCK_ORDER.id,
  });
  const [selectedStatus, setSelectedStatus] = useState<OrderDetail["status"]>(order.status);

  const handleUpdateStatus = () => {
    setOrder((prev) => ({ ...prev, status: selectedStatus }));
    toast({
      title: "Status Updated",
      description: `Order ${order.id} status changed to ${selectedStatus}.`,
    });
  };

  const handleMarkShipped = () => {
    setOrder((prev) => ({ ...prev, status: "shipped" }));
    setSelectedStatus("shipped");
    toast({
      title: "Order Shipped",
      description: `Order ${order.id} has been marked as shipped.`,
    });
  };

  const handleMarkDelivered = () => {
    setOrder((prev) => ({ ...prev, status: "delivered" }));
    setSelectedStatus("delivered");
    toast({
      title: "Order Delivered",
      description: `Order ${order.id} has been marked as delivered.`,
    });
  };

  return (
    <AdminLayout title={`Order #${order.id}`} backTo="/admin/orders">
      <div className="space-y-6">
        {/* Order Info Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Placed on {order.date}
            </p>
            <Badge className={statusColorMap[order.status]} variant="outline">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {order.status !== "shipped" && order.status !== "delivered" && (
              <Button variant="outline" size="sm" onClick={handleMarkShipped}>
                <Truck className="h-4 w-4 mr-1.5" />
                Mark as Shipped
              </Button>
            )}
            {order.status !== "delivered" && (
              <Button variant="outline" size="sm" onClick={handleMarkDelivered}>
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Mark as Delivered
              </Button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-muted-foreground">{order.customerEmail}</p>
              <p className="text-muted-foreground">{order.customerPhone}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.pincode}
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>{order.paymentMethod}</p>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${(item.quantity * item.price).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Total Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Select
                  value={selectedStatus}
                  onValueChange={(val) => setSelectedStatus(val as OrderDetail["status"])}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleUpdateStatus}>Update Status</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
