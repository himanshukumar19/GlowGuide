# GlowGuide — Backend Analysis & Planning Report

> **Prepared**: 2026-06-27  
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
11. [Build Order](#11-build-order)
12. [Open Decisions](#12-open-decisions)

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
| **Chatbot** | AI assistant (OpenAI/Gemini) accessible site-wide, quota-gated by tier |
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
┌─────────────────────────────────┐
│     Browser (React SPA)         │
│   Vite + React + TypeScript     │
│   Deployed → Vercel             │
└────────────────┬────────────────┘
                 │ HTTPS (JWT in Authorization header)
                 ▼
┌─────────────────────────────────┐
│  GlowGuide Backend              │
│  Node.js + Express + TypeScript │
│  Deployed → Render / Railway    │
└─────┬───────────┬───────────────┘
      │           │
      ▼           ▼
┌──────────┐ ┌──────────────────┐
│PostgreSQL│ │  ML Service       │
│(Prisma)  │ │  Python FastAPI   │
│Render DB │ │  Random Forest    │
└──────────┘ │  Deployed →Render │
             └──────────────────┘
                      │
          ┌───────────┴──────────┐
          │                      │
     ┌─────────┐          ┌────────────┐
     │  Redis  │          │ Cloudinary │
     │ Quota + │          │ Photo      │
     │ Rate    │          │ Storage    │
     │ Limit   │          └────────────┘
     └─────────┘
```

### Service Responsibilities

| Service | Responsibility |
|---|---|
| **Backend (Node.js)** | Auth, business logic, data access, ML proxy, chatbot proxy, file orchestration |
| **ML Service (Python)** | Random Forest / VIT model inference — receives quiz answers + photos, returns skin type + confidence |
| **PostgreSQL** | All persistent data: customers, analyses, orders, products, subscriptions |
| **Redis** | Chatbot daily quota counters, refresh token blacklist, rate limiting |
| **Cloudinary** | Storage for 5-angle face scan photos and product images |

---

## 4. Database Schema

### Customer
```prisma
model Customer {
  id                 String           @id @default(cuid())
  email              String           @unique
  name               String
  phone              String?
  avatar             String?          // Cloudinary URL
  passwordHash       String
  role               Role             @default(CUSTOMER)
  subscriptionTier   SubscriptionTier @default(FREE)
  subscriptionEndsAt DateTime?
  chatbotQueriesUsed Int              @default(0)
  chatbotResetDate   DateTime?
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  analyses           SkinAnalysis[]
  orders             Order[]
  wishlistItems      WishlistItem[]
  cartItems          CartItem[]
  addresses          Address[]
}

enum Role             { CUSTOMER ADMIN }
enum SubscriptionTier { FREE PAID }
```

### SkinAnalysis
```prisma
model SkinAnalysis {
  id               String          @id @default(cuid())
  customerId       String
  customer         Customer        @relation(fields: [customerId], references: [id])

  status           AnalysisStatus  @default(PENDING)

  // Input
  quizAnswers      Json            // { sebum_level: 65, hydration_level: 50, ... }
  skinNotes        String?         // free-text notes from user

  // Output (populated when status = COMPLETED)
  skinType         SkinType?
  confidence       Float?
  probabilities    Json?           // { oily: 0.85, dry: 0.05, ... }
  concernsDetected String[]        // ["acne", "pore_size"]
  healthScore      Int?            // 0-100

  // Photos
  photoUrls        Json?           // { front: "url", left-profile: "url", ... }

  createdAt        DateTime        @default(now())
}

enum AnalysisStatus { PENDING PROCESSING COMPLETED FAILED }
enum SkinType       { oily dry combination sensitive normal }
```

### Product
```prisma
model Product {
  id               String       @id @default(cuid())
  name             String
  brand            String
  category         String       // 'men-women' | 'korean' | 'children' | 'senior' | 'laser-devices'
  subcategory      String?
  price            Int          // stored in paise (₹499 → 49900) to avoid float errors
  originalPrice    Int?
  discount         Int?         // percentage
  rating           Float        @default(0)
  reviewCount      Int          @default(0)
  images           String[]     // Cloudinary URLs
  description      String       @db.Text
  shortDescription String
  keyBenefits      String[]
  ingredients      String[]
  howToUse         String       @db.Text
  skinTypes        String[]     // ['oily', 'dry', 'combination', 'sensitive', 'normal']
  suitableFor      String[]     // ['men', 'women', 'children', 'teens', 'adults', 'seniors']
  concerns         String[]
  volume           String
  inStock          Boolean      @default(true)
  stockCount       Int          @default(0)
  badges           String[]     // ['bestseller', 'new', 'organic', ...]
  whereToBuy       Json         // { amazon: "url", nykaa: "url", ... }
  isDeleted        Boolean      @default(false)  // soft delete

  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  orderItems       OrderItem[]
  wishlistItems    WishlistItem[]
  cartItems        CartItem[]
}
```

### Order & OrderItem
```prisma
model Order {
  id              String        @id @default(cuid())
  orderId         String        @unique  // human-readable: "GG3K9XA12"
  customerId      String
  customer        Customer      @relation(fields: [customerId], references: [id])
  items           OrderItem[]
  shippingAddress Json          // snapshot of Address at time of purchase
  subtotal        Int           // paise
  tax             Int           // 18% GST
  shippingCost    Int           // 0 or 9900 (₹99)
  promoDiscount   Int           @default(0)
  subscriptionDiscount Int      @default(0)  // 5% if paid tier
  promoCode       String?
  total           Int
  status          OrderStatus   @default(PENDING)
  paymentMethod   String
  paymentStatus   PaymentStatus @default(PENDING)
  razorpayOrderId String?       // for Phase 2 payment integration
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model OrderItem {
  id              String   @id @default(cuid())
  orderId         String
  order           Order    @relation(fields: [orderId], references: [id])
  productId       String
  product         Product  @relation(fields: [productId], references: [id])
  quantity        Int
  priceAtPurchase Int      // paise snapshot — price may change later
}

enum OrderStatus   { PENDING PROCESSING CONFIRMED SHIPPED DELIVERED CANCELLED }
enum PaymentStatus { PENDING PAID FAILED REFUNDED }
```

### CartItem & WishlistItem
```prisma
model CartItem {
  id         String   @id @default(cuid())
  customerId String
  productId  String
  quantity   Int      @default(1)
  @@unique([customerId, productId])
}

model WishlistItem {
  id         String   @id @default(cuid())
  customerId String
  productId  String
  createdAt  DateTime @default(now())
  @@unique([customerId, productId])
}
```

### Address
```prisma
model Address {
  id         String      @id @default(cuid())
  customerId String
  customer   Customer    @relation(fields: [customerId], references: [id])
  fullName   String
  email      String
  phone      String
  street     String
  city       String
  state      String
  pincode    String
  type       AddressType // home | office
  isDefault  Boolean     @default(false)
  createdAt  DateTime    @default(now())

  enum AddressType { home office }
}
```

### Ingredient
```prisma
model Ingredient {
  id                String   @id @default(cuid())
  name              String   @unique
  category          String   // "Humectant", "AHA", "Barrier Restorer", ...
  description       String   @db.Text
  benefits          String[]
  sideEffects       String[]
  suitableSkinTypes String[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### PromoCode
```prisma
model PromoCode {
  id           String    @id @default(cuid())
  code         String    @unique
  discount     Int       // percentage
  minOrder     Int       // paise minimum subtotal
  freeShipping Boolean   @default(false)
  isActive     Boolean   @default(true)
  expiresAt    DateTime?
  usageLimit   Int?
  usageCount   Int       @default(0)
}
```

### SkinContent (CMS)
```prisma
model SkinContent {
  id          String   @id @default(cuid())
  slug        String   @unique  // e.g. "skin-type-oily", "concern-acne"
  title       String
  body        String   @db.Text // HTML from WYSIWYG editor
  type        ContentType
  updatedAt   DateTime @updatedAt
  createdAt   DateTime @default(now())

  enum ContentType { SKIN_TYPE CONCERN INGREDIENT_GUIDE INFO_PAGE }
}
```

---

## 5. API Endpoint Reference

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register new customer |
| POST | `/api/auth/login` | Public | Customer login → JWT |
| POST | `/api/auth/admin/login` | Public | Admin-specific login → JWT with role=ADMIN |
| POST | `/api/auth/logout` | Required | Blacklist refresh token |
| GET | `/api/auth/me` | Required | Current customer profile |
| PATCH | `/api/auth/me` | Required | Update name, phone, avatar |
| POST | `/api/auth/refresh` | Required | Issue new access token |

**JWT Strategy:**
- Access token: 15 min expiry
- Refresh token: 30 days, stored in HttpOnly cookie
- Blacklist expired/logged-out refresh tokens in Redis

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

### Auth Flow
```
Signup:
  POST /api/auth/signup { name, email, phone, password }
  → Hash password (bcrypt, 12 rounds)
  → Create Customer in DB (tier=FREE)
  → Issue JWT access + refresh token
  → Return { customer, token }

Login:
  POST /api/auth/login { email, password }
  → Find Customer by email
  → Compare password hash
  → Issue JWT access + refresh token
  → Return { customer, token }

Protected request:
  Authorization: Bearer <token>
  → Middleware: verify JWT, attach req.customer
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
4. Call LLM API (OpenAI / Gemini) with system prompt + history + message
5. Increment chatbotQueriesUsed
6. Return { reply, queriesRemaining }
```

---

### Subscription Flow
```
POST /api/subscription/create
→ Phase 1: directly set subscriptionTier=PAID, subscriptionEndsAt=+30 days
→ Phase 2: create Razorpay subscription, webhook updates tier on payment success

Cron job (daily):
→ Find all Customers WHERE subscriptionTier=PAID AND subscriptionEndsAt < NOW()
→ SET subscriptionTier=FREE
→ NOTE: Do NOT delete any SkinAnalysis records — data is preserved

When FREE user accesses history:
→ SELECT * FROM SkinAnalysis WHERE customerId=? ORDER BY createdAt DESC LIMIT 3

When PAID user accesses history:
→ SELECT * FROM SkinAnalysis WHERE customerId=? AND createdAt > NOW()-12months
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

| Layer | Technology | Reason |
|---|---|---|
| Runtime | Node.js 20 LTS | Matches existing backend scaffold |
| Framework | Express.js + TypeScript | Already chosen in project |
| ORM | Prisma | Type-safe, migrations, great DX |
| Database | PostgreSQL | Required for relational order/user data |
| Auth | JWT (jsonwebtoken) + bcrypt | Stateless, industry standard |
| Validation | Zod | Runtime type safety, matches TS types |
| File Upload | Multer + Cloudinary SDK | Easy image hosting + CDN |
| Cache / Rate Limit | Redis (ioredis) | Chatbot quota, token blacklist |
| LLM | OpenAI GPT-4o-mini or Google Gemini Flash | Cost-effective chatbot |
| Payment | Razorpay (Phase 2) | Best INR support in India |
| Email | Resend or Nodemailer + SendGrid | Order confirmations |
| Logging | Winston + Morgan | Structured server logs |
| Testing | Jest + Supertest | Unit and integration tests |
| Containerisation | Docker + docker-compose | All 3 services orchestrated locally |

### Middleware Stack (Express)
```
cors          → whitelist: FRONTEND_URL
helmet        → security headers
compression   → gzip responses
express.json  → body parsing
morgan        → HTTP request logging
rateLimiter   → 100 req/min per IP (express-rate-limit)
requireAuth   → JWT verify on protected routes
requireAdmin  → role===ADMIN check on admin routes
```

---

## 9. Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:5432/glowguide

# Auth
JWT_SECRET=<256-bit-secret>
JWT_REFRESH_SECRET=<another-256-bit-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Frontend (CORS whitelist)
FRONTEND_URL=http://localhost:8081

# Redis
REDIS_URL=redis://localhost:6379

# LLM (choose one)
OPENAI_API_KEY=sk-...
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

## 11. Build Order

Build the backend in this sequence to minimise blockers:

| Phase | Module | Endpoints | Depends On |
|---|---|---|---|
| **1** | Foundation | Express setup, Prisma init, DB migrations, health check | — |
| **2** | Auth | `/api/auth/*` — signup, login, admin/login, me, refresh | DB |
| **3** | Skin Analysis | `/api/analysis/*` — create, photos, poll, history | Auth, ML Service |
| **4** | Products | Seed from `products.ts`, `/api/products`, categories, brands | DB |
| **5** | Cart & Wishlist | `/api/cart/*`, `/api/wishlist/*` | Auth, Products |
| **6** | Orders | `/api/orders/*`, promo validation | Auth, Products, Cart |
| **7** | Dashboard | `/api/dashboard` aggregate | Auth, Analysis, Orders |
| **8** | Chatbot | `/api/chatbot/*` + quota enforcement | Auth, Redis, LLM API |
| **9** | Subscription | `/api/subscription/*` + daily cron | Auth, DB |
| **10** | Admin Panel | `/api/admin/*` CRUD | Auth (role=ADMIN), all above |
| **11** | Ingredients API | `/api/ingredients/*` — move from hardcoded frontend | DB |
| **12** | CMS Content | `/api/skin-content`, `/api/admin/content` | Admin |
| **13** | Recommendations | `/api/recommendations` — algorithm | Analysis, Products |
| **14** | Razorpay | Replace simulated payment | Orders |

---

## 12. Open Decisions

The following questions are not answered by the existing codebase and require a decision before implementation:

| # | Question | Options | Recommendation |
|---|---|---|---|
| **1** | **LLM provider for chatbot** | OpenAI GPT-4o-mini vs Google Gemini Flash | Either works. Gemini if you already have a Google account/key; OpenAI for wider documentation |
| **2** | **Photo upload flow** | All 5 in one multipart request vs 5 separate POSTs | 5 separate POSTs (matches DATA-FLOW.md plan and allows per-angle progress UI) |
| **3** | **Analysis processing** | Sync (wait for ML) vs Async (job queue + polling) | Async + polling (matches plan, better UX, ML calls can be slow) |
| **4** | **Subscription payment** | Simulate only vs Razorpay integration | Simulate for Phase 1, Razorpay for Phase 2 |
| **5** | **Admin auth** | Same JWT with `role=ADMIN` field vs completely separate token | Same JWT with role field — simpler, no CORS complexity |
| **6** | **Email notifications** | Resend vs SendGrid vs Nodemailer | Resend (simplest API, free tier generous) |
| **7** | **Chat history persistence** | Session only (in-memory/Redux) vs persist to DB | Session only for Phase 1 (plan confirms this); DB for Phase 2 |
| **8** | **Redis requirement** | Use Redis vs store quota in PostgreSQL | PostgreSQL for Phase 1 (simpler setup); Redis for production scale |
| **9** | **Product images** | Keep affiliate links (`whereToBuy`) as-is vs Cloudinary hosted | Keep affiliate links for now; Cloudinary for custom product photos |
| **10** | **VIT model** | Use existing Random Forest ML service vs add Vision Transformer | Use Random Forest for Phase 1; VIT is Phase 2+ (already in IMPLEMENTATION_ROADMAP.md) |

---

*This report was generated through static analysis of the GlowGuide frontend codebase, plan documents, and project context files. No changes were made to any source files.*
