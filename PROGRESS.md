# GlowGuide — Progress Tracker

## ✅ Completed

### ML Service (Python FastAPI)
- [x] `requirements.txt` — fastapi, uvicorn, scikit-learn, numpy, joblib, pandas
- [x] `train.py` — RandomForestClassifier on all 24 CSV features, saves `model.pkl` + `label_encoder.pkl`
- [x] `main.py` — FastAPI server, 7 quiz answers → derives 17 features → 24 total → prediction + NLP text processing
- [x] `Dockerfile` — Multi-stage build (Stage 1: train, Stage 2: serve)

### Frontend (Next.js 14 App Router)
- [x] `src/data/quizData.ts` — 7 questions with variable options (5–7), emoji badges, importance tiers, sublabels, helpText
- [x] Quiz UI — SkinQuiz component fully built with option selection, free-text toggle, results display
- [x] Live Photo Capture — 5-angle guided camera flow with face alignment overlay, review mode, demo fallback
- [x] Analysis Processing — Progress animation during ML prediction
- [x] Analysis Results — Skin type display, confidence meter, health score, concerns, routine, probabilities
- [x] Analysis History — Timeline with detail views
- [x] Health Trend Charts — Health score tracking over time with Recharts

### Authentication & Authorization
- [x] Firebase Auth — Email/Password + Google Sign-In
- [x] `useAuthStore` (Zustand) — Auth state management with `onAuthStateChanged` listener
- [x] Server-side — Firebase Admin SDK initialization (`src/lib/firebase-admin.ts`)
- [x] Session cookies — `POST /api/auth/session` creates HTTP-only cookie, `DELETE` clears it
- [x] Middleware — `src/middleware.ts` protects `/dashboard`, `/analysis`, `/cart`, `/checkout`, `/wishlist`, `/complete-profile`, `/admin`
- [x] AuthGuard component — Role-based guard for Customer vs Admin routes
- [x] Customer creation — `POST /api/auth/customer` creates Firestore document on sign-up
- [x] Complete Profile flow — Post-registration collection of phone, address, skin profile

### API Route Handlers (Next.js Route Handlers in `src/app/api/`)
- [x] `api/auth/session` — Create/clear session cookie
- [x] `api/auth/me` — Get current customer by token
- [x] `api/auth/customer` — Create customer document
- [x] `api/health` — Health check
- [x] `api/wake` — Wake-up endpoint
- [x] `api/skin-analysis` — End-to-end analysis: validates auth → checks tier limit → calls ML service (with fallback) → persists to Firestore
- [x] `api/analysis` — List analysis history (paginated)
- [x] `api/analysis/[id]` — Get single analysis detail
- [x] `api/products` — List products with filters, sort, search
- [x] `api/products/[id]` — Get single product
- [x] `api/orders` — List customer orders
- [x] `api/orders/create-order` — Create Razorpay order
- [x] `api/orders/verify` — Verify Razorpay payment
- [x] `api/subscriptions/create-order` — Create subscription order
- [x] `api/subscriptions/verify` — Verify subscription payment
- [x] `api/admin/stats` — Admin dashboard statistics
- [x] `api/admin/orders` — Admin order list
- [x] `api/admin/orders/[id]` — Admin order detail/update (GET/PATCH)

### E-Commerce
- [x] Shop — Product listing with category cards, filters (category, price, skin type, brand, rating, discount, stock), sort, search
- [x] Product Detail — Full product page with images, key benefits, ingredients, how-to-use, reviews
- [x] Cart — localStorage-persisted Zustand store, add/remove/update quantity, promo codes (5 codes), subscription discount (5% for PAID tier), GST calculation
- [x] Wishlist — localStorage-persisted Zustand store
- [x] Checkout — Shipping address form, order summary, promo code application
- [x] Razorpay — Payment integration for both products and subscriptions
- [x] Order History — Customer order list in Dashboard
- [x] Stock Management — Auto-decrement on payment verification

### Admin Panel
- [x] Admin Login — Separate `/admin/login` route
- [x] Admin Dashboard — Stats overview (revenue, orders, customers, analyses)
- [x] Product Management — CRUD (list, create, edit) with Cloudinary image upload
- [x] Order Management — Full order list with status updates
- [x] Ingredient Glossary — Searchable glossary with detail cards
- [x] Skin Content Management — Educational skin type content

### Dashboard
- [x] Latest analysis result
- [x] Skin Health Score
- [x] Analysis history timeline
- [x] Routine tracker (morning/night)
- [x] Auto-tracked purchased products
- [x] Order history
- [x] Account settings

### Chatbot
- [x] Floating bubble widget (site-wide)
- [x] Desktop: sidebar panel / Mobile: full-screen overlay
- [x] Local keyword-matching engine (`chatbotData.ts`)
- [x] Quota enforcement: free tier 10 queries/day, paid unlimited
- [x] Answers about products, skin concerns, ingredients, app usage

### Data & State Management
- [x] Zustand stores (6): auth, cart, wishlist, theme, chatbot, analysis
- [x] All stores persisted via Zustand `persist` middleware (except chatbot and analysis)
- [x] Firestore models (6): customer, product, order, payment, analysis, subscription
- [x] Zod schemas for all models
- [x] TanStack React Query for server state

### Design System
- [x] Eucalyptus Sage color palette + Terracotta Clay accents
- [x] Typography: Playfair Display (headings) + Inter (body)
- [x] 40+ shadcn/ui components (Radix primitives + Tailwind)
- [x] Framer Motion animations
- [x] Responsive layouts (mobile/desktop)
- [x] Light/dark theme support

