# Phase 1 — Auth, Profile, Demo Accounts

**Date:** 2026-06-29  
**Depends on:** Firebase project created with Auth (Email/Password + Google) + Firestore (test mode)

---

## Overview

Wire Firebase SDK into the frontend, replace mock users in `useAuthStore`, add Google sign-in + account linking, build the Complete Your Profile screen, seed demo accounts, and deploy.

---

## Step 1 — Firebase Project Setup

### 1.1 Create Firebase project
- Create project `glowguide-prod` in Firebase Console
- Enable **Authentication** → Sign-in methods: Email/Password, Google
- Enable **Firestore** → Start in test mode (tighten rules later)
- Register web app → copy `firebaseConfig` object

### 1.2 Composite Indexes (create in Firebase Console)
- `analyses` collection: composite index on `customerId` ASC, `createdAt` DESC
- `orders` collection: composite index on `customerId` ASC, `createdAt` DESC

### 1.3 Demo Accounts (seed manually or via script)
| Email | Password | Role | Subscription |
|---|---|---|---|
| `demo.free@glowguide.app` | `demo123456` | CUSTOMER | FREE |
| `demo.paid@glowguide.app` | `demo123456` | CUSTOMER | PAID |
| `demo.admin@glowguide.app` | `demo123456` | ADMIN | FREE |

**Firestore `customers/` documents to create:**
```
customers/<FIREBASE_UID_1>:
  email: "demo.free@glowguide.app"
  displayName: "Demo Free"
  role: "CUSTOMER"
  subscriptionTier: "FREE"
  subscriptionExpiresAt: null
  photoURL: null
  phone: ""
  address: null (subcollection later)
  analysisCount: 0
  skinProfile: null
  createdAt: <server timestamp>
  updatedAt: <server timestamp>

customers/<FIREBASE_UID_2>:
  email: "demo.paid@glowguide.app"
  displayName: "Demo Paid"
  role: "CUSTOMER"
  subscriptionTier: "PAID"
  subscriptionExpiresAt: "2027-06-29T00:00:00Z"
  photoURL: null
  phone: ""
  address: null
  analysisCount: 0
  skinProfile: null
  createdAt: <server timestamp>
  updatedAt: <server timestamp>

customers/<FIREBASE_UID_3>:
  email: "demo.admin@glowguide.app"
  displayName: "Admin"
  role: "ADMIN"
  subscriptionTier: "FREE"
  subscriptionExpiresAt: null
  photoURL: null
  phone: ""
  address: null
  analysisCount: 0
  skinProfile: null
  createdAt: <server timestamp>
  updatedAt: <server timestamp>
```

### 1.4 Environment Variables

**Frontend** (`Frontend/.env`):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=glowguide-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=glowguide-prod
VITE_FIREBASE_STORAGE_BUCKET=glowguide-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**Backend** (`Backend/.env`):
```
FIREBASE_PROJECT_ID=glowguide-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@glowguide-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
The service account JSON is downloaded from Firebase Console → Project Settings → Service Accounts → Generate new private key.

---

## Step 2 — Frontend Firebase SDK

### 2.1 Install package
```bash
cd Frontend && npm install firebase
```

### 2.2 Create `Frontend/src/lib/firebase.ts`
```typescript
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
```

### 2.3 Rewrite `Frontend/src/store/useAuthStore.ts`

**Current behavior (remove):**
- Hardcoded `MOCK_USERS` array
- `login()` checks credentials against array
- `signup()` pushes to array
- `currentUser` is a mock object

**New behavior (implement):**
- Observable auth state via `onAuthStateChanged`
- `login(email, password)` — calls `signInWithEmailAndPassword`
- `signup(email, password)` — calls `createUserWithEmailAndPassword`, then writes `customers/{uid}` doc
- `loginWithGoogle()` — calls `signInWithPopup(googleProvider)`, handles account linking via `signInWithCredential` if email already exists
- `logout()` — calls `signOut`
- `currentUser: Customer | null` — read from Firestore `customers/{uid}` doc (stays in sync)
- `loading: boolean` — true while auth state is initializing
- On `onAuthStateChanged` → fetch Firestore customer doc → set `currentUser`
- **Free-tier Google sign-in note:** Google sign-in from the web does consume the free SMS quota, but Firebase Auth free tier includes enough. If `signInWithPopup` fails due to popup blockers, fallback to `signInWithRedirect`.

**Key behaviors from grilling session:**
- First-time Google sign-in → auto-create `customers/{uid}` via a Cloud Function OR via backend endpoint
- Google + Email/Password same email → Firebase auto-links
- State: `idle | loading | signed_in | signed_out`

### 2.4 Update `Frontend/src/pages/Login.tsx`
- Remove mock credential display
- Add Google sign-in button alongside email/password form
- Error display for wrong password, user not found, too many requests
- On success → redirect to `/dashboard` (or `/complete-profile` if first time)
- Link to `/signup`

### 2.5 Update `Frontend/src/pages/Signup.tsx`
- Remove mock credential display
- Add Google sign-in button
- On success → redirect to `/complete-profile` (not `/dashboard`)
- Password validation rules: min 6 chars (Firebase requirement)

### 2.6 Create `Frontend/src/pages/CompleteProfile.tsx`
**Purpose:** Collect phone, address, skin profile from Customer after first sign-in.
**Behavior:**
- Fields: Full Name, Phone, Address (multi-line), Skin type dropdown (Oily/Dry/Combination/Normal/Sensitive), Known concerns (multi-select)
- "Skip for now" button → sets `profileCompleted: false` in Firestore, redirects to Dashboard (re-prompt on next visit)
- "Save & Continue" button → writes to `customers/{uid}` doc (name, phone, address, skinProfile), sets `profileCompleted: true`, redirects to Dashboard
- Guard: if `profileCompleted === true`, redirect away
- **Edge:** No further grilling needed — we agreed on this single screen approach.

### 2.7 Guard `Frontend/src/pages/Dashboard.tsx`
- On mount, check `customer.profileCompleted`
- If `false` → redirect to `/complete-profile`
- (Current Dashboard mock content stays until later phases)

---

## Step 3 — Backend Firebase Admin SDK

### 3.1 Install package
```bash
cd Backend && npm install firebase-admin
```

### 3.2 Create `Backend/src/config/firebase-admin.ts`
```typescript
import admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export const auth = admin.auth()
export const db = admin.firestore()
export default admin
```

### 3.3 Create `Backend/src/middleware/requireAuth.ts`
```typescript
import { Request, Response, NextFunction } from 'express'
import { auth } from '../config/firebase-admin'

