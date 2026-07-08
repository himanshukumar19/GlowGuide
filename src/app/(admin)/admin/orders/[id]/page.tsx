'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Loader2, Truck, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/api/client";
import type { Order, OrderStatus } from "@/lib/schemas";

const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await api.get<Order>(`/api/admin/orders/${id}`);
        setOrder(data);
        setSelectedStatus(data.status);
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order || selectedStatus === order.status) return;
    setSaving(true);
    try {
      const updated = await api.patch<Order>(`/api/admin/orders/${id}`, {
        status: selectedStatus,
      });
      setOrder(updated);
      toast({
        title: "Status Updated",
        description: `Order status changed to ${selectedStatus}.`,
      });
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "Could not update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAction = async (status: OrderStatus) => {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await api.patch<Order>(`/api/admin/orders/${id}`, {
        status,
      });
      setOrder(updated);
      setSelectedStatus(status);
      toast({
        title: "Status Updated",
        description: `Order marked as ${status}.`,
      });
    } catch (err) {
      toast({
        title: "Action Failed",
        description: "Could not update order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Order Details" backTo="/admin/orders">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order Details" backTo="/admin/orders">
        <div className="text-center py-20 text-muted-foreground">
          Order not found.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Order #${order.id.slice(0, 12)}...`} backTo="/admin/orders">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <Badge
              className={statusColorMap[order.status]}
              variant="outline"
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {["confirmed", "pending"].includes(order.status) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("shipped")}
                  disabled={saving}
                >
                  <Truck className="h-4 w-4 mr-1.5" />
                  Mark Shipped
                </Button>
              </>
            )}
            {["confirmed", "shipped"].includes(order.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("delivered")}
                disabled={saving}
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Mark Delivered
              </Button>
            )}
            {order.status !== "cancelled" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("cancelled")}
                disabled={saving}
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.email}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.phone}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.pincode}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Payment Info
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-mono text-xs break-all">
                Payment ID: {order.razorpayPaymentId}
              </p>
              <p className="text-xs text-muted-foreground">
                Order ID: {order.razorpayOrderId}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{item.price.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Select
                  value={selectedStatus}
                  onValueChange={(val) =>
                    setSelectedStatus(val as OrderStatus)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={
                    saving || selectedStatus === order.status
                  }
                >
                  {saving ? "Saving..." : "Update Status"}
                </Button>
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
                <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (18% GST)</span>
                <span>₹{order.tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shipping === 0
                    ? "Free"
                    : `₹${order.shipping.toLocaleString("en-IN")}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              {order.promoCode && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Promo Code</span>
                  <span className="font-mono">{order.promoCode}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span>₹{order.total.toLocaleString("en-IN")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
