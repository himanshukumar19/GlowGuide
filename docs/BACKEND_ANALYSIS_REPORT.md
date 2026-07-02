# GlowGuide — Backend Analysis & Planning Report

> **Prepared**: 2026-06-29  
> **Scope**: Full analysis of `Frontend/`, `plan/`, `CONTEXT.md`, `IMPLEMENTATION_ROADMAP.md` and `OPTIMIZED_QUIZ_DESIGN.md` to define everything required to build the GlowGuide backend.  
> **Status**: Planning only — no code changes made.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current State Assessment](#2-current-state-assessment)
3. [Architecture](#3-architecture)
4. [Database Schema](#4-database-schema)
5. [API Endpoint Reference](#5-api-endpoint-reference)
6. [Feature-by-Feature Flow](#6-feature-by-feature-flow)
7. [Business Logic & Rules](#7-business-logic--rules)
8. [Technology Stack](#8-technology-stack)
9. [Environment Variables](#9-environment-variables)
10. [Data Types Contract](#10-data-types-contract)
11. [Testing Strategy](#11-testing-strategy)
12. [Build Order](#12-build-order)
13. [Open Decisions](#13-open-decisions)
14. [Free Tier Budget & Limits](#14-free-tier-budget--limits)

---

## 1. Project Overview

**GlowGuide** is an AI-powered skincare analysis and e-commerce platform with three distinct user types:

| User Type | Access Level | Description |
|---|---|---|
| **Guest** | Public pages only | Can browse shop and info pages. Cannot analyse, checkout, or use chatbot |
| **Customer (Free)** | Public + protected | Max 3 skin analyses, last 3 history items, chatbot 10 queries/day |
| **Customer (Paid)** | Full access | Unlimited analyses, 12-month history, unlimited chatbot, 5% extra discount |
| **Admin** | Staff portal | Separate login, manages products, orders, CMS content |

### Core Features

| Feature | Description |
|---|---|
| **Skin Analysis** | 7-question quiz + 5-angle live camera → ML prediction → skin type, concerns, health score, routine |
| **Shop** | Product catalog with advanced filtering, cart, wishlist, checkout, promo codes |
| **Dashboard** | History timeline, health score trends, routine tracker, auto-tracked products, account settings |
| **Chatbot** | AI assistant (Gemini Flash) accessible site-wide, quota-gated by tier |
| **Subscription** | Paid tier unlocking extended history, unlimited chatbot, 5% checkout discount |
| **Admin Panel** | Product/order/customer/CMS management under `/admin/*` |

---

## 2. Current State Assessment

### What the Frontend Has (Already Built)
| Module | Implementation Status |
|---|---|
| Auth (Login/Signup) | ✅ UI done — **mock only** (hardcoded users in `AuthContext.tsx`, `localStorage`) |
| Skin Analysis Quiz | ✅ UI done — sends `POST /api/skin-analysis` to existing basic backend |
| Live Camera (5 angles) | ✅ UI done — photos captured locally, **NOT uploaded** to backend yet |
| Analysis Results | ✅ UI done — displays `skin_type`, `confidence`, `probabilities`, `concerns_detected` |
| Analysis History | ✅ UI done — **mock data** from `analysisHistory.ts` |
| Dashboard | ✅ UI done — **all mock data** |
| Shop + Filters | ✅ UI done — **products hardcoded** in `products.ts` (32KB, ~30 products) |
| Cart / Wishlist | ✅ UI done — **`localStorage` only**, no backend sync |
| Checkout | ✅ UI done — payment **simulated with `setTimeout`** |
| Pricing Page | ✅ UI done — subscription toggle is **local state only** |
| Chatbot | 🔲 Not built yet |
| Admin Panel | 🔲 Not built yet |
| Ingredients Glossary | ✅ UI done — **hardcoded** in component (15KB) |

### What Needs a Backend
Everything in the table above marked as "mock" or "localStorage" needs real backend endpoints and a database.

---

## 3. Architecture

```
                         ┌──────────────────────────────────┐
                         │   Browser (React SPA)             │
                         │ Vite + React + TypeScript         │
                         │ Deployed → Vercel (free tier)     │
                         └──────────────┬───────────────────┘
                                        │ Firebase ID Token (Authorization header)
                                        ▼
                         ┌──────────────────────────────────┐
                         │  GlowGuide Backend                │
                         │  Node.js + Express + TypeScript   │
                         │  Deployed → Render (free tier)    │
                         └──────┬───────────┬────────────────┘
                                │           │
                                ▼           ▼
                    ┌──────────────┐  ┌──────────────────┐
                    │  Firestore   │  │  ML Service       │
                    │  (NoSQL)     │  │  Python FastAPI   │
                    │  Customers,  │  │  Random Forest    │
                    │  Analyses,   │  │  Deployed → Render│
                    │  Orders,     │  └──────────────────┘
                    │  Products    │
                    └──────────────┘
                           │
                    ┌──────┴──────┐
                    │ Firebase    │
                    │ Auth        │
                    │ (Email +    │
                    │  Google)    │
                    └─────────────┘

                    ┌──────────────┐
                    │ Cloudinary   │
                    │ Photo        │
                    │ Storage      │
                    └──────────────┘
```

### Service Responsibilities

| Service | Responsibility |
|---|---|
| **Firebase Auth** | All authentication — Email/password signup/login, Google sign-in, token issuance/verification |
| **Firestore (NoSQL)** | All persistent data: customers, analyses, orders, products, subscriptions, cart, wishlist |
| **Backend (Node.js)** | Business logic, Firestore read/write, ML proxy, chatbot proxy, file orchestration, Firebase token verification middleware |
| **ML Service (Python)** | Random Forest / VIT model inference — receives quiz answers + photos, returns skin type + confidence |
| **Cloudinary** | Storage for 5-angle face scan photos and product images |

---

## 4. Database Schema (Firestore)

Firestore is a NoSQL document database. Data is organized into **collections** containing **documents**. Relations are handled via document references or denormalization (no JOINs).

### Collection: `customers`

**Document ID:** Firebase Auth `uid` (auto-matched via `requireAuth` middleware)

```
customers/{uid}
  ├── email: string
  ├── name: string
  ├── phone: string?
  ├── avatar: string?            // URL
  ├── role: "CUSTOMER" | "ADMIN"
  ├── subscriptionTier: "FREE" | "PAID"
  ├── subscriptionEndsAt: Timestamp?
  ├── chatbotQueriesUsed: number
  ├── chatbotResetDate: Timestamp?
  └── createdAt: Timestamp
```

### Collection: `analyses`

```
analyses/{analysisId}
  ├── customerId: string          // ref -> customers/{uid}
  ├── status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  ├── quizAnswers: { sebum_level, hydration_level, ... }
  ├── skinNotes: string?
  ├── skinType: string?           // "oily" | "dry" | "combination" | "sensitive" | "normal"
  ├── confidence: number?         // 0–1
  ├── probabilities: { oily: 0.85, ... }
  ├── concernsDetected: string[]
  ├── healthScore: number?        // 0–100
  ├── photoUrls: { front: "url", "left-profile": "url", ... }
  └── createdAt: Timestamp

Indexes:
  - customerId + createdAt DESC (for history queries)
  - customerId + status (for active analysis polling)
```

### Collection: `products`

```
products/{productId}
  ├── name: string
  ├── brand: string
  ├── category: string           // "men-women" | "korean" | "children" | "senior" | "laser-devices"
  ├── subcategory: string?
  ├── price: number              // stored in paise (₹499 → 49900)
  ├── originalPrice: number?
  ├── discount: number?
  ├── rating: number
  ├── reviewCount: number
  ├── images: string[]           // Cloudinary URLs
  ├── description: string
  ├── shortDescription: string
  ├── keyBenefits: string[]
  ├── ingredients: string[]
  ├── howToUse: string
  ├── skinTypes: string[]
  ├── suitableFor: string[]
  ├── concerns: string[]
  ├── volume: string
  ├── inStock: boolean
  ├── stockCount: number
  ├── badges: string[]
  ├── whereToBuy: { amazon?: string, nykaa?: string, ... }
  ├── isDeleted: boolean
  └── createdAt: Timestamp
```

### Collection: `orders`

```
orders/{orderId}
  ├── orderId: string             // human-readable: "GG3K9XA12"
  ├── customerId: string
  ├── items: [{ productId, productName, quantity, priceAtPurchase }]
  ├── shippingAddress: { fullName, email, phone, street, city, state, pincode, type }
  ├── subtotal: number            // paise
  ├── tax: number                 // 18% GST
  ├── shippingCost: number        // 0 or 9900
  ├── promoDiscount: number
  ├── subscriptionDiscount: number
  ├── promoCode: string?
  ├── total: number
  ├── status: "PENDING" | "PROCESSING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  ├── paymentMethod: string
  ├── paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
  ├── razorpayOrderId: string?
  └── createdAt: Timestamp

Indexes:
  - customerId + createdAt DESC
  - status (for admin order management)
```

### Collection: `cart`

```
cart/{customerId}                 // one document per customer
  ├── items: [{ productId: string, quantity: number }]
  └── updatedAt: Timestamp
```

### Collection: `wishlist`

```
wishlist/{customerId}             // one document per customer
  ├── productIds: string[]
  └── updatedAt: Timestamp
```

### Collection: `addresses`

```
addresses/{addressId}
  ├── customerId: string
  ├── fullName: string
  ├── email: string
  ├── phone: string
  ├── street: string
  ├── city: string
  ├── state: string
  ├── pincode: string
  ├── type: "home" | "office"
  ├── isDefault: boolean
  └── createdAt: Timestamp

Indexes:
  - customerId (for listing customer's addresses)
```

### Collection: `ingredients`

```
ingredients/{ingredientId}
  ├── name: string
  ├── category: string            // "Humectant", "AHA", "Barrier Restorer", ...
  ├── description: string
  ├── benefits: string[]
  ├── sideEffects: string[]
  ├── suitableSkinTypes: string[]
  └── createdAt: Timestamp
```

### Collection: `promoCodes`

```
promoCodes/{code}                 // document ID = promo code string
  ├── discount: number            // percentage
  ├── minOrder: number            // paise
  ├── freeShipping: boolean
  ├── isActive: boolean
  ├── expiresAt: Timestamp?
  ├── usageLimit: number?
  └── usageCount: number
```

### Collection: `skinContent`

```
skinContent/{slug}               // document ID = slug string
  ├── title: string
  ├── body: string               // HTML from WYSIWYG editor
  ├── type: "SKIN_TYPE" | "CONCERN" | "INGREDIENT_GUIDE" | "INFO_PAGE"
  └── updatedAt: Timestamp
```

---

## 5. API Endpoint Reference

### Auth (Firebase)

Auth is handled **client-side** via the Firebase SDK. The backend only verifies the Firebase ID Token on protected routes.

| Method | Route | Auth | Description |
|---|---|---|---|
| — | — | Public | **Signup**: `createUserWithEmailAndPassword` (Firebase SDK, client-side) |
| — | — | Public | **Login**: `signInWithEmailAndPassword` (Firebase SDK, client-side) |
| — | — | Public | **Google Sign-In**: `signInWithPopup(googleProvider)` (Firebase SDK, client-side) |
| — | — | Public | **Password Reset**: `sendPasswordResetEmail` (Firebase SDK, client-side) |
| GET | `/api/auth/me` | Required (Firebase ID Token) | Fetch customer profile from Firestore by `uid` |
| PATCH | `/api/auth/me` | Required | Update name, phone, avatar in Firestore |
| POST | `/api/auth/customer` | Required | Create/ensure customer doc in Firestore after Firebase signup |

**Firebase Auth Flow:**
- User signs up/logs in via Firebase SDK on the frontend
- Firebase returns an **ID Token** (JWT) valid for 1 hour
- Frontend sends `Authorization: Bearer <idToken>` on every API call
- Backend verifies token via `firebase-admin` SDK → extracts `uid`
- Backend uses `uid` to read/write customer data in Firestore
- Firebase SDK auto-refreshes the token transparently — no refresh endpoint needed

---

### Demo Accounts (Seed via Firebase Console or Admin SDK)

| Email | Password | Tier | Purpose |
|---|---|---|---|
| `demo.free@glowguide.com` | `demo123456` | FREE | Test free tier limits (max 3 analyses, 10 chat queries/day) |
| `demo.paid@glowguide.com` | `demo123456` | PAID | Test paid features (unlimited analyses, 12-month history, 5% discount) |
| `demo.admin@glowguide.com` | `demo123456` | PAID + role=ADMIN | Test admin panel (product CRUD, order management) |

Created once via Firebase Console → Authentication → Add user, then Firestore `customers/{uid}` docs are seeded with the admin script. The login page shows "click to autofill" buttons for each.

---

### Skin Analysis

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/analysis` | Required | Submit quiz answers → `{ analysisId }` |
| POST | `/api/analysis/:id/photos` | Required | Upload one photo at a time (multipart) with `angle` field |
| GET | `/api/analysis/:id` | Required | Poll analysis status and get result |
| GET | `/api/analysis` | Required | Paginated analysis history (tier-gated) |

**Request: `POST /api/analysis`**
```json
{
  "quizAnswers": {
    "sebum_level": 65,
    "hydration_level": 50,
    "acne_frequency": 30,
    "sensitivity_score": 20,
    "tightness_score": 30,
    "pore_visibility": 70,
    "sun_exposure": 50
  },
  "skinNotes": "red patches near chin"
}
```
**Response:** `{ "analysisId": "clx123abc" }`

**Request: `POST /api/analysis/:id/photos`**
```
Content-Type: multipart/form-data
Fields:
  photo: <binary blob>
  angle: "front" | "left-profile" | "right-profile" | "tilt-left" | "tilt-right"
```

**Response: `GET /api/analysis/:id`** (when complete)
```json
{
  "id": "clx123abc",
  "status": "completed",
  "skinType": "oily",
  "confidence": 0.88,
  "probabilities": { "oily": 0.88, "combination": 0.08, "normal": 0.04 },
  "concernsDetected": ["acne", "pore_size"],
  "healthScore": 62,
  "createdAt": "2026-06-27T08:30:00Z"
}
```

---

### Recommendations

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/recommendations` | Required | Top 10 products matched to customer's latest skin type & concerns |

---

### Products

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Public | Paginated product list with filters |
| GET | `/api/products/:id` | Public | Single product detail |
| GET | `/api/categories` | Public | List of distinct product categories |
| GET | `/api/brands` | Public | List of distinct product brands |

**Query params for `GET /api/products`:**
```
category=men-women,korean
skinTypes=oily,dry
brands=Cetaphil,Simple
priceMin=0
priceMax=30000
rating=4
discount=10
inStock=true
sort=bestseller | price-low | price-high | rating | newest | discount
search=hyaluronic
page=1
limit=20
```

---

### Cart

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | Required | Get customer's cart items |
| POST | `/api/cart/add` | Required | `{ productId, quantity }` → add item |
| DELETE | `/api/cart/remove` | Required | `{ productId }` → remove item |
| DELETE | `/api/cart` | Required | Empty the cart |

---

### Wishlist

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/wishlist` | Required | Get wishlist products |
| POST | `/api/wishlist/add` | Required | `{ productId }` → add to wishlist |
| DELETE | `/api/wishlist/remove` | Required | `{ productId }` → remove from wishlist |

---

### Orders

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/orders/validate-promo` | Optional | Validate promo code + calculate discount |
| POST | `/api/orders` | Required | Create order from cart |
| GET | `/api/orders` | Required | Customer's order history |
| GET | `/api/orders/:id` | Required | Single order detail |

**Request: `POST /api/orders/validate-promo`**
```json
{ "code": "GLOW20", "subtotal": 150000 }
```
**Response:**
```json
{ "valid": true, "discount": 20, "freeShipping": false, "message": "20% off applied!" }
```

**Request: `POST /api/orders`**
```json
{
  "items": [{ "productId": "prod-01", "quantity": 2 }],
  "shippingAddress": { "fullName": "Jane Doe", "email": "...", "phone": "...", "street": "...", "city": "...", "state": "...", "pincode": "...", "type": "home" },
  "paymentMethod": "card",
  "promoCode": "GLOW20"
}
```

---

### Subscription

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/subscription` | Required | Current tier, `endsAt`, feature list |
| POST | `/api/subscription/create` | Required | Upgrade to paid tier |
| POST | `/api/subscription/cancel` | Required | Schedule cancellation at period end |

---

### Chatbot

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/chatbot/query` | Required | Send message, get AI reply |
| GET | `/api/chatbot/usage` | Required | `{ used, limit, resetAt }` |

**Request: `POST /api/chatbot/query`**
```json
{
  "message": "What cleanser should I use for oily skin?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

---

### Ingredients

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/ingredients` | Public | `?search=&category=&skinType=` |
| GET | `/api/ingredients/:id` | Public | Single ingredient detail |
| POST | `/api/ingredients` | Admin | Create ingredient |
| PUT | `/api/ingredients/:id` | Admin | Update ingredient |
| DELETE | `/api/ingredients/:id` | Admin | Delete ingredient |

---

### Public CMS

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/skin-content` | Public | `?type=SKIN_TYPE&slug=oily` — CMS pages |

---

### Admin

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | Revenue, total orders, new customers, analyses |
| GET | `/api/admin/products` | Admin | All products (incl. soft-deleted) with pagination |
| POST | `/api/admin/products` | Admin | Create product |
| PUT | `/api/admin/products/:id` | Admin | Update product |
| DELETE | `/api/admin/products/:id` | Admin | Soft delete product |
| GET | `/api/admin/orders` | Admin | All orders with status filter |
| PATCH | `/api/admin/orders/:id/status` | Admin | Update fulfillment status |
| GET | `/api/admin/customers` | Admin | Customer list with tier info |
| GET | `/api/admin/customers/:id` | Admin | Customer detail + analysis summary |
| GET | `/api/admin/promos` | Admin | All promo codes |
| POST | `/api/admin/promos` | Admin | Create promo code |
| PUT | `/api/admin/promos/:id` | Admin | Update / toggle promo |
| DELETE | `/api/admin/promos/:id` | Admin | Delete promo code |
| GET | `/api/admin/content` | Admin | List CMS content pages |
| PUT | `/api/admin/content/:id` | Admin | Update CMS page body (WYSIWYG) |

### Utility

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Service health check |
| GET | `/api/wake` | Public | Wake-up ping (frontend calls on mount to warm free-tier) |

---

## 6. Feature-by-Feature Flow

### Auth Flow (Firebase)

```
Signup (Email/Password):
  Frontend: createUserWithEmailAndPassword(auth, email, password)
  → Firebase creates user, returns { uid, email }
  → Frontend calls POST /api/auth/customer with { name, phone }
  → Backend creates customer doc in Firestore: customers/{uid}
  → Return { customer }

Signup (Google):
  Frontend: signInWithPopup(auth, googleProvider)
  → Firebase creates/returns user with { uid, email, displayName, photoURL }
  → Frontend calls POST /api/auth/customer (first sign-in only)
  → Backend creates customer doc in Firestore: customers/{uid}
  → Return { customer }

Login (Email/Password):
  Frontend: signInWithEmailAndPassword(auth, email, password)
  → Firebase returns user + ID token
  → Frontend calls GET /api/auth/me with token
  → Backend verifies token, fetches customers/{uid}
  → Return { customer }

Protected request:
  Authorization: Bearer <firebase-id-token>
  → Middleware: admin.auth().verifyIdToken(token) → { uid, email }
  → Attach req.customer = merged({ uid, email } + Firestore doc)
```

---

### Skin Analysis Flow
```
1. POST /api/analysis           { quizAnswers, skinNotes? }
   → Check analysis count for FREE tier (max 3)
   → If limit reached: 403 { code: "ANALYSIS_LIMIT_REACHED" }
   → Create SkinAnalysis { status: PENDING }
   → Return { analysisId }

2. POST /api/analysis/:id/photos  (x5, one per angle)
   → Upload each to Cloudinary
   → Store URL in SkinAnalysis.photoUrls
   → When all 5 received: set status = PROCESSING, trigger ML job

3. ML Job (async):
   → Forward quizAnswers + photo URLs to ML Service
   → Receive: { skin_type, confidence, probabilities, concerns_detected }
   → Compute healthScore
   → Update SkinAnalysis: status=COMPLETED, fill all result fields

4. GET /api/analysis/:id  (frontend polls every 3 sec)
   → Return current status + result fields
   → Frontend shows results when status === "completed"
```

---

### Checkout Flow
```
1. POST /api/orders/validate-promo { code, subtotal }
   → Look up PromoCode in DB
   → Check: isActive, not expired, subtotal >= minOrder
   → Return discount percentage + freeShipping flag

2. POST /api/orders { items, shippingAddress, paymentMethod, promoCode? }
   → Validate all productIds exist + are inStock
   → Fetch product prices from DB (never trust client-side prices)
   → Calculate:
       subtotal = Σ(price × qty)
       tax      = subtotal × 0.18  (18% GST)
       shipping = subtotal >= 99900 ? 0 : 9900  (free ≥ ₹999)
       promoDiscount    = promo ? subtotal × promoDiscount% : 0
       subscriptionDisc = isPaid ? subtotal × 0.05 : 0
       total    = subtotal + tax + shipping - promoDiscount - subscriptionDisc
   → Create Order + OrderItems in DB (status=PENDING, paymentStatus=PENDING)
   → Phase 1: set paymentStatus=PAID immediately (simulated)
   → Phase 2: create Razorpay order, return { razorpayOrderId, amount }
   → Clear customer's cart
   → Return { orderId, total, status }
```

---

### Chatbot Quota Flow
```
POST /api/chatbot/query { message, history? }

1. Fetch customer.chatbotQueriesUsed + customer.chatbotResetDate from DB
2. If chatbotResetDate is a past date (different calendar day):
   → Reset chatbotQueriesUsed = 0, chatbotResetDate = today
3. If FREE tier AND chatbotQueriesUsed >= 10:
   → Return 429 { code: "QUOTA_EXCEEDED", message: "Subscribe for unlimited queries" }
4. Call Gemini API with system prompt + history + message
5. Increment chatbotQueriesUsed
6. Return { reply, queriesRemaining }
```

---

### Subscription Flow
```
POST /api/subscription/create
→ Phase 1: directly set subscriptionTier=PAID, subscriptionEndsAt=+30 days in customers/{uid}
→ Phase 2: create Razorpay subscription, webhook updates tier on payment success

Cron job (daily — Cloud Function or scheduled task):
→ Query customers collection where subscriptionTier == "PAID" AND subscriptionEndsAt < now()
→ For each: update doc — set subscriptionTier = "FREE"
→ NOTE: Do NOT delete any SkinAnalysis records — data is preserved

When FREE user accesses history:
→ Query analyses collection where customerId == uid, order by createdAt DESC, limit 3

When PAID user accesses history:
→ Query analyses collection where customerId == uid AND createdAt > 12-months-ago, order by createdAt DESC
```

---

## 7. Business Logic & Rules

### Pricing & Tax (all in paise to avoid float errors)
| Rule | Value |
|---|---|
| GST rate | 18% on subtotal |
| Free shipping threshold | ₹999 (99900 paise) |
| Shipping cost | ₹99 (9900 paise) if below threshold |
| Paid subscriber discount | Extra 5% off subtotal |
| Subscriber discount stacks | Yes — applied after promo code |

### Promo Codes (seed data from frontend)
| Code | Discount | Min Order |
|---|---|---|
| `FIRST10` | 10% | None |
| `GLOW20` | 20% | ₹1,500 |
| `SKIN15` | 15% | None |
| `FREESHIP` | 0% + free shipping | ₹500 |
| `SUMMER25` | 25% | ₹2,000 |

### Analysis Limits
| Tier | Analyses Allowed | History Visible |
|---|---|---|
| FREE | Max **3 total** | Last 3 |
| PAID | Unlimited | Last 12 months |

> All analysis data is stored permanently. Limits only control access — never deletion.

### Health Score Formula
```
avgConcernSeverity = mean of all concern severity values (0–100)
healthScore = 100 - (avgConcernSeverity × 0.6) - ((1 - confidence) × 40)
healthScore = clamp(healthScore, 0, 100)
```

### Order ID Format
Server-generated. Never trust client: `'GG' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2,5).toUpperCase()`

---

## 8. Technology Stack

| Layer | Technology | Reason | Free Tier |
|---|---|---|---|---|
| Runtime | Node.js 20 LTS | Matches existing backend scaffold | ✅ |
| Framework | Express.js + TypeScript | Already chosen in project | ✅ |
| Database | Firestore (NoSQL) | Serverless, auto-scaling, real-time listeners | ✅ 50K reads/day, 1GB stored |
| Auth | Firebase Auth (Email/Password + Google) | Secure, serverless, no password hash management | ✅ 50K MAU |
| Admin SDK | firebase-admin | Server-side token verification + Firestore admin access | ✅ |
| Validation | Zod | Runtime type safety for request bodies | ✅ |
| HTTP Status Codes | http-status-codes | Named constants instead of magic numbers | ✅ |
| Date Utils | dayjs | Lightweight date math (quota resets, subscription expiry) | ✅ |
| File Upload | Multer + Cloudinary SDK | Easy image hosting + CDN | ✅ 25GB storage, 25GB bandwidth/mo |
| LLM | **Google Gemini Flash** (not OpenAI) | Gemini free tier allows 60 req/min — OpenAI is pay-as-you-go | ✅ 60 req/min free |
| Payment | Razorpay (Phase 2) | Best INR support in India | ✅ 0% fee on UPI, per-transaction only |
| Email | **Resend** | 100 emails/day free, simple API | ✅ 100 emails/day |
| Logging | Winston + Morgan | Structured server logs | ✅ |
| Testing | Jest + Supertest (with Firestore emulator) | Unit and integration tests | ✅ |
| **Backend hosting** | **Render free tier** | 512MB RAM, 750 hours/month (sleeps after 15 min idle). Vercel free (10s timeout) is too short for ML proxy. | ✅ |
| **Frontend hosting** | **Vercel** | SPA hosting with CDN, free SSL, auto-deploys from GitHub, already has `vercel.json` config | ✅ 100GB bandwidth, 6000 build min/mo |
| Containerisation | Docker + docker-compose | ML service + Backend orchestrated locally | ✅ |

### Folder Structure

```
Backend/
├── service-account.json         # Firebase Admin SDK key (gitignored)
├── src/
│   ├── server.ts               # Express app bootstrap + middleware stack
│   ├── config/
│   │   ├── env.ts              # Validated env loader (Zod)
│   │   └── firebase-admin.ts   # Firebase Admin SDK init
│   ├── routes/                 # Route definitions only (thin)
│   │   ├── customer.routes.ts  # POST /auth/customer, GET /auth/me, PATCH /auth/me
│   │   ├── analysis.routes.ts
│   │   ├── products.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── wishlist.routes.ts
│   │   ├── orders.routes.ts
│   │   ├── subscription.routes.ts
│   │   ├── chatbot.routes.ts
│   │   ├── ingredients.routes.ts
│   │   ├── skin-content.routes.ts
│   │   ├── admin.routes.ts
│   │   └── recommendations.routes.ts
│   ├── controllers/            # Request handling, calls services
│   │   ├── customer.controller.ts
│   │   ├── analysis.controller.ts
│   │   └── ...
│   ├── services/               # Business logic, Firestore queries
│   │   ├── customer.service.ts
│   │   ├── analysis.service.ts
│   │   ├── order.service.ts    # Pricing calc, GST, promotions
│   │   ├── recommendation.service.ts
│   │   └── ...
│   ├── middleware/
│   │   ├── requireAuth.ts      # Firebase ID token verify → attach req.uid
│   │   ├── requireAdmin.ts     # role === ADMIN check in Firestore
│   │   ├── validate.ts         # Zod schema validation wrapper
│   │   ├── rateLimiter.ts      # 100 req/min per IP
│   │   └── errorHandler.ts     # Global error handler
│   ├── utils/
│   │   ├── pricing.ts          # GST calc, shipping, discount logic
│   │   ├── healthScore.ts      # Health score formula
│   │   ├── orderId.ts          # GG-prefixed human-readable IDs
│   │   └── response.ts         # Unified JSON response helpers
│   ├── types/
│   │   └── express.d.ts        # Express Request augmentation
│   └── __tests__/
│       ├── setup.ts            # Firestore emulator setup
│       ├── auth.test.ts
│       ├── products.test.ts
│       └── ...
└── tsconfig.json
```

### Middleware Stack (Express)
```
cors          → whitelist: FRONTEND_URL
helmet        → security headers
compression   → gzip responses
express.json  → body parsing
morgan        → HTTP request logging
rateLimiter   → 100 req/min per IP (express-rate-limit)
validate      → Zod schema validation on request body/query/params
requireAuth   → admin.auth().verifyIdToken(token) → attach req.uid
requireAdmin  → Firestore lookup: role === ADMIN check
errorHandler  → Catches thrown errors, returns unified JSON
```

### Unified API Response Format

Every endpoint returns a consistent envelope:

```typescript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: { code: "ERROR_CODE", message: "Human-readable message" } }

// Paginated
{ success: true, data: [...], pagination: { page, limit, total, totalPages } }
```

This lets the frontend handle responses generically instead of parsing status codes per endpoint.

**Error codes reference:**

| HTTP Status | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Zod validation failed (malformed request body) |
| 401 | `UNAUTHORIZED` | Missing or invalid access token |
| 403 | `FORBIDDEN` | Valid token but insufficient role |
| 403 | `ANALYSIS_LIMIT_REACHED` | Free tier max analyses exceeded |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 409 | `DUPLICATE_ENTRY` | Email already registered, product already in cart |
| 429 | `QUOTA_EXCEEDED` | Chatbot daily limit or rate limit |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

---

## 9. Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Firebase Admin SDK
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
FIREBASE_PROJECT_ID=glowguide-xxxxx

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Frontend (CORS whitelist)
FRONTEND_URL=http://localhost:5173

# LLM (Gemini recommended — generous free tier)
GEMINI_API_KEY=...

# Cloudinary (photo storage)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Payment — Phase 2
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# Email — Phase 2
RESEND_API_KEY=re_...
```

### Frontend Environment (`.env`)

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=glowguide-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=glowguide-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=glowguide-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 10. Data Types Contract

These are the exact TypeScript shapes the frontend expects the backend to return.

```typescript
// Customer (from AuthContext.tsx)
interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  subscriptionTier: 'free' | 'paid';
  subscriptionEndsAt?: string;   // ISO 8601 string
  createdAt: string;
}

// Skin Analysis result (from SkinQuiz.tsx)
interface AnalysisResponse {
  skin_type: string;             // 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal'
  confidence: number;            // 0–1
  probabilities: Record<string, number>;  // { oily: 0.85, ... }
  concerns_detected: string[];   // ['acne', 'pore_size']
}

// Analysis history item (from analysisHistory.ts)
interface SkinAnalysisHistoryItem {
  id: string;
  date: string;                  // ISO 8601 timestamp
  healthScore: number;           // 0–100
  skinType: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
  confidence: number;            // 0–1
  concerns: ConcernMetric[];     // [{ name: 'acne', severity: 80 }]
  notes?: string;
}

interface ConcernMetric {
  name: string;
  severity: number;              // 0–100
}

// Product (from types/product.ts)
interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'men-women' | 'korean' | 'children' | 'senior' | 'laser-devices';
  subcategory?: string;
  price: number;                 // in rupees (not paise) for display
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  description: string;
  shortDescription: string;
  keyBenefits: string[];
  ingredients: string[];
  howToUse: string;
  skinTypes: string[];
  suitableFor: string[];
  concerns: string[];
  volume: string;
  inStock: boolean;
  stockCount: number;
  badges?: string[];
  whereToBuy: { amazon?: string; nykaa?: string; flipkart?: string; official?: string };
}

// Order (from types/product.ts)
interface Order {
  orderId: string;
  items: CartItem[];
  shippingAddress: Address;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered';
  paymentMethod: string;
  createdAt: Date;
}

// Address
interface Address {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'office';
}
```

> **Note on prices**: Store prices in **paise** in the database to avoid floating-point issues. Return prices in **rupees** (divide by 100) in all API responses, matching the existing frontend number format.

---

## 11. Testing Strategy

### Test Setup (Phase 1)
- **Framework**: Jest + Supertest
- **Firestore emulator**: Use `@firebase/rules-unit-testing` with Firestore emulator for test isolation
- **Auth emulator**: Use Firebase Auth emulator for token generation in tests
- **Pattern**: Integration tests that hit real Express routes with emulated Firebase

### What to Test per Phase

| Phase | Focus | Example Tests |
|---|---|---|
| **1** | Health endpoint, Firebase Admin init | `GET /api/health` returns 200 |
| **2** | Firebase token verification | Valid token → 200, missing token → 401, expired token → 401 |
| **2** | Customer doc creation | POST `/api/auth/customer` creates Firestore doc for new uid |
| **4** | Product CRUD + filters | Filter by category, price range, search term, pagination |
| **6** | Order lifecycle | Create order, validate promo, verify price calc (paise math) |
| **10** | Admin gating | Non-admin gets 403, admin can CRUD products |

### Key Assertions
- Every endpoint returns the **unified response envelope** (`{ success, data }` or `{ success, error }`)
- Prices are correct: no floating point drift after GST + discount + shipping
- Auth middleware rejects missing/invalid Firebase ID tokens
- Firestore documents have expected fields after write operations

---

## 12. Build Order

Build the backend in this sequence to minimise blockers:

| Phase | Module | Endpoints | Depends On |
|---|---|---|---|---|
| **1** | Foundation | Firebase project setup, Firestore collections, Firebase Hosting config, health check | — |
| **2** | Firebase Auth (Frontend) | Firebase SDK init, `useAuthStore` rewrite, Google sign-in button, Login/Signup pages update | — |
| **3** | Backend Auth Middleware | `/api/auth/me`, `/api/auth/customer`, `requireAuth`, `requireAdmin`, `firebase-admin` config | Phase 2 |
| **4** | Skin Analysis | `/api/analysis/*` — create, photos, poll, history | Phase 3, ML Service |
| **5** | Products | Seed `products.ts` → Firestore, `/api/products`, categories, brands + product endpoint tests | Phase 3 |
| **6** | Cart & Wishlist | `/api/cart/*`, `/api/wishlist/*` | Phase 3, Phase 5 |
| **7** | Orders | `/api/orders/*`, promo validation | Phase 3, Phase 5, Phase 6 |
| **8** | Dashboard | `/api/dashboard` aggregate | Phase 4, Phase 7 |
| **9** | Chatbot | `/api/chatbot/*` + quota enforcement | Phase 3, LLM API |
| **10** | Subscription | `/api/subscription/*` + daily cron | Phase 3 |
| **11** | Admin Panel | `/api/admin/*` CRUD + admin endpoint tests | Phase 3 (role=ADMIN) |
| **12** | Ingredients API | `/api/ingredients/*` — move from hardcoded frontend | Phase 3 |
| **13** | CMS Content | `/api/skin-content`, `/api/admin/content` | Phase 11 |
| **14** | Recommendations | `/api/recommendations` — algorithm | Phase 4, Phase 5 |
| **15** | Razorpay | Replace simulated payment | Phase 7 |

---

## 13. Open Decisions

The following questions are not answered by the existing codebase and require a decision before implementation:

| # | Question | Options | Recommendation |
|---|---|---|---|
| **1** | **LLM provider for chatbot** | OpenAI GPT-4o-mini vs Google Gemini Flash | **Gemini Flash** — free tier allows 60 requests/min vs OpenAI which is pay-as-you-go |
| **2** | **Photo upload flow** | All 5 in one multipart request vs 5 separate POSTs | 5 separate POSTs (matches DATA-FLOW.md plan and allows per-angle progress UI) |
| **3** | **Analysis processing** | Sync (wait for ML) vs Async (job queue + polling) | Async + polling (matches plan, better UX, ML calls can be slow) |
| **4** | **Subscription payment** | Simulate only vs Razorpay integration | Simulate for Phase 1, Razorpay for Phase 2 |
| **5** | **Admin auth** | Custom claim (Firebase) vs Firestore role field | Firestore role field — simpler, no custom claim refresh issues |
| **6** | **Email notifications** | Resend vs SendGrid vs Nodemailer | Resend (simplest API, free tier generous) |
| **7** | **Chat history persistence** | Session only (in-memory/Redux) vs persist to Firestore | Session only for Phase 1; Firestore for Phase 2 |
| **8** | **Firestore composite indexes** | Auto-index vs manual composite indexes | Composite indexes needed for: analyses(customerId, createdAt DESC), orders(customerId, createdAt DESC) |
| **9** | **Frontend hosting** | Firebase Hosting vs Vercel | **Vercel** — already has `vercel.json` config, auto-deploys from GitHub, free tier generous. Firebase Hosting would require adding `firebase.json` and separate deploy setup |
| **10** | **Product images** | Keep affiliate links (`whereToBuy`) as-is vs Cloudinary hosted | Keep affiliate links for now; Cloudinary for custom product photos |
| **11** | **VIT model** | Use existing Random Forest ML service vs add Vision Transformer | Use Random Forest for Phase 1; VIT is Phase 2+ (already in IMPLEMENTATION_ROADMAP.md) |

---

## 14. Free Tier Budget & Limits

| Service | Free Limit | When to Upgrade |
|---|---|---|
| **Firebase Auth** | 50,000 MAU (monthly active users) | >50K signups/month |
| **Firestore** | 50K reads/day, 20K writes/day, 20K deletes/day, 1GB stored | >1GB or >50K reads/day |
| **Vercel (Frontend)** | 100GB bandwidth, 6000 build minutes/month, free SSL | >100GB bandwidth or need server-side rendering |
| **Render (Backend)** | 512MB RAM, shared CPU, sleeps after 15 min idle, 750 hours/month | Need no cold starts, more RAM, or >750 hours |
| **Cloudinary** | 25GB storage, 25GB bandwidth/month, 25 transformations | Need more than 25 image transformations |
| **Gemini API** | 60 requests/min, 1M tokens/min (free tier) | >60 chat requests/min |
| **Resend (Email)** | 100 emails/day, 500 emails total | Need >100 order confirmations/day |
| **Razorpay** | 0% fee on UPI payments, 2% on cards | Production scale only (transaction fees are %-based) |

**Realistic scale the free tier supports:** 1,000–5,000 customers, 50–100 orders/day, ~10,000 analyses stored.

---

*This report was generated through static analysis of the GlowGuide frontend codebase, plan documents, and project context files. No changes were made to any source files.*
