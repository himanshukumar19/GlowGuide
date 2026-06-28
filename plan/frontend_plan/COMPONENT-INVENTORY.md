# GlowGuide Component Inventory

## Existing Components (reusable)

```
src/components/
├── layout/
│   ├── Layout.tsx            — Page layout wrapper (header + main + footer)
│   ├── Navbar.tsx            — Top navigation bar
│   ├── Footer.tsx            — Site footer
│   └── ThemeToggle.tsx       — Theme toggle (repurpose as auth toggle or remove)
├── shop/
│   ├── ProductCard.tsx       — Product card in grid
│   ├── ProductGrid.tsx       — Grid of ProductCards
│   ├── ProductFilters.tsx    — Filter sidebar/drawer
│   └── ProductSort.tsx       — Sort dropdown
└── ui/                      — 49 shadcn/ui primitives (button, card, input, etc.)
```

## New Components to Create

### Auth & Account
| Component | Description |
|---|---|
| `AuthGuard` | Protected route wrapper — redirects to `/login` if not authenticated |
| `LoginForm` | Email/password login form with validation |
| `SignupForm` | Registration form with email, password, name, phone |
| `AccountSettings` | Profile editing, password change, phone update |
| `SubscriptionBadge` | Shows "Pro" or "Free" badge in nav/dashboard |

### Skin Analysis
| Component | Description |
|---|---|
| `SkinQuizForm` | 7-question multi-step form with progress indicator |
| `QuizQuestion` | Single quiz question card (radio, slider, or text input) |
| `LivePhotoCapture` | Camera-based photo capture for 5 angles |
| `FaceGuideOverlay` | On-screen face outline guide for positioning |
| `AngleProgress` | Visual progress indicator for 5-angle sequence (e.g., 2/5) |
| `PhotoReview` | Grid showing captured photos before submission |
| `AnalysisProcessing` | Animated progress screen during ML analysis |
| `AnalysisResults` | Complete analysis results display |
| `SkinTypeBadge` | Skin type indicator with icon and color |
| `ConcernChip` | Detected concern with confidence percentage |
| `RoutineTimeline` | Morning/night routine step list |
| `ProductRecommendations` | Grid of recommended product cards (separate from Shop) |

### Dashboard
| Component | Description |
|---|---|
| `DashboardOverview` | Summary panel: latest analysis, health score, quick actions |
| `AnalysisTimeline` | Chronological list of past analyses |
| `AnalysisHistoryCard` | Single history item in timeline |
| `SkinHealthScore` | 0–100 score widget with gauge/progress ring |
| `HealthScoreChart` | Sparkline/line chart of health score over time |
| `ConcernTrendChart` | Bar or radar chart of concern severity changes |
| `MyRoutine` | Current recommended routine (morning/night sections) |
| `RoutineStep` | Single step with product type, description, suggested products |
| `AutoTrackedProducts` | Products purchased through the app, with usage status |
| `UpgradeNudge` | Soft upgrade CTA banner/card for free users |
| `AnalysisComparison` | Side-by-side compare of two analyses |

### Chatbot
| Component | Description |
|---|---|
| `ChatbotBubble` | Floating button, fixed bottom-right |
| `ChatbotSidebar` | Sidebar panel (desktop: 400px, slides in from right) |
| `ChatbotOverlay` | Full-screen overlay (mobile, slides up from bottom) |
| `ChatMessage` | Single message bubble (user or bot) |
| `ChatInput` | Text input with send button |
| `ChatHeader` | Title, close button, query counter/status |
| `ChatUsageCounter` | Shows "10 queries remaining today" for free tier |

### Shop Enhancement
| Component | Description |
|---|---|
| `ProductImageGallery` | Main image + thumbnail strip with zoom |
| `ProductInfo` | Product name, brand, rating, price, description |
| `IngredientList` | Expandable ingredient list with tooltips |
| `ProductReviews` | Review section with star ratings |
| `AddToCartButton` | Quantity selector + add to cart with animation |
| `WishlistButton` | Heart icon toggle |
| `FilterCheckbox` | Reusable checkbox filter group |
| `FilterSlider` | Price range slider |
| `SearchBar` | Debounced search input with icon |
| `CartDrawer` | Slide-out cart summary (optional enhancement) |
| `CartItem` | Single cart item with quantity control |
| `OrderSummary` | Price breakdown with discount line |
| `ShippingForm` | Address form for checkout |

### Information Content
| Component | Description |
|---|---|
| `IngredientCard` | Ingredient with expandable dropdown detail |
| `IngredientDetail` | Expanded view: benefits, side effects, suitable skin types |
| `IngredientSearch` | Search bar with autocomplete |
| `SkinTypeCard` | Skin type overview card (homepage grid) |
| `SkinConcernGuide` | Concern detail with causes, prevention, treatments |
| `ContentPage` | Generic content page layout (CMS-rendered) |

### Admin Panel (separate layout)
| Component | Description |
|---|---|
| `AdminLayout` | Admin shell — sidebar nav, top bar, content area |
| `AdminSidebar` | Navigation menu (Products, Orders, Content, Dashboard) |
| `AdminLoginForm` | Admin-specific login |
| `AdminStatsCard` | Stat widget (total users, revenue, analyses) |
| `AdminProductTable` | Sortable/filterable products table |
| `AdminProductForm` | Product create/edit form |
| `AdminOrderTable` | Orders table with status management |
| `AdminOrderDetail` | Single order view with fulfillment actions |
| `AdminContentEditor` | WYSIWYG editor for skin content pages |
| `AdminIngredientForm` | Ingredient add/edit form |

### Shared/Common
| Component | Description |
|---|---|
| `PageHeader` | Reusable page heading with title, subtitle, optional CTA |
| `Section` | Reusable section wrapper with spacing and optional background |
| `StatCard` | Icon + number + label card (used on homepage and dashboard) |
| `LoadingSkeleton` | Skeleton loader for async content |
| `ErrorBoundary` | Error fallback UI |
| `EmptyState` | "No items found" illustration + text |
| `GradientButton` | Styled primary button with gradient |
| `PromoBanner` | Dismissable promo notification bar |
| `Breadcrumbs` | Navigation breadcrumbs |
