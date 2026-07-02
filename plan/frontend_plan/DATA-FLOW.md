# GlowGuide Data Flow

## 1. Customer Auth Flow

```
[Login Page] → POST /api/auth/login → [Backend] → Validate credentials
  → Success: Return JWT + Customer object → Store in AuthContext (state) + localStorage (token)
  → Redirect to: previous protected route or /dashboard
  → Failure: Show error message on login form

[Signup Page] → POST /api/auth/signup → [Backend] → Create customer
  → Success: Return JWT + Customer object → Store + redirect to /dashboard
  → Failure: Show validation errors

Token refresh: AuthContext interceptor refreshes token on 401
Logout: Clear token + redirect to /
```

## 2. Skin Analysis Flow

```
[Guest clicks "Start Skin Analysis"]
  → Redirect to /login (with return URL)
  → After login → redirect to /analysis

[Step 1: Quiz]
  → Customer fills 7-question form
  → Form state held in react-hook-form
  → On submit: validate with zod schema
  → Advance to Step 2 (no API call yet)

[Step 2: Live Photo Capture]
  → Request camera permission (navigator.mediaDevices.getUserMedia)
  → 5 angles in sequence with FaceGuideOverlay
  → Each photo: capture from stream → convert to blob → store in local state
  → After all 5 captured: show PhotoReview grid
  - User can retake any photo
  → On confirm: POST /api/analysis with quiz data → Backend creates analysis entry
  - Body: { quizAnswers, customerId }
  - Response: { analysisId }
  → Then for each photo: POST /api/analysis/:id/photos (multipart/form-data, one by one or batch)
  - Each photo sent with angle identifier (left-profile, right-profile, front, tilt-left, tilt-right)

[Step 3: Processing]
  → Frontend shows AnalysisProcessing animation
  → Backend coordinates:
    1. Receives quiz data + photos
    2. Sends to VIT model service
    3. VIT returns: skin type, concerns, confidence
    4. Backend combines quiz signals + VIT output → final result
    5. Stores result in database
  → Frontend polls GET /api/analysis/:id every 3 seconds or uses WebSocket
  → When status === 'completed', advance to Step 4

[Step 4: Results]
  → GET /api/analysis/:id → Full AnalysisResult
  → Display: SkinTypeBadge, ConcernChips, SkinHealthScore, RoutineTimeline
  → GET /api/recommendations → ProductRecommendations (separate from Shop)
```

## 3. Dashboard Data Flow

```
[Dashboard page loads]
  1. GET /api/analysis?limit=12 → Latest analyses (filtered by subscription tier)
  2. GET /api/auth/me → Customer profile
  3. GET /api/subscription → Current subscription status
  4. GET /api/recommendations → Personalized product suggestions

→ Render:
  - SkinHealthScore (latest analysis)
  - ConcernTrendChart (historical concern data from all visible analyses)
  - AnalysisTimeline (past analyses)
  - MyRoutine (latest analysis routine)
  - AutoTrackedProducts (from Order history)
  - AccountSettings (profile data)
```

## 4. Shop Checkout Flow

```
[Shop Page]
  → GET /api/products?category=&skinType=&priceMin=&priceMax=&sort=&search=
  → GET /api/categories → category filter
  → GET /api/brands → brand filter
  
[Add to Cart]
  → POST /api/cart/add { productId, quantity }
  → Update CartContext

[Cart Page]
  → GET /api/cart → Cart items
  → Adjust quantities, remove items
  → Proceed to checkout

[Checkout]
  → GET /api/subscription → Check if subscriber (for 5% discount)
  → POST /api/orders → { items, shippingAddress }
  → Backend: create order, calculate total, apply discount if subscriber
  → Response: orderId, total with breakdown
  → Redirect to order confirmation

[Dashboard / My Routine]
  → GET /api/orders → All orders → auto-tracked products extracted
```

## 5. Chatbot Data Flow

```
[User clicks ChatbotBubble]
  → Desktop: ChatbotSidebar slides in from right
  → Mobile: ChatbotOverlay full-screen

[User types query]
  → Check remaining queries (free tier: GET /api/chatbot/usage)
  → POST /api/chatbot/query { message, history? }
  → Backend: forward to AI service, get response
  → Display bot response in chat
  → Update query counter

[Free tier hits 10 queries]
  → Show UpgradeNudge inside chat header
  → Disable input with message "Subscribe for unlimited queries"
```

## 6. Subscription Flow

```
[Customer on Pricing page]
  → Clicks "Subscribe" → POST /api/subscription/create
  → Backend: process payment, create subscription record
  → Frontend: update AuthContext subscriptionTier → 'paid'

[Customer cancels]
  → POST /api/subscription/cancel
  → Backend: set end date, preserve data
  → Frontend: show "Premium until [date]"
  → After expiry: tier reverts to 'free', but old analysis data remains in database

[History gating on Dashboard]
  → GET /api/analysis: backend returns last 3 for free, 12 months for paid
  → Frontend renders all returned items; no frontend gating needed
```

## 7. Admin Data Flow

```
[Admin login]
  → POST /api/auth/admin/login → JWT with admin role
  → Redirect to /admin/dashboard

[Admin Products]
  → GET /api/admin/products → table w/ search, sort, pagination
  → POST /api/admin/products → create
  → PUT /api/admin/products/:id → update
  → DELETE /api/admin/products/:id → soft delete

[Admin Orders]
  → GET /api/admin/orders → table w/ status filter
  → PATCH /api/admin/orders/:id/status → update fulfillment status

[Admin Skin Content]
  → GET /api/admin/content → list all editable pages
  → PUT /api/admin/content/:id → update page body (WYSIWYG)
```