export interface AuthenticatedRequest extends Request {
  uid?: string
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' })
  }
  try {
    const token = header.split('Bearer ')[1]
    const decoded = await auth.verifyIdToken(token)
    req.uid = decoded.uid
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
```

### 3.4 Create `Backend/src/middleware/requireAdmin.ts`
```typescript
import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from './requireAuth'
import { db } from '../config/firebase-admin'

export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const doc = await db.collection('customers').doc(req.uid!).get()
    if (!doc.exists || doc.data()?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    next()
  } catch {
    return res.status(500).json({ error: 'Failed to verify role' })
  }
}
```

### 3.5 Add `POST /api/auth/customer` endpoint
**Purpose:** Create a `customers/{uid}` document after first-time Firebase sign-up.
**Called by:** Frontend after successful Firebase Auth signup (before either Google or Email/Password sign-up completes, the frontend determines if this is a first-time sign-up via `isNewUser` from `UserCredential.additionalUserInfo`).

**Backend (`Backend/src/routes/auth.ts`):**
- `POST /api/auth/customer`
- Requires Bearer token
- Request body: `{ displayName: string, email: string, photoURL?: string }`
- Reads `customers/{uid}` — if exists, return 200 (idempotent)
- If not exists, creates doc with:
  ```
  email, displayName, photoURL, role: "CUSTOMER",
  subscriptionTier: "FREE", subscriptionExpiresAt: null,
  phone: "", address: null, analysisCount: 0,
  skinProfile: null, profileCompleted: false,
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp()
  ```
- Returns 201

---

## Step 4 — Existing File Updates

### 4.1 `Backend/src/server.ts`
- Add /api/auth routes
- Add requireAuth middleware test endpoint: `GET /api/auth/me`
- Update existing skin-analysis endpoint to use requireAuth

### 4.2 `Frontend/src/api/client.ts` (or equivalent)
- Add `Authorization: Bearer <token>` header to every API request
- Get token via `await currentUser.getIdToken()` from Firebase Auth

---

## Step 5 — Testing

### Manual test plan
1. Open `/login` → Sign in with `demo.free@glowguide.app` / `demo123456`
2. Verify redirect to `/complete-profile` (profileCompleted = false)
3. Skip → Dashboard loads
4. Visit `/complete-profile` again → guard redirects away if already completed
5. Logout → Login with Google → Verify auto-create of customer doc
6. Signup new email → Verify redirect to `/complete-profile`
7. Admin: sign in `demo.admin@glowguide.app` → Verify role-based access

### Known edge cases
- **Popup blocked by browser** → fallback to `signInWithRedirect`
- **Firebase Admin SDK initialization** — Render free tier has ephemeral filesystem; the service account JSON must be env vars, not a file path
- **Token refresh** — Firebase SDK handles this automatically; no work needed

---

## Step 6 — Deployment

### Frontend → Vercel
```bash
cd Frontend
vercel --prod
```
Verify Firebase credentials work in production (ensure `.env.production` is set).

### Backend → Render
- Connect repo, set build command: `npm install && npm run build`
- Set start command: `npm start`
- Add all env vars from `step 1.4`
- Region: Oregon (us-west) — closest free tier to target users

---

## Files Changed Summary

| File | Action |
|---|---|
| `Frontend/.env` | Create |
| `Frontend/src/lib/firebase.ts` | Create |
| `Frontend/src/store/useAuthStore.ts` | Rewrite |
| `Frontend/src/pages/Login.tsx` | Update |
| `Frontend/src/pages/Signup.tsx` | Update |
| `Frontend/src/pages/CompleteProfile.tsx` | Create |
| `Frontend/src/pages/Dashboard.tsx` | Update (guard) |
| `Backend/.env` | Create |
| `Backend/src/config/firebase-admin.ts` | Create |
| `Backend/src/middleware/requireAuth.ts` | Create |
| `Backend/src/middleware/requireAdmin.ts` | Create |
| `Backend/src/routes/auth.ts` | Create |
| `Backend/src/server.ts` | Update |
| `docs/adr/0002-firebase-auth-and-firestore.md` | Done |

---

## Open Questions for Later
- **Cloud Function for auto-creating customer doc?** Can avoid by using backend endpoint (simpler). Revisit if Firebase Auth usage grows significantly.
- **Firestore security rules?** Should lock down in Phase 2. For now, test mode is fine.
- **Rate limiting on /api/auth/customer?** Add in Phase 2 if spam becomes an issue.
