'use client';

import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const ProductGrid = ({ products, loading }: ProductGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
            <div className="aspect-square bg-muted/60" />
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-2.5 bg-muted rounded w-1/4" />
                <div className="h-2.5 bg-muted rounded w-1/5" />
              </div>
              <div className="h-3.5 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-2 bg-muted rounded w-full" />
              <div className="h-9 bg-muted rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
          <PackageOpen className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
          No products match your filters
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Try removing some filters or searching with different keywords to find what you need.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: Math.min(index * 0.04, 0.4),
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
};

export default ProductGrid;
