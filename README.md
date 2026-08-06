# GlowGuide — AI Skin Analysis Platform

A full-stack AI-powered skincare analysis, e-commerce, and education platform. Customers complete a lifestyle quiz and live photo capture (5 angles) analyzed by a Vision Transformer model to receive personalized skin diagnostics, product recommendations, and a routine tracker.

Built with **Next.js 14 App Router**, **Firebase Auth**, and a standalone **Python ML Service**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2 (App Router) + React 18.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 + shadcn/ui |
| State | Zustand + TanStack Query |
| Auth | Firebase Auth (Email/Password, Google) |
| Database | Firestore + Firebase Admin SDK |
| Image Hosting | Cloudinary |
| UI Motion | Framer Motion |
| Payments | Razorpay (test mode) |
| ML Service | Python FastAPI + Vision Transformer (separate service) |
| Deployment | Vercel (web), Render (ML Service) |

---

## Project Structure

```
GlowGuide/
├── src/
│   ├── app/
│   │   ├── (marketing)/       # Public pages (home, shop, about, ingredients, etc.)
│   │   │   ├── shop/
│   │   │   │   ├── page.tsx           # Shop listing with Filters, category support (?category=)
│   │   │   │   ├── ShopContent.tsx    # Client component with useSearchParams
│   │   │   │   └── [id]/page.tsx      # Product detail page
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── pricing/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── ingredients/page.tsx
│   │   │   ├── skin-types/...
│   │   │   └── page.tsx        # Home page (/) 
│   │   ├── (dashboard)/        # Authenticated pages (auth-guard wrapped)
│   │   │   ├── dashboard/page.tsx      # Customer dashboard
│   │   │   ├── analysis/page.tsx       # Skin analysis flow (quiz + photo + results)
│   │   │   ├── analysis/results/[id]/page.tsx  # Analysis history detail
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   ├── wishlist/page.tsx
│   │   │   └── complete-profile/page.tsx
│   │   ├── (admin)/            # Admin routes (separate layout + auth)
│   │   │   ├── admin/login/page.tsx
│   │   │   ├── admin/page.tsx          # Dashboard
│   │   │   ├── admin/products/
│   │   │   ├── admin/orders/
│   │   │   ├── admin/ingredients/
│   │   │   └── admin/skin-content/
│   │   ├── api/                # API routes (Next.js route handlers)
│   │   │   ├── auth/
│   │   │   │   ├── session/route.ts    # POST (create), DELETE (clear)
│   │   │   │   ├── me/route.ts         # GET customer by token
│   │   │   │   └── customer/route.ts   # POST create customer document
│   │   │   ├── skin-analysis/route.ts  # POST run analysis
│   │   │   ├── subscriptions/...
│   │   │   ├── health/route.ts
│   │   │   └── wake/route.ts
│   │   ├── layout.tsx          # Root layout (Providers wrapper)
│   │   ├── providers.tsx       # QueryClient, ThemeProvider, AuthInitializer
│   │   ├── not-found.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives (button, card, dialog, etc.)
│   │   ├── layout/             # Navbar, Footer, ThemeToggle
│   │   ├── shop/               # ProductCard, ProductGrid, ProductFilters, ProductSort
│   │   ├── analysis/           # AnalysisResults, AnalysisProcessing, LivePhotoCapture
│   │   ├── chatbot/            # ChatbotWidget, ChatMessage, ChatInput, ChatHeader
│   │   └── admin/              # AdminLayout, AdminSidebar, AdminStatsCard
│   ├── store/                  # Zustand stores
│   │   ├── useAuthStore.ts     # Auth state + login/signup/logout + initAuthListener
│   │   ├── useCartStore.ts     # Cart items, quantity, promo, pricing
│   │   ├── useWishlistStore.ts
│   │   ├── useChatbotStore.ts
│   │   ├── useAnalysisStore.ts
│   │   └── useThemeStore.ts
│   ├── lib/
│   │   ├── firebase.ts         # Client-side Firebase config
│   │   ├── firebase-admin.ts   # Server-side Firebase Admin SDK
│   │   ├── auth.ts             # verifyAuth helper for API routes
│   │   ├── cloudinary.ts       # Cloudinary SDK config + upload helpers
│   │   ├── models/customer.ts  # Firestore CRUD for customers
│   │   ├── schemas/customer.ts # Zod schema for Customer
│   │   └── validators.ts       # Generic Zod validation helper
│   ├── types/
│   │   ├── customer.ts         # Customer, SkinProfile, SubscriptionPlan
│   │   ├── product.ts          # Product, CartItem, Order, FilterState, SortOption
│   │   ├── analysis.ts         # SkinAnalysis, QuizAnswer, AnalysisResult
│   │   └── ingredient.ts       # Ingredient
│   ├── data/
│   │   ├── products.ts         # Product catalog (19 products)
│   │   ├── quizData.ts         # Quiz questions
│   │   ├── analysisHistory.ts  # Mock history data
│   │   └── chatbotData.ts      # Chatbot response data
│   ├── api/                    # Client-side API helpers
│   │   ├── client.ts           # Authenticated fetch wrapper
│   │   ├── auth.api.ts
│   │   └── subscription.api.ts
│   └── middleware.ts           # Route protection (session cookie check)
├── ML-Service/                 # Python + FastAPI + Vision Transformer
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── docs/                       # Architecture & design docs
├── public/                     # Static assets (fonts, images, icons)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

---

## Features

### For Customers
- **Skin Analysis** — 2-step: lifestyle quiz + 5-angle live photo capture → AI-powered skin diagnostics
- **Shop** — Browse 19 skincare products with multi-faceted filtering (category, price, brand, skin type, rating, discount, stock) + sorting
- **Cart** — Full cart with quantity controls, promo codes, GST (18%), shipping, subscription discount
- **Checkout** — 3-step: Shipping → Payment → Confirmation (Razorpay integration)
- **Wishlist** — Save products for later
- **Dashboard** — Skin Health Score (0–100), analysis history (3 free / 12 months paid), routine tracker, auto-tracked purchases, subscription toggle
- **My Routine** — Morning/Night routines with auto-tracked purchased products
- **Chatbot** — AI assistant for product/skincare queries (10/day free, unlimited paid)
- **Complete Profile** — Post-registration flow to collect phone, address, skin profile

### For Admins
- **Dashboard** — Sales stats, order/revenue charts, recent orders
- **Products** — CRUD management with mobile-responsive card view
- **Orders** — Status management with filtering
- **Ingredients** — Searchable glossary with detail cards
- **Skin Content** — Educational content management

### Auth & Subscriptions
- **Auth Providers** — Email/Password + Google (Firebase account linking)
- **Session Cookies** — HTTP-only cookie for middleware route protection
- **Free Tier** — 3 analysis limit, 10 chatbot queries/day
- **Paid Tier** — 12-month history, unlimited queries, 5% extra discount

---

## Local Development

### Prerequisites
- Node.js 18+
- npm
- Docker (for ML Service)

### 1. ML Service (standalone)

```bash
cd ML-Service
docker build -t glowguide-ml .
docker run -p 8000:8000 glowguide-ml
```

### 2. Web App

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase and Cloudinary credentials

# Run development server
npm run dev
```

