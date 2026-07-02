# GlowGuide Route Architecture

## Main Site Routes

```
/                          → Index (Homepage) — Public
/about                     → AboutSkincare — Public
/skin-types                → SkinTypesOverview — Public
/skin-types/:type          → SkinTypeDetail — Public
/ingredients               → IngredientsGlossary — Public
/pricing                   → Pricing — Public

/login                     → Login — Public (redirect if already logged in)
/signup                    → Signup — Public (redirect if already logged in)

/shop                      → ShopPage — Public (browse), Auth required to add to cart
/product/:id               → ProductDetailPage — Public

/cart                      → CartPage — Protected
/checkout                  → CheckoutPage — Protected
/wishlist                  → WishlistPage — Protected

/dashboard                 → Dashboard — Protected
/analysis                  → AnalysisFlow — Protected (Quiz → Photos → Processing → Results)
/analysis/results/:id      → AnalysisResults — Protected

/*                         → NotFound — Public
```

## Admin Panel Routes

```
/admin/login               → AdminLogin — Public (separate layout)
/admin                     → AdminDashboard — Admin Auth Required
/admin/products            → AdminProducts — Admin Auth Required
/admin/products/new        → AdminProductCreate — Admin Auth Required
/admin/products/:id/edit   → AdminProductEdit — Admin Auth Required
/admin/orders              → AdminOrders — Admin Auth Required
/admin/orders/:id          → AdminOrderDetail — Admin Auth Required
/admin/skin-content        → AdminSkinContent — Admin Auth Required
/admin/skin-content/:id/edit → AdminContentEdit — Admin Auth Required
/admin/ingredients          → AdminIngredients — Admin Auth Required
```

## Route Implementation Notes

### Auth Guard Pattern
```typescript
function AuthGuard({ children }: { children: ReactNode }) {
  const { customer, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSkeleton />;
  if (!customer) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
```

### Protected Route Registration
```typescript
<Routes>
  {/* Public routes */}
  <Route path="/" element={<Index />} />
  <Route path="/shop" element={<ShopPage />} />
  
  {/* Protected routes */}
  <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
  <Route path="/analysis/*" element={<AuthGuard><AnalysisFlow /></AuthGuard>} />
  
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Chatbot (site-wide, not a route)
- Floating bubble rendered in `Layout.tsx` above footer
- On mobile: full-screen overlay (no route change)
- On desktop: sidebar overlay (no route change)

### Admin Panel Route Organization
Admin routes live under a separate `<AdminLayout />` wrapper or a separate subdomain. If separate subdomain: `admin.glowguide.app`. If route: all routes prefixed with `/admin`. The AdminLayout component provides different sidebar navigation and header from the main site.
