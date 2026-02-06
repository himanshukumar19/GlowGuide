import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/shop/ProductGrid';
import ProductFilters from '@/components/shop/ProductFilters';
import ProductSort from '@/components/shop/ProductSort';
import { Input } from '@/components/ui/input';
import { products, categoryLabels } from '@/data/products';
import { FilterState, SortOption } from '@/types/product';

const ShopPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    priceRange: [0, 30000],
    skinTypes: [],
    brands: [],
    rating: 0,
    discount: 0,
    inStock: false
  });
  const [sortOption, setSortOption] = useState<SortOption>('bestseller');

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.ingredients.some(i => i.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category.length > 0) {
      result = result.filter(p => filters.category.includes(p.category));
    }

    // Price range
    result = result.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Skin types
    if (filters.skinTypes.length > 0) {
      result = result.filter(p => 
        p.skinTypes.some(st => filters.skinTypes.includes(st))
      );
    }

    // Brands
    if (filters.brands.length > 0) {
      result = result.filter(p => filters.brands.includes(p.brand));
    }

    // Rating
    if (filters.rating > 0) {
      result = result.filter(p => p.rating >= filters.rating);
    }

    // Discount
    if (filters.discount > 0) {
      result = result.filter(p => p.discount && p.discount >= filters.discount);
    }

    // In stock
    if (filters.inStock) {
      result = result.filter(p => p.inStock);
    }

    // Sorting
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
  }, [searchQuery, filters, sortOption]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Shop Skincare</h1>
          <p className="text-muted-foreground">
            Discover our curated collection of premium skincare products
          </p>
        </motion.div>

        {/* Promo Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-4 mb-8 text-center"
        >
          <p className="font-medium">
            🎉 Free Shipping on orders above ₹999 | Use code <span className="font-bold">GLOW20</span> for 20% off on ₹1500+
          </p>
        </motion.div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, brands, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <ProductFilters
              filters={filters}
              setFilters={setFilters}
              sortOption={sortOption}
              setSortOption={setSortOption}
              productCount={filteredProducts.length}
            />
            <ProductSort value={sortOption} onChange={setSortOption} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Filters Sidebar (Desktop) */}
          <ProductFilters
            filters={filters}
            setFilters={setFilters}
            sortOption={sortOption}
            setSortOption={setSortOption}
            productCount={filteredProducts.length}
          />

          {/* Product Grid */}
          <div className="flex-1">
            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;
