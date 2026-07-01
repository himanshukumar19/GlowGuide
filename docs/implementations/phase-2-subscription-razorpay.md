# Phase 2 — Subscription + Razorpay Payment Integration

**Date:** 2026-06-30 (updated 2026-07-01)  
**Depends on:** Phase 1 (Auth + Firestore) complete, Razorpay test account

---

## Overview

Integrate Razorpay test mode for Pro subscription payments. Uses Model-View-Controller structure: Zod schemas validate all data, model functions encapsulate Firestore CRUD, controllers contain business logic, routes delegate to controllers.

---

## Architecture

```
routes/index.ts              ← single mount point aggregating all routes
  ├── routes/auth.ts         ← delegates to model functions (no inline db calls)
  └── routes/subscriptions.ts ← delegates to subscriptionController

controllers/subscription.controller.ts  ← business logic (createOrder, verifyPayment)
  uses → models/ (getCustomerById, createPayment, etc.)

models/
  ├── customer.model.ts     ← getCustomerById, updateCustomer, createCustomer
  ├── payment.model.ts      ← createPayment, updatePayment, getPaymentById
  └── subscription.model.ts ← setSubscription, getSubscriptionByCustomerId

schemas/
  ├── customer.schema.ts    ← Zod: 24 fields, validated on read + write
  ├── payment.schema.ts     ← Zod: 16 fields, status/type enums
  ├── subscription.schema.ts ← Zod: 14 fields, status enum
  └── plan.schema.ts        ← Zod: 10 fields (for config validation)

validators/index.ts          ← validate() utility + ValidationError class

config/subscription-plans.ts ← plan definitions (Free + Premium ₹499/mo)
```

---

## Files Created

### `Backend/src/lib/razorpay.ts`
- Initializes Razorpay client with `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` from env
- Amount/currency config lives in `config/subscription-plans.ts`, not here

### `Backend/src/config/subscription-plans.ts`
- `SUBSCRIPTION_PLANS` array with two plans: Glow Starter (FREE, ₹0) and Glow Premium Monthly (PAID, ₹49900 paise)
- `DEFAULT_PAID_PLAN` export used by controller

### `Backend/src/schemas/*.schema.ts` (4 files)
- `customer.schema.ts` — Zod schema with `email().email()`, role enum, subscription fields, partial support via `.partial()`
- `payment.schema.ts` — type/subtype enums, amount as positive int, status lifecycle
- `subscription.schema.ts` — tier/status enums, period timestamps
- `plan.schema.ts` — price as int, features as string array

### `Backend/src/validators/index.ts`
- `validate(schema, data)` — wraps `z.safeParse()`, throws `ValidationError` with field-level details
- Model `update*` functions pass partial data through `schema.partial()` for write-time validation

### `Backend/src/models/*.model.ts` (3 files)
- `customer.model.ts` — `getCustomerById`, `updateCustomer` (partial-validated), `createCustomer`
- `payment.model.ts` — `createPayment`, `updatePayment` (partial-validated), `getPaymentById`
- `subscription.model.ts` — `setSubscription`, `getSubscriptionByCustomerId`
- All functions call `validate(schema, data)` before Firestore writes

### `Backend/src/controllers/subscription.controller.ts`
- `createOrder` — checks customer exists + not already PAID via `getCustomerById`, creates Razorpay order, writes PENDING payment via `createPayment`
- `verifyPayment` — HMAC signature verification, updates payment to CAPTURED via `updatePayment`, creates subscription via `setSubscription`, updates customer tier via `updateCustomer`
- Catches `ValidationError` separately from generic errors

### `Backend/src/routes/index.ts`
- Single router mounting all routes: `authRoutes` at `/auth`, `subscriptionRoutes` at `/subscriptions`

### `Frontend/src/models/*.model.ts` (3 files)
- `customer.model.ts` — `Customer` + `SubscriptionPlan` interfaces
- `payment.model.ts` — `Payment` interface
- `subscription.model.ts` — `Subscription` interface
- `index.ts` re-exports all types

### `Frontend/src/api/client.ts`
- Generic `request<T>()` wrapper around `fetch` with auth token injection
- `getToken()` calls `auth.currentUser.getIdToken()` for Firebase Auth
- `ApiError` class with `status`, `code`, `message`
- `.get()`, `.post()`, `.patch()` convenience methods

### `Frontend/src/api/subscription.api.ts`
- `subscriptionApi.createOrder()` → `POST /api/subscriptions/create-order`
- `subscriptionApi.verifyPayment(data)` → `POST /api/subscriptions/verify`

---

## Files Modified

### `Backend/src/server.ts`
- Replaced individual route imports + mounts with single `import routes from "./routes"` + `app.use("/api", routes)`

