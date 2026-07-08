# Implementation Plan — Product Data, Images, Orders & Razorpay

**Created:** 2026-07-07
**Status:** Complete

---

## Summary

Migrate 32 static products from `src/data/products.ts` to Firestore + Cloudinary. Wire the admin panel for real CRUD operations. Build the product purchase flow with Razorpay. Add customer order history.

---

## Key Architecture Decisions (ADRs to create)

| # | Decision | Rationale |
|---|---|---|
| ADR-0003 | Product data architecture: Firestore `products` collection + Cloudinary for images, with image URLs stored in Firestore | Single source of truth, no static data, images served via CDN |
| ADR-0004 | Order item snapshot: store product name/price/image at purchase time, not just product ID | Ensures order history is immutable — old orders don't break if products change or are deleted |
| ADR-0005 | Stock decrement during Razorpay payment verification (`/api/orders/verify`) | Atomic — stock only changes after confirmed payment. Prevents double-selling |

---

## Design Decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Public product reads | API route pattern (`GET /api/products`) — consistent with existing analysis routes |
| 2 | Stock decrement timing | Inside `/api/orders/verify` after Razorpay signature confirmed |
| 3 | Image upload timing | On form submit (not immediate) — no orphaned images in Cloudinary |
| 4 | Order item storage | Snapshot (name, price, image at purchase time) — immutable history |
| 5 | Promo codes | Keep static (5 codes in `products.ts`) — not worth a Firestore collection yet |
| 6 | Cloudinary upload preset | Unsigned upload preset for client-side admin uploads, signed uploads for seed script |
| 7 | Order history page | `/dashboard/orders` — list with expansion detail, filter by status |
| 8 | Admin dashboard stats | Wire to real Firestore data (product count, order count, customer count) |
| 9 | Seed script idempotency | Upsert — safe to re-run, updates changed products, skips re-upload if URL exists |
| 10 | `inStock` boolean field | Remove — derive as `stockCount > 0` |
| 11 | Cart stock validation | Check `stockCount` before allowing checkout |

---

## Domain Vocabulary Updates

New and updated terms to add to `CONTEXT.md`:

| Term | Definition |
|---|---|
| **Product** | An item available for purchase in the Shop. Managed by Admins via the Admin Panel. Each Product has a unique ID and lives in the `products` Firestore collection. |
| **Stock Count** | The available quantity of a Product. Decremented automatically when a Customer completes a purchase via Razorpay. Managed by Admins for restocking. |
| **Cart** | A temporary collection of Products a Customer intends to purchase. Stored client-side in localStorage. Cleared after successful checkout. |
| **Checkout** | The multi-step flow where a Customer provides a shipping address and completes payment via Razorpay. Requires authentication. |
| **Order** _(updated)_ | A Customer's purchase transaction in the Shop. Persisted in the `orders` Firestore collection. Contains a snapshot of purchased items at the time of payment. Displayed in the Dashboard under order history. Managed by Admins in the Order management panel. _Avoid_: Purchase |
| **Admin** _(updated)_ | A staff role with a separate login accessing a distinct admin dashboard. Has CRUD access to Products, Orders, and manages product images in Cloudinary. |

---

## Data Model

### Firestore Collections

```
products/{productId}
├── id: string
├── name: string
├── brand: string
├── category: enum
├── subcategory?: enum
├── price: number
├── originalPrice?: number
├── discount?: number
├── rating: number
├── reviewCount: number
├── image: string                  ← Cloudinary secure URL
├── images: string[]               ← all Cloudinary URLs
├── description: string
├── shortDescription: string
├── keyBenefits: string[]
├── ingredients: string[]
├── howToUse: string
├── skinTypes: string[]
├── suitableFor: string[]
├── concerns: string[]
├── volume: string
├── stockCount: number
├── badges?: string[]
├── whereToBuy: { amazon?, nykaa?, flipkart?, official? }
├── createdAt: Timestamp
└── updatedAt: Timestamp

orders/{orderId}
├── customerId: string             ← links to customers/{uid}
├── items: OrderItem[]             ← snapshot [{ id, name, image, price, quantity }]
├── shippingAddress: Address       ← full address snapshot
├── subtotal: number
├── tax: number                    ← 18% GST
├── shipping: number
├── discount: number               ← promo + subscription discount combined
├── total: number
├── promoCode?: string
├── razorpayOrderId: string
├── razorpayPaymentId: string
├── status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Cloudinary Image Structure

Images are uploaded to Cloudinary under the `glowguide-products` upload preset. The returned `secure_url` and `public_id` are stored in the Firestore product document.

Upload methods:
- **Admin panel (client-side):** Unsigned upload via `POST https://api.cloudinary.com/v1_1/<cloud>/image/upload` with the upload preset
- **Seed script (server-side):** SDK-based upload via `cloudinary.uploader.upload` with API credentials

---

## Implementation Phases

### Phase 1 — Storage + Models + Seed

