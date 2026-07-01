# Phase 2 — Subscription + Razorpay Payment Integration

**Date:** 2026-06-30  
**Depends on:** Phase 1 (Auth + Firestore) complete, Razorpay test account

---

## Overview

Integrate Razorpay test mode for Pro subscription payments. Uses a generic payment endpoint that can later handle product purchases too — but only subscription flow is built now.

---

## Razorpay Setup (User Step)

1. Go to https://dashboard.razorpay.com → Sign up
2. **Settings → API Keys** → Enable test mode
3. Copy `Key ID` (starts with `rzp_test_`) and `Key Secret`
4. Add to `Backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
   ```
5. Add to `Frontend/.env.local`:
   ```
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   ```

---

## Files to Create

### `Backend/src/lib/razorpay.ts`
- Initialize Razorpay client with key_id + key_secret

### `Backend/src/routes/subscriptions.ts`
- `POST /api/subscriptions/create-order` — creates Razorpay order (₹499 or configurable), returns `{ orderId, amount, keyId }`
- `POST /api/subscriptions/verify` — verifies signature using `crypto`, updates Firestore doc `subscriptionTier: "PAID"`, `subscriptionExpiresAt: now + 1 month`
- Validates: customer exists, not already PAID, order belongs to this customer

---

## Files to Modify

### `Backend/src/server.ts`
- Mount subscription routes at `/api/subscriptions`

### `Frontend/src/pages/Pricing.tsx`
- `handleSubscribe` calls `POST /api/subscriptions/create-order`
- Opens Razorpay checkout modal (loads `https://checkout.razorpay.com/v1/checkout.js`)
- On success → calls `POST /api/subscriptions/verify`
- On verify success → calls `refreshCustomer()` → store updates → UI shows "Active"

### `Frontend/.env.local`
- Add `VITE_RAZORPAY_KEY_ID`

---

## Payment Flow

```
User clicks "Subscribe to Pro" on Pricing page
        │
        ▼
backend: POST /api/subscriptions/create-order
Authorization: Bearer <token>
        │
        ▼
Backend: Verify token → read customer
Backend: razorpay.orders.create({ amount: 49900, currency: "INR", receipt: "sub_<uid>" })
Backend: returns { orderId: "order_xyz", amount: 49900, keyId: "rzp_test_..." }
        │
        ▼
Frontend: Open Razorpay Checkout modal
{
  key: keyId,
  amount: 49900,
  currency: "INR",
  order_id: orderId,
  name: "GlowGuide",
  description: "Glow Premium - 1 Month",
  prefill: { name, email },
  handler: function(response) {
    // response holds razorpay_payment_id, razorpay_order_id, razorpay_signature
    POST /api/subscriptions/verify { paymentId, orderId, signature }
  },
  modal: { ondismiss: function() { toast "Payment cancelled" } }
}
        │
        ├── User cancels → modal closes, no change
        │
        └── Payment success → call verify
                    │
                    ▼
            Backend: crypto.createHmac("sha256", key_secret)
                     .update(orderId + "|" + paymentId)
                     .digest("hex") === signature ?
                    │
                    ├── Invalid → 400 "Payment verification failed"
                    │
                    └── Valid → customers/{uid}.subscriptionTier = "PAID"
                                customers/{uid}.subscriptionExpiresAt = +1 month
                                customers/{uid}.updatedAt = now
                                return { success: true }
                                        │
                                        ▼
                                Frontend: refreshCustomer()
                                toast "Welcome to Glow Premium!"
                                Pricing page shows "Active — Cancel subscription"
```

---

## Future — Product Purchase (Not Built Now)

When product checkout is built later, it will use a similar pattern:
- `POST /api/orders/create-order` — cart total → Razorpay order
- Same verify flow → on success, sets `paymentStatus: "PAID"` on the order

The shared payment endpoint pattern means the verify logic is reused. For now, subscription has its own dedicated routes.

---

## Dependencies

```bash
cd Backend && npm install razorpay
```

No new frontend packages — Razorpay checkout is loaded via script tag at runtime.

---

## Test Cards (Razorpay Test Mode)

| Card | Description |
|---|---|
| `4111 1111 1111 1111` | Success — any expiry/CVV |
| `4000 0000 0000 0002` | Failure — insufficient funds |
| `4242 4242 4242 4242` | Success — any expiry/CVV |
