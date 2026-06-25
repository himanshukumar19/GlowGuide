# GlowGuide Frontend — Production Implementation Plan

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 7 |
| Routing | react-router-dom v6 |
| Styling | TailwindCSS 3.4 + class-variance-authority |
| Client State | Zustand + zustand/middleware (persist) |
| Server State | @tanstack/react-query |
| Animations | framer-motion |
| Forms | react-hook-form + zod + @hookform/resolvers |
| UI Library | shadcn/ui (Radix primitives) |
| Icons | lucide-react |
| Charts | recharts |
| State Persist | zustand/middleware |
| Carousel | embla-carousel-react |
| Toasts | sonner |
| Date | date-fns |

## 2. Color System

```css
/* Light Mode Only */
--background: #FBF7F4        /* Warm cream */
--foreground: #2D2D2D        /* Soft black */
--primary: #BA94D1           /* Muted lavender */
--primary-foreground: #FFFFFF
--secondary: #E8A0BF         /* Soft rose */
--secondary-foreground: #FFFFFF
--accent: #D4B5E8            /* Light lavender */
--accent-foreground: #2D2D2D
--muted: #F5F0EB             /* Light taupe */
--muted-foreground: #7A7A7A
--success: #7EC8A0           /* Sage green for health scores */
--warning: #F5B041           /* Warm amber for upgrade nudges */
--destructive: #E57373       /* Soft red for errors */
--border: #E8E0D8
--card: #FFFFFF
--radius: 1rem               /* Rounded corners like Nykaa */
```

Gradients (`gradient-primary`): `bg-gradient-to-r from-primary to-secondary` used for hero sections, featured cards, and CTAs.

## 3. Typography

- **Headings:** `Playfair Display` (Georgia, serif fallback) — elegant, editorial feel
- **Body:** `Inter` (system-ui, sans-serif) — clean, readable
- **Text scale:** `xs` (0.75rem) through `6xl` (3.75rem)
- **Line height:** headings `1.2`, body `1.6`

## 4. Design Principles

1. **Soft shadows** (`shadow-soft`, `shadow-card`, `shadow-hover`) — Nykaa-inspired depth
2. **Hover lift** (translateY(-2px) + shadow increase) on cards and products
3. **Gradient backgrounds** on hero sections and featured CTAs
4. **Ample whitespace** — 2rem container padding, 6rem section padding
5. **Consistent border radius** — `rounded-xl` (0.75rem) for cards, `rounded-2xl` (1rem) for feature containers
6. **Subtle transitions** — 0.3s ease-out on all interactive elements
7. **No dark mode** — light mode only for initial production launch

## 5. Page Architecture

### Public Pages (accessible to Guests)

| Route | Page | Purpose |
|---|---|---|
| `/` | Homepage | Hero, features, skin types preview, quiz CTA |
| `/about` | About Skincare | Educational content about skincare importance |
| `/skin-types` | Skin Types Overview | All 5 skin types with cards |
| `/skin-types/:type` | Skin Type Detail | Individual skin type guide |
| `/shop` | Shop | Product catalog with filters, sort, search |
| `/product/:id` | Product Detail | Single product view with images, description, ingredients |
| `/pricing` | Pricing | Subscription plan comparison |
| `/ingredients` | Ingredients Glossary | Searchable A-Z of ingredients with dropdown detail cards |
| `/login` | Login | Customer authentication |
| `/signup` | Signup | Customer registration |

### Protected Pages (Customer only)

| Route | Page | Purpose |
|---|---|---|
| `/dashboard` | Dashboard | Latest analysis, health score, history, routine, account settings |
| `/analysis` | Skin Analysis Flow | Quiz → Photo Capture → Processing → Results |
| `/analysis/results/:id` | Analysis Results | Single analysis result display with recommendations |
| `/cart` | Cart | Shopping cart (requires auth to add) |
| `/checkout` | Checkout | Order checkout |
| `/wishlist` | Wishlist | Saved products |

### Admin Panel (separate subdomain/route, e.g., `/admin` or `admin.glowguide.app`)

| Route | Page | Purpose |
|---|---|---|
| `/admin` | Admin Dashboard | Overview stats |
| `/admin/products` | Manage Products | CRUD products |
| `/admin/orders` | Manage Orders | View/fulfill customer orders |
| `/admin/skin-content` | Manage Content | Edit info pages, skin type guides, concerns, ingredients |

## 6. Authentication Boundary

| Feature | Guest | Customer (Free) | Customer (Paid) |
|---|---|---|---|
| Homepage, About, Skin Types | ✅ | ✅ | ✅ |
| Ingredients Glossary | ✅ | ✅ | ✅ |
| Shop — browse/search | ✅ | ✅ | ✅ |
| Shop — add to cart / buy | ❌ | ✅ | ✅ |
| Skin Analysis | ❌ | ✅ (3 max) | ✅ (unlimited) |
| Analysis History | ❌ | Last 3 visible | 12 months visible |
| Product Recommendations | ❌ | ✅ (personalized) | ✅ (personalized) |
| Chatbot | ❌ | ✅ (10 queries/day) | ✅ (unlimited) |
| Dashboard | ❌ | ✅ (full) | ✅ (full) |
| 5% discount on all products | ❌ | ❌ | ✅ |

