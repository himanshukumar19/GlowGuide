# GlowGuide — Domain Vocabulary

GlowGuide is a skincare analysis and product recommendation platform combining AI-powered vision and quiz-based skin evaluation, a premium e-commerce shop, and educational skincare content.

## Language

**Skin Analysis**:
A combined evaluation process consisting of a mandatory quiz followed by live-captured facial photos (5 angles) analyzed by a Vision Transformer model. Produces a single combined result: skin type, detected concerns, confidence scores.
_Avoid_: Skin quiz, Skin assessment, Evaluation

**Customer**:
A registered user of the platform who may purchase products and undergo Skin Analyses.
_Avoid_: User, Visitor, Member

**Guest**:
An unauthenticated visitor who can browse public pages and the Shop but cannot initiate a Skin Analysis, add to cart, or access the Dashboard.

**Shop**:
The product catalog browsable by Guests, with cart/checkout/order functionality gated behind Customer authentication.

**Product Recommendation**:
Personalized product suggestions shown to Customers based on their Skin Analysis history. Available to both free and paid Customers. Separate from the Shop browsing experience.

**Analysis History**:
A Customer's chronological record of completed Skin Analyses. Free-tier: last 3 visible. Paid-tier: 12 months visible. All data is preserved even after subscription lapses.

**Skin Health Score**:
A composite numeric score (0–100) derived from analysis results, shown with raw data (skin type, concerns) in the Dashboard to track improvement over time.

**Dashboard**:
A full-featured personal page available to all authenticated Customers showing latest analysis, health score, history timeline, routine tracker, auto-tracked products, and account settings.

**Chatbot**:
An AI assistant accessible site-wide via a floating bubble. On mobile: full-screen overlay. On desktop: sidebar. Answers queries about products, skin concerns, ingredients, and the application. Free-tier: 10 queries/day. Paid-tier: unlimited.

**Subscription**:
A paid plan granting extended analysis history (12 months) and unlimited chatbot queries. Subscribers receive 5% extra discount on all product purchases.

**My Routine**:
A section in the Dashboard where a Customer's recommended skincare routine (morning/night) is displayed alongside auto-tracked products purchased through the app.

**Ingredient**:
An active component in skincare products. Managed via the Admin Panel in a searchable glossary with dropdown detail cards showing benefits, side effects, and suitable skin types.

**Admin**:
A staff role with a separate login accessing a distinct admin dashboard (separate subdomain/route, different layout from main site). Manages Products, Orders, and Skin Content.

**Live Photo Capture**:
A guided camera flow that captures 5 facial photos in sequence (2 profile sides, 1 front, 2 at ~120° tilt) with an on-screen face guide overlay.

**Analysis Processing**:
The intermediate state between photo capture and results display. The frontend shows a progress animation while the backend coordinates quiz data + images through the VIT model.

**Upgrade Nudge**:
A soft visual prompt shown to free-tier Customers when they approach or hit their analysis limit, offering the option to subscribe.

**Skin Concerns**:
Specific dermatological conditions (acne, hyperpigmentation, aging, dryness, sensitivity) detected by the VIT model and/or quiz responses.

**Order**:
A Customer's purchase transaction in the Shop. Tracked in the Dashboard under "My Routine" as auto-tracked products. Managed by Admins in the Order management panel.
_Avoid_: Purchase

**Auth Provider**:
The method a Customer uses to sign in — Email/Password or Google. Both can be linked to the same Customer account via Firebase account linking.

**Complete Your Profile**:
The post-registration flow shown to a Customer after their first sign-in (regardless of Auth Provider) to collect phone, address, and skin profile before accessing the Dashboard. Skippable but re-prompted on next visit.

**Analysis Count**:
The total number of completed Skin Analyses a Customer has performed. Incremented by the backend after each successful analysis. Used to enforce free-tier limit (max 3). Stored in the Customer's Firestore document.
