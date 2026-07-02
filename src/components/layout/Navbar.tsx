'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, ChevronDown, ShoppingCart, Heart, User, LogOut, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/useCartStore";
import { useWishlist } from "@/store/useWishlistStore";
import { useAuth } from "@/store/useAuthStore";

const navItems = [
  { label: "Home", path: "/" },
  { 
    label: "Shop", 
    path: "/shop",
    children: [
      { label: "All Products", path: "/shop" },
      { label: "Men & Women", path: "/shop?category=men-women" },
      { label: "Korean Skincare", path: "/shop?category=korean" },
      { label: "For Children", path: "/shop?category=children" },
      { label: "For Seniors", path: "/shop?category=senior" },
      { label: "Laser Devices", path: "/shop?category=laser-devices" },
    ]
  },
  { label: "About Skincare", path: "/about" },
  { label: "Ingredients", path: "/ingredients" },
  { label: "Pricing", path: "/pricing" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { customer, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="h-7 w-7 text-primary" />
            </motion.div>
            <span className="font-heading text-xl font-bold text-foreground">
              GlowGuide
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link href={item.path}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3 w-3" />}
                </Link>

                {/* Dropdown */}
                <AnimatePresence>
                  {item.children && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-border bg-card shadow-card overflow-hidden before:content-[''] before:absolute before:-top-1 before:left-0 before:right-0 before:h-1"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          href={child.path}
                          onClick={() => setActiveDropdown(null)}
                          className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            
            {/* Show Quiz link conditionally based on auth */}
            <Link href={isAuthenticated ? "/analysis" : "/login"}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/analysis")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Skin Analysis
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Login State */}
            {isAuthenticated ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold relative">
                    {customer?.displayName?.split(" ").map(n => n[0]).join("") || "GG"}
                    {customer?.subscriptionTier === "PAID" && (
                      <Crown className="h-2.5 w-2.5 text-secondary absolute -top-1 -right-1 fill-secondary" />
                    )}
                  </div>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-card py-1.5 z-50 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
                      <div className="px-4 py-2 border-b border-border/40 mb-1">
                        <span className="font-semibold text-xs text-foreground block truncate">{customer?.displayName}</span>
                        <span className="text-[10px] text-muted-foreground block uppercase font-bold mt-0.5">
                          {customer?.subscriptionTier === "PAID" ? "★ Pro Tier" : "Free Tier"}
                        </span>
                      </div>
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors font-medium">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Dashboard
                      </Link>
                      <button onClick={() => { setUserMenuOpen(false); logout(); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors font-medium text-left">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="ml-1">
                <Button size="sm" className="bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground rounded-gg-sm shadow-primary font-semibold text-xs py-2">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors ml-1"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.path}>
                  <Link href={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive(item.path)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          href={child.path}
                          onClick={() => setIsOpen(false)}
                          className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <Link href={isAuthenticated ? "/analysis" : "/login"} onClick={() => setIsOpen(false)}>
                <Button className="w-full mt-4 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm py-4 rounded-gg-sm shadow-primary">
                  Start Skin Analysis
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;