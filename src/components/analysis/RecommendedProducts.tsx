'use client';

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/shop/ProductCard";
import type { RoutineRecommendation } from "@/lib/schemas/analysis";
import type { Product } from "@/types/product";

interface RecommendedProductsProps {
  routine: RoutineRecommendation;
}

export function RecommendedProducts({ routine }: RecommendedProductsProps) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`Product catalog request failed with status ${response.status}`);
        }

        const products = (await response.json()) as Product[];
        if (!cancelled) setAllProducts(products);
      } catch (error) {
        // Recommendations remain hidden when the catalog cannot be loaded.
        console.error("[RecommendedProducts] Failed to fetch product catalog:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const productSteps = new Map<string, string[]>();
  for (const step of [...routine.morning, ...routine.night]) {
    for (const productId of step.suggestedProducts ?? []) {
      const steps = productSteps.get(productId) ?? [];
      if (!steps.includes(step.productType)) steps.push(step.productType);
      productSteps.set(productId, steps);
    }
  }

  const recommendedProducts = allProducts.filter((product) => productSteps.has(product.id));
  if (isLoading && allProducts.length === 0) {
    return (
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-heading text-2xl font-bold">Recommended For You</h2>
            <p className="text-sm text-muted-foreground">Handpicked based on your skin analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
              <div className="aspect-square bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-1/3 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="h-9 w-full rounded-xl bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (recommendedProducts.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-heading text-2xl font-bold">Recommended For You</h2>
          <p className="text-sm text-muted-foreground">Handpicked based on your skin analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {recommendedProducts.map((product) => (
          <div key={product.id} className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {productSteps.get(product.id)?.map((step) => (
                <Badge
                  key={step}
                  variant="outline"
                  className="border-primary/20 bg-primary/5 text-[10px] font-medium text-primary"
                >
                  {step}
                </Badge>
              ))}
            </div>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