### Architecture Decisions
- [x] ADR 0001 — Frontend architecture decisions
- [x] ADR 0002 — Firebase Auth and Firestore
- [x] ADR 0003 — Product data architecture
- [x] ADR 0004 — Order snapshot strategy
- [x] ADR 0005 — Stock decrement timing
- [x] ARCHITECTURE.md — Comprehensive system architecture document
- [x] CONTEXT.md — Domain vocabulary (Customer, Guest, Skin Analysis, etc.)

---

## 🔄 In Progress

### ML Service
- [ ] `docker build -t glowguide-ml .` — build and test locally
- [ ] `docker run -p 8000:8000 glowguide-ml` — verify `/` and `/predict` endpoints

### Deployment
- [ ] Deploy ML Service → Render (Docker)
- [ ] Deploy Frontend → Vercel
- [ ] Set environment variables on each platform
- [ ] UptimeRobot setup → ping every 5 min to prevent Render free tier sleep

---

## ⬜ Upcoming

### Step 1 — ML Service Docker Test
```bash
cd ML-Service
docker build -t glowguide-ml .
docker run -p 8000:8000 glowguide-ml
# Test: curl http://localhost:8000/
```

### Step 2 — Wire Analysis Flow End-to-End
- [ ] Verify frontend analysis page calls `POST /api/skin-analysis`
- [ ] Test ML service integration (quiz → ML → results display)
- [ ] Verify fallback classifier works when ML service is down
- [ ] Add loading animation during prediction (DNA helix)

### Step 3 — Production Polish
- [ ] Compress skin type images (WebP, 2.3–2.4 MB each currently)
- [ ] Confidence meter animation in results
- [ ] Probability bars for all skin types
- [ ] Code-split heavy pages (admin, dashboard) via Next.js dynamic imports
- [ ] Run `npx update-browserslist-db@latest`

### Step 4 — Deploy
- [ ] ML Service → Render (Docker)
- [ ] Frontend → Vercel
- [ ] Configure environment variables
- [ ] UptimeRobot keep-alive (prevents Render free tier sleep)

---

## 📁 File Structure (current)

```
GlowGuide/
├── ML-Service/
│   ├── data/
│   │   └── ultimate_skin_type_dataset.csv
│   ├── model/                      (generated after docker build)
│   │   ├── model.pkl
│   │   └── label_encoder.pkl
│   ├── train.py                    ✅
│   ├── main.py                     ✅
│   ├── requirements.txt            ✅
│   └── Dockerfile                  ✅
├── src/
│   ├── app/
│   │   ├── (marketing)/            Public pages (home, shop, about, login, etc.)
│   │   ├── (dashboard)/            Protected pages (dashboard, analysis, cart, checkout, etc.)
│   │   ├── (admin)/                Admin pages (products, orders, ingredients, etc.)
│   │   └── api/                    Route Handlers (auth, analysis, products, orders, subs, admin)
│   ├── components/
│   │   ├── ui/                     40+ shadcn/ui primitives
│   │   ├── layout/                 Navbar, Footer, ThemeToggle
│   │   ├── analysis/               LivePhotoCapture, AnalysisResults, AnalysisProcessing, etc.
│   │   ├── shop/                   ProductCard, ProductGrid, ProductFilters, ProductSort
│   │   ├── chatbot/                ChatbotWidget, ChatMessage, ChatInput, ChatHeader
│   │   ├── admin/                  AdminLayout, AdminSidebar, AdminStatsCard
│   │   └── orders/                 OrderHistoryList
│   ├── data/                       quizData, analysisHistory, chatbotData, skinTypes
│   ├── hooks/                      use-toast, use-mobile
│   ├── lib/                        firebase, firebase-admin, auth, cloudinary, razorpay, schemas, models
│   ├── store/                      Zustand stores (auth, cart, wishlist, theme, chatbot, analysis)
│   └── types/                      customer, product, analysis, ingredient
├── docs/
│   ├── adr/                        Architecture Decision Records (5)
│   ├── ARCHITECTURE.md             Full system architecture
│   ├── implementation-plan.md      Implementation plan
│   └── ...                         Other docs
├── plan/
│   └── frontend_plan/              Design system, routes, components, data flow
├── scripts/                        seed-products, check-products, create-admin
├── CONTEXT.md                      Domain vocabulary
├── IMPLEMENTATION_ROADMAP.md       Original implementation guide
└── PROGRESS.md                     This file
```

---

## 🔑 Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | Server components, Route Handlers replace separate backend |
| ML Model | RandomForestClassifier (200 trees) | Best accuracy on tabular skin data |
| Features | All 24 CSV features | More data = better accuracy |
| Quiz → Model | 7 quiz answers, 17 derived | User fills 7, rest calculated from correlations |
| Free text | NLP keyword matching | Adjusts feature values before prediction |
| Auth | Firebase Auth + session cookies | Managed auth, no custom backend needed |
| Database | Firestore | Real-time, scales to zero, fits Firebase ecosystem |
| Payments | Razorpay | Indian market focus, lower fees than Stripe |
| Images | Cloudinary | Built-in transformations, CDN, generous free tier |
| State (client) | Zustand | Lightweight, middleware support, no boilerplate |
| State (server) | TanStack React Query | Caching, refetching, optimistic updates |
| Design | Tailwind CSS + shadcn/ui | Rapid prototyping, consistent primitives |
| Deployment | Render (ML) + Vercel (Frontend) | Free tier available, Docker support |
| Keep-alive | UptimeRobot ping every 5 min | Prevents Render free tier sleep |

---

## 🌐 Deployment URLs (fill after deploy)

| Service | URL |
|---|---|
| ML Service | `https://________________.onrender.com` |
| Frontend | `https://________________.vercel.app` |