| Step | File | What |
|---|---|---|
| 1.1 | `src/lib/cloudinary.ts` | Configure Cloudinary SDK with `cloud_name`, `api_key`, `api_secret` |
| 1.2 | `src/lib/schemas/product.ts` | Zod schema for Product (reuses `types/product.ts`, removes `inStock`) |
| 1.3 | `src/lib/models/product.ts` | `getAllProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct` |
| 1.4 | `src/lib/schemas/order.ts` | Zod schema for Order documents |
| 1.5 | `src/lib/models/order.ts` | `createOrder`, `getOrderById`, `listOrdersByCustomer`, `updateOrderStatus` |
| 1.6 | `src/lib/models/index.ts` | Export product and order models |
| 1.7 | `scripts/seed-products.ts` | Read 32 products → upload images to Cloudinary → write docs to Firestore (upsert) |

Manual steps:
- Configure Cloudinary upload preset (`glowguide-products`) for unsigned uploads
- Create admin user in Firebase Console

### Phase 2 — Product API Routes

| Step | File | Route | Purpose |
|---|---|---|---|
| 2.1 | `src/app/api/products/route.ts` | `GET /api/products` | List all products (public) |
| 2.2 | `src/app/api/products/[id]/route.ts` | `GET /api/products/:id` | Single product (public) |
| 2.3 | `src/app/api/products/route.ts` | `POST /api/products` | Create product with image upload (admin) |
| 2.4 | `src/app/api/products/[id]/route.ts` | `PUT /api/products/:id` | Update product + optional image (admin) |
| 2.5 | `src/app/api/products/[id]/route.ts` | `DELETE /api/products/:id` | Delete product + remove images from Cloudinary (admin) |

### Phase 3 — Wire Admin Panel to Firestore

| Step | File | What |
|---|---|---|
| 3.1 | `src/app/(admin)/admin/page.tsx` | Wire dashboard stats to real Firestore counts |
| 3.2 | `src/app/(admin)/admin/products/page.tsx` | Fetch real products from API instead of static import |
| 3.3 | `src/app/(admin)/admin/products/new/page.tsx` | Submit form → `POST /api/products` with image upload |
| 3.4 | `src/app/(admin)/admin/products/[id]/edit/page.tsx` | Fetch product from API, submit → `PUT /api/products/:id` |
| 3.5 | `src/app/(admin)/admin/products/page.tsx` | Delete → `DELETE /api/products/:id` |
| 3.6 | `src/app/(admin)/admin/orders/page.tsx` | Fetch real orders from Firestore |
| 3.7 | `src/app/(admin)/admin/orders/[id]/page.tsx` | Fetch real order, persist status updates |

### Phase 4 — Public Frontend Switchover

| Step | File | What |
|---|---|---|
| 4.1 | `src/api/products.api.ts` | API client: `getAll()`, `getById(id)` |
| 4.2 | `src/app/(marketing)/shop/ShopContent.tsx` | Fetch from `GET /api/products` |
| 4.3 | `src/app/(marketing)/shop/[id]/page.tsx` | Fetch from `GET /api/products/:id` |
| 4.4 | `src/app/(marketing)/skin-types/[type]/page.tsx` | Fetch from `GET /api/products` |
| 4.5 | `src/components/analysis/AnalysisResults.tsx` | Fetch from `GET /api/products` |
| 4.6 | `src/app/(dashboard)/dashboard/page.tsx` | Fetch from `GET /api/products` |

### Phase 5 — Razorpay Product Purchases

| Step | File | What |
|---|---|---|
| 5.1 | `src/app/api/orders/create-order/route.ts` | Validate stock → create Razorpay order → save order (status: pending) |
| 5.2 | `src/app/api/orders/verify/route.ts` | Verify signature → update order (status: confirmed) → decrement stock |
| 5.3 | `src/api/orders.api.ts` | API client: `createOrder()`, `verifyPayment()` |
| 5.4 | `src/app/(dashboard)/checkout/page.tsx` | Replace mock payment with Razorpay checkout.js |
| 5.5 | `src/store/useCartStore.ts` | Add stock validation before checkout |

### Phase 6 — Customer Order History

| Step | File | What |
|---|---|---|
| 6.1 | `src/app/(dashboard)/dashboard/orders/page.tsx` | List all orders (newest first), expand for detail, filter by status |

### Phase 7 — Cleanup & Documentation

| Step | File | What |
|---|---|---|
| 7.1 | `src/types/product.ts` | Remove `inStock` from `Product` interface |
| 7.2 | `src/data/products.ts` | Remove `inStock` field and `image`/`images` values from all products (or remove file entirely if no longer imported) |
| 7.3 | `CONTEXT.md` | Add: Product, Stock Count, Cart, Checkout; update Order and Admin definitions; replace Firebase Storage → Cloudinary |
| 7.4 | `docs/adr/0003-product-data-architecture.md` | Record Firestore + Cloudinary architecture decision |
| 7.5 | `docs/adr/0004-order-snapshot-strategy.md` | Record immutable order snapshot decision |
| 7.6 | `docs/adr/0005-stock-decrement-timing.md` | Record stock decrement during verification decision |

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Seed script run twice | Upsert — updates existing docs, skips image re-upload if URL already set |
| Two customers buy last item simultaneously | Stock check in `create-order` + atomic decrement in `verify` |
| Razorpay payment fails | Order stays `pending`, no stock decremented, customer can retry |
| Admin deletes product that appears in past orders | Order snapshot preserves product data — order history doesn't break |
| Cart has items but another customer bought them first | Stock validation during checkout blocks transaction |
| Image upload fails during form submit | Error toast shown, form data preserved, admin can retry |
| Orphaned images in Cloudinary | Not critical — cleanup script can be added later |
