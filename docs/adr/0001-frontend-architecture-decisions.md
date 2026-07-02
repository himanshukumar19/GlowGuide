# 0001 — Frontend Architectural Decisions

## Context

GlowGuide is being rebuilt from a college project into a production-grade skincare platform. The frontend needs to support three distinct user types (Guest, Customer, Admin) with different navigation, gating, and layout requirements. The core feature — Skin Analysis — combines quiz and vision data into a single output, which is a non-obvious design choice.

## Decisions

### 1. Unified Skin Analysis — Quiz + Vision → Single Result

Instead of having separate quiz and photo analysis pages, the frontend treats both as sequential steps of a single "Skin Analysis" flow. The quiz is always step 1, photo capture is always step 2, and the backend combines both into one result object.

**Why:** A single unified result (skin type + concerns + health score + routine) is simpler for the user to understand and act on than two separate reports. It also forces the ML pipeline to cross-reference quiz signals with vision signals, improving accuracy.

**Rejected alternative:** Separate quiz-only vs. vision-only analyses with independent results. This would complicate the Dashboard, confuse users, and make product recommendations harder to combine.

### 2. Admin Panel as Separate Route under Same Domain

The admin panel lives under `/admin/*` within the same React app, with a completely different layout (sidebar nav, compact tables, admin-specific header) rather than being a separate subdomain or a separate app.

**Why:** Same-domain routes are simpler to deploy (one build, one domain, no CORS issues) and allow shared utilities (fetch client, types, UI primitives). The layout is swapped inside the router, so the codebase stays a monorepo with one frontend.

**Rejected alternatives:**
- Separate subdomain (`admin.glowguide.app`): More complex deployment, separate CI/CD, separate auth cookies. Worth it only if the app grows to enterprise scale with a dedicated admin team.
- Separate repo/app: Unnecessary overhead for a team that may be a single developer.

### 3. Authentication Model — Three-Tier Gating

The frontend enforces auth gating at the route level (via `AuthGuard` wrapper) and at the feature level (via `AuthContext` subscription tier):

- **Guest**: Public routes only (homepage, info pages, shop browse, ingredients, pricing, login/signup)
- **Customer**: All public routes + dashboard, analysis, cart, checkout, wishlist, recommendations, chatbot
- **Admin**: All customer routes (for testing) + `/admin/*` routes

Subscription tier (`free` vs `paid`) gates API-level access: the backend controls how many analyses and history items are returned, not the frontend.

**Why:** Route-level gating is secure (protected by backend JWT validation) and simple. Feature-level subscription gating is handled entirely by the API to prevent client-side manipulation.

### 4. Chatbot as Floating Bubble — Not a Route

The chatbot is rendered as a fixed-position floating bubble in the main Layout component, toggling a sidebar (desktop) or full-screen overlay (mobile). It is never a route.

**Why:** A chatbot is a utility, not a destination. Users expect it to overlay content, not replace it. A route would cause navigation state issues and make it impossible to chat while browsing products.

### 5. Subscription Data Preservation

All customer data (analyses, history, health scores) is preserved in the database regardless of subscription status. The API gates only what is returned — free users see last 3 analyses, paid users see 12 months. When a user resubscribes, their old data reappears.

**Why:** This builds trust. Users who let their subscription lapse can resume with their full history intact, reducing churn and encouraging re-subscription.