## 7. Skin Analysis Flow

1. **Entry point:** Guest clicks "Start Skin Analysis" → redirected to `/login` → after auth, redirected to `/analysis`
2. **Step 1 — Quiz:** Mandatory 7-question form (lifestyle, habits, concerns, skin notes). Submit button advances to photo capture.
3. **Step 2 — Live Photo Capture:** 5 photos in sequence:
   - Angle 1: Left profile (extreme side)
   - Angle 2: Right profile (extreme side)
   - Angle 3: Front-facing
   - Angle 4: Tilted ~120° (left)
   - Angle 5: Tilted ~120° (right)
   - On-screen face guide overlay shows positioning for each angle
   - Camera permission requested on first use
   - User can retake individual photos before proceeding
4. **Step 3 — Analysis Processing:** Progress animation screen. Backend sends quiz data + images to VIT model. Frontend polls or waits for WebSocket response.
5. **Step 4 — Results:** Single combined page showing:
   - **Skin Type** (Oily/Dry/Combination/Sensitive/Normal)
   - **Detected Concerns** with confidence percentages
   - **Skin Health Score** (0–100)
   - **Routine Recommendations** (morning/night)
   - **Product Recommendations** (personalized, from Recommendation engine)

## 8. Subscription & Upgrade UX

- **Pricing page** (`/pricing`) shows two tiers: Free vs Paid with feature comparison
- **Upgrade Nudge** — visible upgrade banner/button in Dashboard header for free users
- **Soft paywall** — when free user hits 3-analysis limit, show a non-blocking modal: "You've completed 3 analyses. Subscribe to continue tracking your skin health." with option to subscribe or dismiss
- **5% discount** — subscriber badge shown on product prices, checkout applies extra 5% off automatically

## 9. Chatbot Implementation

- **Trigger:** Floating bubble button fixed bottom-right on all pages
- **Desktop (≥1024px):** Slides in from right as a sidebar overlay (400px wide)
- **Mobile (<1024px):** Opens as full-screen overlay (fade in from bottom)
- **Free tier:** Counter of remaining daily queries shown in header
- **Paid tier:** Shows "Unlimited" badge
- **Scope:** Queries about products, ingredients, skin concerns, routine advice, app features
- **State:** Chat history persists per session (not persisted to backend in initial version)

## 10. Admin Panel

- **Layout:** Entirely separate from main site. Different sidebar navigation, compact tables, admin-specific header
- **Auth:** Admin-specific login (`/admin/login`), separate from Customer auth. JWT-based with admin role check
- **Products CRUD:** Name, description, price, images, category, skin types, ingredients, stock, badges, ratings
- **Orders Management:** Table of all orders with status filter, fulfillment workflow
- **Skin Content Management:** WYSIWYG editor for info pages, skin type guides, concerns, ingredients glossary

## 11. API Endpoints (Frontend expects, backend must provide)

```
POST   /api/auth/login               — Customer login
POST   /api/auth/signup              — Customer registration
POST   /api/auth/admin/login         — Admin login
POST   /api/auth/refresh             — Token refresh
GET    /api/auth/me                  — Current user profile
PATCH  /api/auth/me                  — Update profile (email, phone, password)

POST   /api/analysis                 — Submit quiz answers
POST   /api/analysis/:id/photos      — Upload 5 photos for an analysis
GET    /api/analysis/:id             — Get single analysis result
GET    /api/analysis                 — List analysis history (paginated)

GET    /api/recommendations          — Get personalized product recommendations

GET    /api/products                 — List products (with filters, sort, search)
GET    /api/products/:id             — Product detail
GET    /api/categories               — Product categories
GET    /api/brands                   — Product brands

GET    /api/cart                     — Get cart
POST   /api/cart/add                 — Add to cart
DELETE /api/cart/remove              — Remove from cart

POST   /api/orders                   — Create order
GET    /api/orders                   — List customer orders
GET    /api/orders/:id               — Order detail

GET    /api/wishlist                 — Get wishlist
POST   /api/wishlist/add             — Add to wishlist
DELETE /api/wishlist/remove          — Remove from wishlist

GET    /api/subscription             — Get subscription status
POST   /api/subscription/create      — Create subscription
POST   /api/subscription/cancel      — Cancel subscription

POST   /api/chatbot/query            — Send chatbot query
GET    /api/chatbot/usage            — Get daily query count

GET    /api/ingredients              — Ingredients glossary

GET    /api/admin/stats              — Admin dashboard stats
GET    /api/admin/products           — Admin products list
POST   /api/admin/products           — Create product
PUT    /api/admin/products/:id       — Update product
DELETE /api/admin/products/:id       — Delete product
GET    /api/admin/orders             — Admin orders list
PATCH  /api/admin/orders/:id/status  — Update order status
GET    /api/admin/content            — Get content pages
PUT    /api/admin/content/:id        — Update content page

GET    /api/skin-content             — Public skin content pages
```

