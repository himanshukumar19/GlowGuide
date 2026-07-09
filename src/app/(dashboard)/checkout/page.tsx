'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Truck,
  ShieldCheck,
  ListOrdered
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCart } from '@/store/useCartStore';
import { useAuth } from '@/store/useAuthStore';
import { ordersApi } from '@/api/orders.api';
import { toast } from 'sonner';
import { Address, Order } from '@/types/product';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("razorpay-script")) return resolve();
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

const shippingSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\-\s()]*$/, "Please enter a valid phone number"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z
    .string()
    .min(6, "PIN code must be at least 6 digits")
    .regex(/^[0-9]+$/, "PIN code must contain only digits"),
  type: z.enum(["home", "office"]),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

type CheckoutStep = 'shipping' | 'confirmation';

const CheckoutPage = () => {
  const router = useRouter();
  const { 
    items, 
    getCartSubtotal, 
    getCartTax, 
    getShippingCost, 
    getCartTotal,
    getPromoDiscount,
    getSubscriptionDiscount,
    appliedPromoCode,
    clearCart
  } = useCart();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    mode: "onChange",
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      type: 'home'
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const onShippingSubmit = async (values: ShippingFormValues) => {
    setIsProcessing(true);

    try {
      await loadRazorpayScript();

      const payload = {
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          id: `addr_${Date.now()}`,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          street: values.street,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
          type: values.type,
        },
        subtotal: getCartSubtotal(),
        tax: getCartTax(),
        shipping: getShippingCost(),
        discount: getPromoDiscount() + getSubscriptionDiscount(),
        total: getCartTotal(),
        promoCode: appliedPromoCode || undefined,
      };

      const orderResponse = await ordersApi.createOrder(payload);

      const customer = useAuth.getState().customer;

      const options = {
        key: orderResponse.keyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "GlowGuide",
        description: `Order ${orderResponse.appOrderId}`,
        order_id: orderResponse.orderId,
        prefill: {
          name: customer?.displayName || values.fullName,
          email: customer?.email || values.email,
          contact: values.phone,
        },
        theme: { color: "#355245" },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            await ordersApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            const newOrder: Order = {
              orderId: orderResponse.appOrderId,
              items: items,
              shippingAddress: { id: `addr_${Date.now()}`, ...values } as Address,
              subtotal: getCartSubtotal(),
              tax: getCartTax(),
              shipping: getShippingCost(),
              discount: getPromoDiscount() + getSubscriptionDiscount(),
              total: getCartTotal(),
              status: 'confirmed',
              paymentMethod: 'Razorpay',
              createdAt: new Date(),
            };

            setOrder(newOrder);
            setIsProcessing(false);
            setCurrentStep('confirmation');
            clearCart();
            toast.success('Order placed successfully!');
          } catch (verifyError: any) {
            setIsProcessing(false);
            toast.error(verifyError?.message || 'Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.error('Payment was cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      setIsProcessing(false);
      toast.error(error?.message || 'Payment failed. Please try again.');
    }
  };

  const steps = [
    { id: 'shipping', label: 'Shipping', icon: MapPin },
    { id: 'confirmation', label: 'Confirmation', icon: Check }
  ];

  if (items.length === 0 && !order) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : isCompleted 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
                <span className="hidden sm:inline font-medium">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                  isCompleted ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Shipping Step */}
            {currentStep === 'shipping' && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onShippingSubmit)} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="9876543210" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address *</FormLabel>
                              <FormControl>
                                <Input placeholder="123, Main Street, Apartment 4B" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid sm:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Mumbai" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Maharashtra" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="pincode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>PIN Code *</FormLabel>
                                <FormControl>
                                  <Input type="text" inputMode="numeric" placeholder="400001" maxLength={6} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Address Type</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  className="flex gap-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="home" id="home" />
                                    <Label htmlFor="home">Home</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="office" id="office" />
                                    <Label htmlFor="office">Office</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-4 pt-2">
                          <Button type="button" variant="outline" onClick={() => router.push('/cart')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Cart
                          </Button>
                          <Button type="submit" disabled={isProcessing} className="flex-1">
                            {isProcessing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                                Processing...
                              </>
                            ) : (
                              <>
                                Pay {formatPrice(getCartTotal())}
                                <ShieldCheck className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Confirmation Step */}
            {currentStep === 'confirmation' && order && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="text-center">
                  <CardContent className="pt-8 pb-8">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="h-10 w-10 text-green-600" />
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                    <p className="text-muted-foreground mb-6">
                      Thank you for your purchase. Your order has been placed successfully.
                    </p>

                    <div className="bg-muted rounded-lg p-4 mb-6">
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="text-xl font-bold text-primary">{order.orderId}</p>
                    </div>

                    <div className="text-left space-y-4 mb-6">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Estimated Delivery</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })} - {new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Shipping To</p>
                          <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.fullName}<br />
                            {order.shippingAddress.street}, {order.shippingAddress.city}<br />
                            {order.shippingAddress.state} - {order.shippingAddress.pincode}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-2 text-left mb-6">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatPrice(order.tax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Promo Discount</span>
                          <span>-{formatPrice(order.discount)}</span>
                        </div>
                      )}
                      {getSubscriptionDiscount() > 0 && (
                        <div className="flex justify-between text-primary">
                          <span>Pro Discount (5%)</span>
                          <span>-{formatPrice(getSubscriptionDiscount())}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(order.total)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button variant="outline" className="flex-1" onClick={() => router.push('/dashboard/orders')}>
                        <ListOrdered className="h-4 w-4 mr-2" />
                        View Order History
                      </Button>
                      <Button className="flex-1" onClick={() => router.push('/shop')}>
                        Continue Shopping
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary Sidebar */}
        {currentStep !== 'confirmation' && (
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-20">
              <h3 className="font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(getCartSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>{formatPrice(getCartTax())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={getShippingCost() === 0 ? 'text-green-600' : ''}>
                    {getShippingCost() === 0 ? 'FREE' : formatPrice(getShippingCost())}
                  </span>
                </div>
                {getPromoDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo ({appliedPromoCode})</span>
                    <span>-{formatPrice(getPromoDiscount())}</span>
                  </div>
                )}
                {getSubscriptionDiscount() > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Pro Discount (5%)</span>
                    <span>-{formatPrice(getSubscriptionDiscount())}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary text-lg">{formatPrice(getCartTotal())}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
