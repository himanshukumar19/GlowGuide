'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import ProductGrid from '@/components/shop/ProductGrid';
import ProductFilters from '@/components/shop/ProductFilters';
import ProductSort from '@/components/shop/ProductSort';
import CategoryCards from '@/components/shop/CategoryCards';
import { Input } from '@/components/ui/input';
import { categoryLabels } from '@/lib/constants';
import { FilterState, SortOption, Product } from '@/types/product';

const VALID_CATEGORIES = ['men-women', 'korean', 'children', 'senior', 'laser-devices'];

export default function ShopContent() {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    priceRange: [0, 30000],
    skinTypes: [],
    brands: [],
    rating: 0,
    discount: 0,
    inStockOnly: false
  });
  const [sortOption, setSortOption] = useState<SortOption>('bestseller');

  useEffect(() => {
    const category = searchParams.get('category');
    if (category && VALID_CATEGORIES.includes(category)) {
      setFilters(prev => ({ ...prev, category: [category] }));
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch {
        // API failed — products remain empty
      }
    }
    fetchProducts();
  }, []);

  const brands = useMemo(() => {
    return [...new Set(products.map(p => p.brand))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.ingredients.some(i => i.toLowerCase().includes(query))
      );
    }

    if (filters.category.length > 0) {
      result = result.filter(p => filters.category.includes(p.category));
    }

    result = result.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    if (filters.skinTypes.length > 0) {
      result = result.filter(p => 
        p.skinTypes.some(st => filters.skinTypes.includes(st))
      );
    }

    if (filters.brands.length > 0) {
      result = result.filter(p => filters.brands.includes(p.brand));
    }

    if (filters.rating > 0) {
      result = result.filter(p => p.rating >= filters.rating);
    }

    if (filters.discount > 0) {
      result = result.filter(p => p.discount && p.discount >= filters.discount);
    }

    if (filters.inStockOnly) {
      result = result.filter(p => p.stockCount > 0);
    }

    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'bestseller':
        result.sort((a, b) => {
          const aIsBestseller = a.badges?.includes('bestseller') ? 1 : 0;
          const bIsBestseller = b.badges?.includes('bestseller') ? 1 : 0;
          return bIsBestseller - aIsBestseller;
        });
        break;
      case 'newest':
        result.sort((a, b) => {
          const aIsNew = a.badges?.includes('new') ? 1 : 0;
          const bIsNew = b.badges?.includes('new') ? 1 : 0;
          return bIsNew - aIsNew;
        });
        break;
    }

    return result;
  }, [searchQuery, filters, sortOption, products]);

  const hasActiveCategory = filters.category.length > 0;

  const handleCategorySelect = (category: string) => {
    setFilters(prev => {
      const isActive = prev.category.includes(category);
      return {
        ...prev,
        category: isActive ? [] : [category],
      };
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-secondary/5 blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative container mx-auto px-4 pt-10 pb-10 sm:pt-16 sm:pb-12">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left — copy + search */}
            <div className="flex-1 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap items-center gap-2.5 mb-5"
              >
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full gradient-primary text-white text-xs font-semibold tracking-wide shadow-primary">
                  <span className="text-sm">🧴</span>
                  Skincare Shop
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/60 text-xs text-muted-foreground font-medium shadow-soft">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                  </span>
                  Dermatologist picks
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground leading-[1.15] tracking-tight"
              >
                Skincare that works
                <span className="text-gradient block mt-1 pb-1">for your skin</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="mt-4 text-muted-foreground text-base sm:text-lg max-w-lg leading-relaxed"
              >
                Dermatologist-reviewed products matched to your skin type.
                Filter by concern, browse by category, or search ingredients.
              </motion.p>

              {/* Search */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="mt-6 max-w-md"
              >
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products, brands, ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-card/80 backdrop-blur-sm border-border/60 shadow-soft focus:shadow-card transition-shadow"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Promo bar */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/60 shadow-soft text-sm"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-muted-foreground">
                  Free shipping above ₹999
                </span>
                <span className="text-border">|</span>
                <span className="text-foreground font-medium">
                  Use <span className="text-primary font-bold">GLOW20</span> for 20% off ₹1500+
                </span>
              </motion.div>
            </div>

            {/* Right — hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block flex-shrink-0 w-[440px] xl:w-[500px]"
            >
              <div className="relative">
                {/* Animated gradient orbs */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-gradient-to-br from-primary/25 to-transparent blur-3xl"
                />
                <motion.div
                  animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full bg-gradient-to-tr from-secondary/20 to-transparent blur-3xl"
                />

                {/* Floating water droplets */}
                <motion.div
                  animate={{ y: [-20, 60], opacity: [0, 1, 0], scale: [0.5, 1, 0.6] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeIn', delay: 0 }}
                  className="absolute -top-4 left-1/4 text-2xl select-none pointer-events-none drop-shadow-lg"
                >
                  💧
                </motion.div>
                <motion.div
                  animate={{ y: [-30, 70], opacity: [0, 1, 0], scale: [0.4, 0.9, 0.5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeIn', delay: 1.8 }}
                  className="absolute -top-6 right-1/3 text-xl select-none pointer-events-none drop-shadow-lg"
                >
                  💧
                </motion.div>
                <motion.div
                  animate={{ y: [-15, 55], opacity: [0, 0.8, 0], scale: [0.3, 0.7, 0.4] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeIn', delay: 3 }}
                  className="absolute top-0 right-8 text-lg select-none pointer-events-none drop-shadow-lg"
                >
                  💧
                </motion.div>

                {/* Floating leaf / botanical */}
                <motion.div
                  animate={{
                    y: [0, -18, 0, 12, 0],
                    x: [0, 8, 0, -6, 0],
                    rotate: [0, 10, -5, 8, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -left-10 top-1/3 text-3xl select-none pointer-events-none opacity-70"
                >
                  🌿
                </motion.div>
                <motion.div
                  animate={{
                    y: [0, 10, 0, -14, 0],
                    x: [0, -6, 0, 10, 0],
                    rotate: [0, -12, 6, -8, 0],
                  }}
                  transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                  className="absolute -right-8 bottom-1/4 text-2xl select-none pointer-events-none opacity-60"
                >
                  🍃
                </motion.div>

                {/* Vitamin C sparkles */}
                <motion.div
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 180, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-2 left-1/2 text-lg select-none pointer-events-none"
                >
                  ✨
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.6, 1.1, 0.6], rotate: [360, 180, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                  className="absolute bottom-4 -right-3 text-base select-none pointer-events-none"
                >
                  ✨
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.3, 0.8] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                  className="absolute top-1/2 -left-5 text-sm select-none pointer-events-none"
                >
                  ✨
                </motion.div>

                {/* Floating skincare product icons */}
                <motion.div
                  animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -right-12 top-1/2 text-2xl select-none pointer-events-none opacity-50"
                >
                  🧴
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [0, -6, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  className="absolute -left-8 bottom-6 text-xl select-none pointer-events-none opacity-40"
                >
                  🫧
                </motion.div>

                {/* Glow ring around image */}
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-3 rounded-3xl"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(53,82,69,0.12) 25%, transparent 50%, rgba(133,68,56,0.1) 75%, transparent 100%)',
                  }}
                />

                {/* Floating image with pulse glow */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  {/* Pulsing glow behind image */}
                  <motion.div
                    animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.96, 1, 0.96] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-secondary/15 blur-md"
                  />
                  <img
                    src="/images/kit.png"
                    alt="Skincare kit collection"
                    className="relative w-full h-auto rounded-2xl object-cover shadow-elevated"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="container mx-auto px-4 -mt-2 mb-8">
        <CategoryCards
          onSelect={handleCategorySelect}
          activeCategory={filters.category[0]}
        />
      </section>

      {/* Toolbar */}
      <section className="container mx-auto px-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ProductFilters
              filters={filters}
              setFilters={setFilters}
              sortOption={sortOption}
              setSortOption={setSortOption}
              productCount={filteredProducts.length}
              brands={brands}
              desktopOnly={false}
              mobileOnly={true}
            />
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">{filteredProducts.length}</span>
              {' '}products
              {hasActiveCategory && (
                <span className="text-muted-foreground">
                  {' '}in{' '}
                  <span className="text-primary font-medium">
                    {categoryLabels[filters.category[0] as keyof typeof categoryLabels]}
                  </span>
                </span>
              )}
            </p>
          </div>
          <ProductSort value={sortOption} onChange={setSortOption} />
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex gap-8">
          <ProductFilters
            filters={filters}
            setFilters={setFilters}
            sortOption={sortOption}
            setSortOption={setSortOption}
            productCount={filteredProducts.length}
            brands={brands}
            desktopOnly={true}
            mobileOnly={false}
          />

          <div className="flex-1 min-w-0">
            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </section>
    </div>
  );
}
