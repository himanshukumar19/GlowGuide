# GlowGuide Frontend — Health Audit Report

> **Date**: 2026-06-28  
> **Scope**: Full `Frontend/src/` codebase — build, lint, architecture, state management, design, routing

---

## ⚡ TL;DR Verdict

| Check | Status |
|---|---|
| **Build** | ✅ Clean — 0 TypeScript compile errors, builds in 4.3s |
| **Tests** | ✅ 1/1 passing |
| **Lint** | ⚠️ 8 errors, 8 warnings — none are runtime-breaking |
| **Routing** | ✅ All routes wired correctly |
| **State management** | ✅ Migrated from Context API → Zustand correctly |
| **Design system** | ✅ Eucalyptus Sage palette live — matches `design_system.md` |
| **Bundle size** | ⚠️ JS chunk 1.32 MB (gzip: 382 KB) — needs code splitting |
| **Chatbot** | ✅ Fully wired — keyword-matching local engine |
| **Admin panel** | ✅ All 8 pages present and routed |
| **Critical bugs** | 🔴 1 — `getSubscriptionDiscount` defined but excluded from `CartState` interface (silent failure) |

---

## ✅ Build Output

```
vite v7.3.1 ✓ 2846 modules transformed
Built in 4.30s — zero TypeScript errors
```

**Image weight concern** (not a bug, but worth noting):
- `skin-dry.png`, `skin-oily.png`, etc. are each **2.3–2.4 MB** uncompressed
- `hero-background.png` is **1.98 MB**
- These should be compressed or converted to WebP before production

---

## 🔴 Critical Bug — `getSubscriptionDiscount` Type Gap

**File**: `src/store/useCartStore.ts` lines 84–88

The function `getSubscriptionDiscount()` is implemented in the store body and called
by `getCartTotal()`, `CartPage.tsx`, and `CheckoutPage.tsx` — but it is **NOT declared
in the `CartState` interface**.

**Effect**:
1. TypeScript can't catch mistakes with this function
2. Any refactor that removes or renames it won't be caught by the compiler
3. If it ever disappears, the app silently breaks at runtime

**Fix**: Add `getSubscriptionDiscount: () => number;` to the `CartState` interface.

---

## ⚠️ Lint Errors (8 errors, 8 warnings — non-blocking)

| # | File | Issue |
|---|---|---|
| 1 | `AnalysisResults.tsx:125` | `Unexpected any` in catch |
| 2 | `LivePhotoCapture.tsx:225` | `Unexpected any` cast |
| 3 | `LivePhotoCapture.tsx:76` | `useEffect` missing `startCamera` dep (stale closure risk) |
| 4 | `ui/command.tsx:24` | Empty interface |
| 5 | `ui/textarea.tsx:5` | Empty interface |
| 6 | `Login.tsx:22` | `location.state as any` |
| 7 | `SkinQuiz.tsx:124` | `err: any` in catch |
| 8 | `admin/AdminProductForm.tsx:124` | `Unexpected any` |
| 9 | `tailwind.config.ts:119` | `require()` style import forbidden |

Most impactful: item 3 — missing `startCamera` dep could cause stale closure bugs
where the camera fails to restart after permission is re-granted.

---

## ⚠️ Bundle Size Warning

```
dist/assets/index.js  1,323.76 kB (gzip: 381.92 kB) — exceeds 500 kB threshold
```

Everything is in one chunk. Fix: lazy-load heavy pages in App.tsx:

```typescript
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const SkinQuiz = lazy(() => import("./pages/SkinQuiz"));
```

Wrap routes in `<Suspense fallback={<LoadingSkeleton />}>`. This should cut
initial bundle to ~400–500 KB.

---

## ✅ Architecture — What's Working Well

### State Management (Context → Zustand — fully migrated)

| Store | File | Persisted |
|---|---|---|
| `useAuthStore` | `store/useAuthStore.ts` | ✅ localStorage |
| `useCartStore` | `store/useCartStore.ts` | ✅ localStorage |
| `useWishlistStore` | `store/useWishlistStore.ts` | ✅ localStorage |
| `useChatbotStore` | `store/useChatbotStore.ts` | ❌ Session only (correct per plan) |
| `useAnalysisStore` | `store/useAnalysisStore.ts` | ❌ Transient (correct) |
| `useThemeStore` | `store/useThemeStore.ts` | ✅ localStorage |