Opens at **http://localhost:3000**

### Available Commands

```bash
npm run dev          # Start development server (Next.js)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npx tsc --noEmit     # TypeScript check
```

---

## Environment Variables

### `.env.local`

```
# Firebase Client (public — exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Admin (server-only)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Razorpay (test keys)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Cloudinary (public — exposed to browser)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...

# Cloudinary (server-only)
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Vercel Cron recovery job (server-only; set in Vercel Project Settings)
CRON_SECRET=...
```

Vercel Cron invokes `/api/analysis/reconcile` daily at 03:00 UTC using the schedule in `vercel.json`. The daily schedule is compatible with Vercel Hobby plans. When `CRON_SECRET` is configured, Vercel sends it as `Authorization: Bearer $CRON_SECRET`; the route rejects requests with a missing or invalid token. Set the same secret in the Vercel project environment for the Production deployment.

---

## Architecture

### Route Groups
- `(marketing)` — Public pages (Navbar + Footer + ChatbotWidget)
- `(dashboard)` — Authenticated pages (AuthGuard + Navbar + Footer + ChatbotWidget)
- `(admin)` — Admin pages (AuthGuard with `requireAdmin` + AdminLayout)

### Auth Flow
1. Customer signs in via Firebase Auth (Email/Google)
2. Client reads Firestore `customers/{uid}` doc
3. Client calls `POST /api/auth/session` with Firebase ID token
4. Server creates HTTP-only session cookie via Firebase Admin
5. Zustand store updates → redirect via `window.location.replace()`
6. Middleware checks session cookie on every request to protected routes
7. `initAuthListener` (via `onAuthStateChanged`) keeps client in sync