## 12. Data Types

```typescript
interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  subscriptionTier: 'free' | 'paid';
  subscriptionEndsAt?: string;
  createdAt: string;
}

interface SkinAnalysis {
  id: string;
  customerId: string;
  quizAnswers: QuizAnswer[];
  photoUrls: string[];
  result: AnalysisResult;
  createdAt: string;
}

interface QuizAnswer {
  questionId: number;
  answer: string | number;
}

interface AnalysisResult {
  skinType: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
  concerns: DetectedConcern[];
  healthScore: number;
  confidence: number;
  routine: RoutineRecommendation;
}

interface DetectedConcern {
  name: string;
  confidence: number;
  description: string;
}

interface RoutineRecommendation {
  morning: RoutineStep[];
  night: RoutineStep[];
}

interface RoutineStep {
  productType: string;
  description: string;
  suggestedProducts?: string[];
}

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  skinTypes: string[];
  ingredients: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  badges: string[];
  discount?: number;
  createdAt: string;
}

interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  total: number;
  discount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  createdAt: string;
}

interface CartItem {
  productId: string;
  quantity: number;
}

interface Ingredient {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  sideEffects: string[];
  suitableSkinTypes: string[];
}
```

## 13. Implementation Phases (SDLC)

### Phase 1 — Foundation (Week 1-2)
- [ ] Redesign color system to lavender/rose palette
- [ ] Update tailwind.config.ts with new theme
- [ ] Create global CSS variables and gradient utilities
- [ ] Create Login and Signup pages
- [ ] Create Auth context/provider
- [ ] Add protected route wrapper component
- [ ] Update Navbar with auth state (login/account buttons)
- [ ] Add Pricing page

### Phase 2 — Skin Analysis Core (Week 3-4)
- [ ] Build Quiz page with 7 questions (react-hook-form + zod)
- [ ] Build Live Photo Capture component (camera API, 5-angle sequence, face guide overlay)
- [ ] Build Analysis Processing animation screen
- [ ] Build Analysis Results page (skin type, concerns, health score, routine)
- [ ] Connect flow end-to-end: Quiz → Photos → Processing → Results

### Phase 3 — Dashboard (Week 5)
- [ ] Build Dashboard page with Overview section
- [ ] Build Analysis History timeline component
- [ ] Build Skin Health Score widget (recharts circle/sparkline)
- [ ] Build My Routine section (morning/night)
- [ ] Build Account Settings (profile, password, subscription)
- [ ] Build Upgrade Nudge component

### Phase 4 — Shop Enhancement (Week 6)
- [ ] Upgrade Shop page to production quality
- [ ] Enhance ProductFilters with all filter types (category, price, skin type, brand, rating, discount, stock)
- [ ] Enhance ProductSort (price, rating, discount, newest, bestseller)
- [ ] Improve ProductCard with hover states, badges, wishlist button
- [ ] Add search with debounce and clear button
- [ ] Add pagination or infinite scroll
- [ ] Build Product Detail page with image gallery, ingredients, reviews

### Phase 5 — Cart, Checkout, Orders (Week 7)
- [ ] Build Cart page with quantity controls, price summary
- [ ] Build Checkout page with address form, order summary
- [ ] Build Wishlist page
- [ ] Add subscription discount (5%) to checkout
- [ ] Build Order confirmation page

### Phase 6 — Chatbot (Week 7-8)
- [ ] Build ChatbotWidget component (floating bubble)
- [ ] Build ChatbotSidebar (desktop)
- [ ] Build ChatbotOverlay (mobile full-screen)
- [ ] Connect to chatbot API endpoint
- [ ] Add daily query counter for free users
- [ ] Persist chat session state

### Phase 7 — Information & Admin (Week 8-9)
- [ ] Build Ingredients Glossary page with search and dropdown detail cards
- [ ] Build/expand info pages (About, Skin Types, Concerns)
- [ ] Build Admin layout (separate from main site)
- [ ] Build Admin login page
- [ ] Build Admin Products CRUD
- [ ] Build Admin Orders management
- [ ] Build Admin Skin Content management (basic WYSIWYG)

### Phase 8 — Polish & Launch (Week 10)
- [ ] Responsive QA across mobile, tablet, desktop
- [ ] Animation polish (framer-motion on all page transitions)
- [ ] Loading skeletons everywhere
- [ ] Error boundaries on all major sections
- [ ] 404 page polish
- [ ] Final lint and typecheck
- [ ] Performance audit (Lighthouse)
- [ ] Build and deploy
