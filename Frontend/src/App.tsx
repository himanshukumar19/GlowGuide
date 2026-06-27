import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/layout/AuthGuard";
import Index from "./pages/Index";
import SkinQuiz from "./pages/SkinQuiz";
import SkinTypesOverview from "./pages/SkinTypesOverview";
import SkinTypeDetail from "./pages/SkinTypeDetail";
import AboutSkincare from "./pages/AboutSkincare";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";
import IngredientsGlossary from "./pages/IngredientsGlossary";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/quiz" element={<SkinQuiz />} />
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/cart" element={<AuthGuard><CartPage /></AuthGuard>} />
          <Route path="/wishlist" element={<AuthGuard><WishlistPage /></AuthGuard>} />
          <Route path="/checkout" element={<AuthGuard><CheckoutPage /></AuthGuard>} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