### Data Flow (Skin Analysis)
1. Customer completes 7-question quiz → stored in `useAnalysisStore`
2. Customer captures 5 facial photos via `LivePhotoCapture`
3. `POST /api/skin-analysis` sends quiz data + images to ML Service
4. ML Service returns predictions → backend stores result in Firestore
5. Results rendered via `AnalysisResults` component

### State Management
- **Auth** — Zustand + persist (localStorage) + `initAuthListener` (Firebase)
- **Cart** — Zustand + persist (localStorage)
- **Wishlist** — Zustand + persist (localStorage)
- **Theme** — Zustand + next-themes
- **Chatbot** — Zustand (transient)
- **Analysis** — Zustand (transient)
- **Server state** — TanStack Query

---

## Route Map

| Route | Access | Layout | Description |
|---|---|---|---|
| `/` | Public | Marketing | Home page |
| `/shop` | Public | Marketing | Product catalog with filtering |
| `/shop/[id]` | Public | Marketing | Product detail |
| `/login` | Public | Marketing | Email/Google sign-in |
| `/signup` | Public | Marketing | Registration |
| `/pricing` | Public | Marketing | Subscription plans |
| `/about` | Public | Marketing | About page |
| `/ingredients` | Public | Marketing | Ingredient glossary |
| `/skin-types` | Public | Marketing | Skin type education |
| `/dashboard` | Auth | Dashboard | Customer dashboard |
| `/analysis` | Auth | Dashboard | Skin analysis flow |
| `/analysis/results/[id]` | Auth | Dashboard | Past analysis detail |
| `/cart` | Auth | Dashboard | Shopping cart |
| `/checkout` | Auth | Dashboard | Checkout flow |
| `/wishlist` | Auth | Dashboard | Saved products |
| `/complete-profile` | Auth | Dashboard | Post-registration profile |
| `/admin/login` | Public | — | Admin sign-in |
| `/admin` | Admin | Admin | Admin dashboard |
| `/admin/products` | Admin | Admin | Product management |
| `/admin/orders` | Admin | Admin | Order management |

---

## Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | Unified full-stack React, SSR/SSG, route handlers |
| Auth | Firebase Auth + HTTP-only session cookies | Middleware-based route protection, Firebase handles identity |
| Database | Firestore | Real-time sync, integrates with Firebase Auth |
| Image Hosting | Cloudinary | CDN delivery, built-in transformations, unsigned uploads |
| State | Zustand | Lightweight, works outside React tree, persist middleware |
| UI Components | shadcn/ui | Maintainable, themeable, accessible primitives |
| Styling | Tailwind CSS 3.4 | Utility-first, consistent design tokens |
| ML | Separate FastAPI service | Independent scaling, GPU support, model versioning |
---