No stale `@/context/` imports remain anywhere — migration is complete.

### Routing (all routes from plan/ROUTES.md correctly implemented)

Public routes: `/`, `/about`, `/skin-types`, `/skin-types/:type`, `/shop`,
  `/product/:id`, `/login`, `/signup`, `/pricing`, `/ingredients`

Protected routes: `/quiz`, `/analysis`, `/analysis/results/:id`, `/dashboard`,
  `/cart`, `/wishlist`, `/checkout`

Admin routes: `/admin/login`, `/admin`, `/admin/products`, `/admin/products/new`,
  `/admin/products/:id/edit`, `/admin/orders`, `/admin/orders/:id`,
  `/admin/skin-content`, `/admin/ingredients`

Note: Both `/quiz` and `/analysis` map to `SkinQuiz` — correct backward-compat alias.

### Admin Guard
AuthGuard.tsx checks `requireAdmin` via `customer.email === "admin@glowguide.com"`.
This is a mock-auth workaround — must be replaced with a `role` field check once
the real backend is connected.

### Chatbot
Fully functional:
- Local keyword-matching engine (chatbotData.ts, 9 KB)
- Quota enforcement: free tier 10/day, paid unlimited
- ChatbotWidget renders globally in Layout.tsx
- Desktop sidebar / mobile full-screen overlay as per plan spec

### Design System
index.css correctly implements the Eucalyptus Sage + Terracotta Clay palette:

| Token | Value | Correct |
|---|---|---|
| `--primary` | `154 24% 28%` (#355245 Eucalyptus Sage) | ✅ |
| `--secondary` | `16 38% 38%` (#854438 Terracotta Clay) | ✅ |
| `--background` | `140 8% 97.5%` (#F7F9F8 Sage Linen) | ✅ |
| `font-heading` | Playfair Display | ✅ |
| `font-sans` | Inter | ✅ |
| Gradients | 6 variants defined | ✅ |
| Shadows | 6 elevations defined | ✅ |
| Border radius | `--radius: 1.0rem` | ✅ |

---

## ⚠️ Minor Issues

1. **Dead `src/context/` folder** — `AuthContext.tsx`, `CartContext.tsx`,
   `WishlistContext.tsx`, `ThemeContext.tsx` all exist on disk but nothing imports
   them. Should be deleted to avoid confusion.

2. **Large image assets** — Skin type hero images are 2.3–2.4 MB each.
   Convert to WebP and add `loading="lazy"` before production.

3. **Browserslist data is 12 months old** — Run:
   `npx update-browserslist-db@latest`

---

## 📋 Prioritised Fix List

| Priority | Fix | File | Effort |
|---|---|---|---|
| 🔴 P1 | Add `getSubscriptionDiscount` to `CartState` interface | `useCartStore.ts` | 2 min |
| 🔴 P1 | Fix `useEffect` missing `startCamera` dep | `LivePhotoCapture.tsx:76` | 5 min |
| 🟡 P2 | Fix `err: any` → `unknown` + type guard in catch blocks | `SkinQuiz.tsx`, `AnalysisResults.tsx` | 10 min |
| 🟡 P2 | Fix empty interfaces in `ui/command.tsx`, `ui/textarea.tsx` | shadcn UI files | 2 min |
| 🟡 P2 | Add lazy loading for admin pages + dashboard | `App.tsx` | 30 min |
| 🟡 P2 | Delete dead `src/context/` folder | Repo cleanup | 1 min |
| 🟢 P3 | Compress/WebP skin type images | `public/assets` | 20 min |
| 🟢 P3 | Fix `tailwind.config.ts:119` require → import | `tailwind.config.ts` | 2 min |
| 🟢 P3 | Replace admin email-based guard with role-based check | `AuthGuard.tsx:35` | After backend |
| 🟢 P3 | Update browserslist-db | CLI | 1 min |

---

## 🎯 Summary

The frontend is **in good shape — no runtime-breaking issues**. Build is clean,
state management has been properly migrated to Zustand, all routes are correctly
wired including the full admin panel, the chatbot is functional, and the design
system accurately implements the Eucalyptus Sage palette.

Main items before connecting a real backend:
1. Fix the `CartState` interface gap (1 line)
2. Add lazy loading to cut the JS bundle from 1.3 MB to under 500 KB
3. Delete the dead `src/context/` files
