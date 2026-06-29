# ADR 0002: Firebase Auth + Firestore for Authentication and Data Storage

**Status:** Accepted  
**Date:** 2026-06-29  
**Supersedes:** Original plan of PostgreSQL + Prisma + JWT/argon2 (see BACKEND_ANALYSIS_REPORT.md v1)

## Context

The GlowGuide backend needs authentication (signup, login, Google sign-in) and persistent data storage (customers, analyses, products, orders, etc.). The original specification called for PostgreSQL via Prisma ORM with a hand-rolled JWT + argon2 auth layer.

Three concerns drove reconsideration:

1. **Free-tier viability** — PostgreSQL on Render (free tier) sleeps after inactivity. A managed DB adds operational overhead for a solo developer.
2. **Development velocity** — Firebase Auth eliminates password hashing, token refresh, email verification flows, and session management. Firebase Admin SDK provides server-side token verification in ~10 lines of code.
3. **Auth complexity** — Google sign-in, account linking, and password reset are non-trivial to implement securely from scratch. Firebase handles all of these.

## Decision

### Authentication
- Use **Firebase Authentication** as the sole auth provider
- Providers: Email/Password + Google Sign-In
- Firebase SDK runs on the frontend — signup, login, sign-out happen client-side
- Backend verifies Firebase ID Tokens via `firebase-admin` SDK
- No custom JWT issuance, no refresh token management, no password hashing
- Google and Email/Password accounts with the same email are linked to one Firebase UID

### Data Storage
- Use **Firestore (NoSQL)** for all persistent data
- 9 collections: `customers`, `analyses`, `products`, `orders`, `cart`, `wishlist`, `addresses`, `ingredients`, `promoCodes`, `skinContent`
- Relations handled via document references or denormalization (no JOINs)
- Cart and order items are stored as embedded arrays (not subcollections)
- Product details are snapshotted at purchase time inside the order document

### Admin Role
- Stored as a `role` field (`"CUSTOMER"` / `"ADMIN"`) in the `customers/{uid}` document
- Backend checks Firestore on every admin request (read cost acceptable for admin frequency)
- No custom Firebase Auth claims used

### Frontend Hosting
- **Vercel** (not Firebase Hosting) — existing `vercel.json` config, zero migration

## Consequences

### Positive
- Zero auth infrastructure to maintain (no password reset flows, no session management, no email verification setup)
- Account linking (Google ↔ Email/Password) handled by Firebase automatically
- Google sign-in adds ~20 lines of frontend code vs building OAuth from scratch
- Firestore's generous free tier (50K reads/day) covers expected scale for months
- Single vendor for auth + database simplifies debugging
- Admin role changes are instant (update Firestore doc, no token refresh needed)

### Negative
- Firestore charges per-document read — aggregation queries (admin dashboard stats) require maintaining counter documents
- No JOINs — some queries require multiple Firestore reads followed by client-side merging
- No native text search — product search requires either Firestore's limited `array-contains` or a third-party service like Algolia/Typesense
- Composite indexes must be created manually for sort + filter combinations
- Moving away from Firestore later (to PostgreSQL or another NoSQL) would require a data migration
- Render backend cold starts (5–15s after idle) may affect the skin analysis flow

### Mitigations
- Admin dashboard stats use a separate `adminStats` counter document updated on writes
- Product search will use Firestore filters for Phase 1 and integrate a search service only if needed
- Render cold start mitigation: frontend calls `/api/wake` on dashboard mount (already implemented)

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| PostgreSQL + Prisma + JWT | Higher operational cost, no free managed DB without sleep, more code to write for auth |
| Supabase (Auth + PostgreSQL) | Supabase free tier has 500MB DB, 2GB bandwidth — tighter than Firestore. Auth is less mature than Firebase |
| MongoDB Atlas + Firebase Auth | Two vendors, no benefit over Firestore for this data model |
| Firebase Authentication + PostgreSQL | Adds a second DB vendor without clear benefit. Firestore handles the relational-light model well |