### `Backend/src/routes/auth.ts`
- Replaced inline `db.collection("customers").doc(uid).get()` with `getCustomerById(uid)`
- Replaced inline `db.collection("customers").doc(uid).set(...)` with `createCustomer(uid, data)`

### `Backend/src/routes/subscriptions.ts`
- Rewritten: delegates to `subscriptionController.createOrder` / `subscriptionController.verifyPayment`

### `Frontend/src/pages/Pricing.tsx`
- Full rewrite: loads Razorpay SDK via dynamic script tag, calls `subscriptionApi.createOrder()`, opens Razorpay checkout modal, on success calls `subscriptionApi.verifyPayment()` + `refreshCustomer()`
- Loading state with spinner while processing
- Free plan button simplified to "Go to Dashboard"

### `Frontend/src/store/useAuthStore.ts`
- Updated `Customer` import from `@/types/customer` to `@/models`
- `refreshCustomer()` already existed, used by Pricing.tsx post-payment

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
   `VITE_RAZORPAY_KEY_ID` is **not needed** on frontend — key comes from backend response.

---

## Payment Flow

```
User clicks "Subscribe to Pro" on Pricing page
        │
        ▼
loadRazorpayScript()  ← dynamic <script> tag injection
        │
        ▼
POST /api/subscriptions/create-order (via subscriptionApi.createOrder)
  Authorization: Bearer <token>
        │
        ▼
Backend: getCustomerById(uid) → check exists + not already PAID
Backend: razorpay.orders.create({ amount: 49900, currency: "INR" })
Backend: createPayment(orderId, { type: "SUBSCRIPTION", status: "PENDING" })
Backend: returns { orderId, amount, currency, keyId, description }
        │
        ▼
Frontend: new window.Razorpay({
  key: order.keyId,
  amount: order.amount,
  order_id: order.orderId,
  handler: function(response) {
    subscriptionApi.verifyPayment({
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    })
  }
}).open()
        │
        ├── User cancels → modal closes, toast "Payment cancelled"
        │
        └── Payment success → verifyPayment
                    │
                    ▼
            Backend: HMAC-SHA256 signature verification
            Backend: updatePayment(orderId, { status: "CAPTURED" })
            Backend: setSubscription(uid, { tier: "PAID", status: "ACTIVE" })
            Backend: updateCustomer(uid, { subscriptionTier: "PAID" })
            Backend: returns { success: true, subscriptionExpiresAt }
                    │
                    ▼
            Frontend: refreshCustomer() → store updates → UI shows "Active"
            toast "Successfully upgraded to Premium!"
```

---

## Firestore Collections Written

| Collection | Document ID | Key Fields |
|---|---|---|
| `customers/{uid}` | Customer UID | `subscriptionTier: "PAID"`, `subscriptionStatus: "ACTIVE"`, `subscriptionExpiresAt`, `subscriptionPlanId` |
| `payments/{orderId}` | Razorpay order ID | `type: "SUBSCRIPTION"`, `status: "CAPTURED"`, `amount: 49900`, `razorpayPaymentId`, `razorpaySignature` |
| `subscriptions/{uid}` | Customer UID | `tier: "PAID"`, `status: "ACTIVE"`, `planId`, `currentPeriodStart`, `currentPeriodEnd` |

---

## Data Validation

| Layer | Mechanism |
|---|---|
| HTTP body | Express `express.json()` |
| Firebase Auth | `requireAuth` middleware verifies ID token |
| Business data | Zod schemas via `validate()` utility — runs on every read AND write |
| Partial updates | `schema.partial()` guards against invalid field values |
| Payment signature | HMAC-SHA256 with Razorpay key secret (server-side, not client-verifiable) |

---

## Test Cards (Razorpay Test Mode)

| Card | Description |
|---|---|
| `4111 1111 1111 1111` | Success — any expiry/CVV |
| `4000 0000 0000 0002` | Failure — insufficient funds |
| `4242 4242 4242 4242` | Success — any expiry/CVV |

---

## Dependencies

```bash
cd Backend && npm install razorpay zod
```

No new frontend packages — Razorpay checkout is loaded via script tag at runtime.

---

## Future — Product Purchase (Not Built Yet)

When product checkout is built later, it will use the same pattern:
- `models/product.model.ts` + `schemas/product.schema.ts` — deferred
- `models/order.model.ts` + `schemas/order.schema.ts` — deferred
- `POST /api/orders/create-order` — cart total → Razorpay order
- Reuses same `createPayment` / `updatePayment` model functions (payment type = `"ORDER"`)
- Reuses same HMAC verify pattern

The shared `payments/` collection means all payments (subscriptions + orders) live in one place with `type` field distinguishing them.
