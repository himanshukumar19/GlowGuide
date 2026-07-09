'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, ChevronDown, ChevronUp, Loader2, AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/api/client";
import { toast } from "sonner";
import type { Order } from "@/lib/schemas";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusFilterOptions = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

interface OrderHistoryListProps {
  showHeading?: boolean;
}

export function OrderHistoryList({ showHeading = true }: OrderHistoryListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Order[]>("/api/orders");
      setOrders(data);
    } catch (err: any) {
      console.error("fetchOrders error:", err);
      setError(err?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(orderId: string) {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.post(`/api/orders/${orderId}/cancel`, {});
      toast.success("Order cancelled");
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel order");
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="max-w-4xl">
      {showHeading && (
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8">
          Order History
        </h1>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-semibold text-red-600 mb-1">
              Something went wrong
            </p>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              {error}
            </p>
            <Button variant="outline" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filter */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {statusFilterOptions.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">
                  No orders found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {orders.length === 0
                    ? "You haven't placed any orders yet."
                    : "No orders match the selected filter."}
                </p>
              </CardContent>
            </Card>
          ) : (
            /* Orders List */
            <div className="space-y-4">
              {filteredOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === order.id ? null : order.id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CardTitle className="text-base">
                            Order #{order.id}
                          </CardTitle>
                          <Badge
                            className={statusColors[order.status] || ""}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-foreground">
                            ₹{order.total.toLocaleString()}
                          </span>
                          {expandedId === order.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </CardHeader>

                    {expandedId === order.id && (
                      <CardContent className="pt-0 space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Items</h4>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-12 w-12 rounded-md object-cover border"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity} × ₹
                                    {item.price.toLocaleString()}
                                  </p>
                                </div>
                                <span className="text-sm font-semibold">
                                  ₹{(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="text-sm font-semibold mb-2">
                            Shipping Address
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.fullName}
                            <br />
                            {order.shippingAddress.street},{" "}
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state} -{" "}
                            {order.shippingAddress.pincode}
                            <br />
                            {order.shippingAddress.phone}
                          </p>
                        </div>

                        <Separator />

                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Subtotal
                            </span>
                            <span>₹{order.subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax</span>
                            <span>₹{order.tax.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Shipping
                            </span>
                            <span>₹{order.shipping.toLocaleString()}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount</span>
                              <span>-₹{order.discount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold pt-1 border-t">
                            <span>Total</span>
                            <span>₹{order.total.toLocaleString()}</span>
                          </div>
                        </div>

                        {order.promoCode && (
                          <p className="text-xs text-muted-foreground">
                            Promo: {order.promoCode}
                          </p>
                        )}

                        {(order.status === "pending" || order.status === "confirmed") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(order.id)}
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-1.5"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancel Order
                          </Button>
                        )}
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
