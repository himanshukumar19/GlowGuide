import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Loader2 } from "lucide-react";

// ─── Eagerly loaded (fast first paint, visited before auth) ─────────────────
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// ─── Lazy loaded (heavy or rarely visited on first load) ─────────────────────
const SkinTypesOverview   = lazy(() => import("./pages/SkinTypesOverview"));
const SkinTypeDetail      = lazy(() => import("./pages/SkinTypeDetail"));
const AboutSkincare       = lazy(() => import("./pages/AboutSkincare"));
const ShopPage            = lazy(() => import("./pages/ShopPage"));
const ProductDetailPage   = lazy(() => import("./pages/ProductDetailPage"));
const CartPage            = lazy(() => import("./pages/CartPage"));
const WishlistPage        = lazy(() => import("./pages/WishlistPage"));
const CheckoutPage        = lazy(() => import("./pages/CheckoutPage"));
const Pricing             = lazy(() => import("./pages/Pricing"));
const IngredientsGlossary = lazy(() => import("./pages/IngredientsGlossary"));
const Dashboard           = lazy(() => import("./pages/Dashboard"));
const SkinQuiz            = lazy(() => import("./pages/SkinQuiz"));
const AnalysisResultsPage = lazy(() => import("./pages/AnalysisResultsPage"));

// Admin panel — split into its own chunk group
const AdminLogin          = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard      = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts       = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm    = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminOrders         = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail    = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminSkinContent    = lazy(() => import("./pages/admin/AdminSkinContent"));
const AdminIngredients    = lazy(() => import("./pages/admin/AdminIngredients"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 text-primary animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/skin-types" element={<SkinTypesOverview />} />
            <Route path="/skin-types/:type" element={<SkinTypeDetail />} />
            <Route path="/about" element={<AboutSkincare />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/ingredients" element={<IngredientsGlossary />} />

            {/* Protected routes */}
            <Route path="/quiz" element={<AuthGuard><SkinQuiz /></AuthGuard>} />
            <Route path="/analysis" element={<AuthGuard><SkinQuiz /></AuthGuard>} />
            <Route path="/analysis/results/:id" element={<AuthGuard><AnalysisResultsPage /></AuthGuard>} />
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/cart" element={<AuthGuard><CartPage /></AuthGuard>} />
            <Route path="/wishlist" element={<AuthGuard><WishlistPage /></AuthGuard>} />
            <Route path="/checkout" element={<AuthGuard><CheckoutPage /></AuthGuard>} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AuthGuard requireAdmin><AdminDashboard /></AuthGuard>} />
            <Route path="/admin/products" element={<AuthGuard requireAdmin><AdminProducts /></AuthGuard>} />
            <Route path="/admin/products/new" element={<AuthGuard requireAdmin><AdminProductForm /></AuthGuard>} />
            <Route path="/admin/products/:id/edit" element={<AuthGuard requireAdmin><AdminProductForm /></AuthGuard>} />
            <Route path="/admin/orders" element={<AuthGuard requireAdmin><AdminOrders /></AuthGuard>} />
            <Route path="/admin/orders/:id" element={<AuthGuard requireAdmin><AdminOrderDetail /></AuthGuard>} />
            <Route path="/admin/skin-content" element={<AuthGuard requireAdmin><AdminSkinContent /></AuthGuard>} />
            <Route path="/admin/ingredients" element={<AuthGuard requireAdmin><AdminIngredients /></AuthGuard>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
