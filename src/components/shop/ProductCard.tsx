'use client';

import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import Link from "next/link";
import { Product } from '@/types/product';
import { useCart } from '@/store/useCartStore';
import { useWishlist } from '@/store/useWishlistStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const badgeColors: Record<string, string> = {
  bestseller: 'bg-amber-500 text-white',
  new: 'bg-teal-500 text-white',
  organic: 'bg-green-500 text-white',
  'dermatologist-tested': 'bg-blue-500 text-white',
  'cruelty-free': 'bg-pink-500 text-white',
  vegan: 'bg-emerald-500 text-white',
  natural: 'bg-lime-600 text-white',
  'korean-formula': 'bg-purple-500 text-white',
  'fragrance-free': 'bg-sky-500 text-white',
  'non-comedogenic': 'bg-cyan-500 text-white',
  'oil-control': 'bg-orange-500 text-white',
  'soap-free': 'bg-indigo-400 text-white',
  'barrier-care': 'bg-violet-500 text-white',
  'glass-skin': 'bg-fuchsia-500 text-white',
  'overnight-care': 'bg-slate-600 text-white',
  'baby-safe': 'bg-rose-400 text-white',
  hypoallergenic: 'bg-rose-400 text-white',
  'petroleum-free': 'bg-teal-600 text-white',
  'paraben-free': 'bg-teal-600 text-white',
  'mineral-based': 'bg-amber-600 text-white',
  'anti-aging': 'bg-purple-600 text-white',
  'retinol-formula': 'bg-red-500 text-white',
  'night-routine': 'bg-indigo-500 text-white',
  retinol: 'bg-red-500 text-white',
  'collagen-support': 'bg-rose-600 text-white',
  firming: 'bg-violet-600 text-white',
  'premium-care': 'bg-yellow-600 text-white',
  'deep-hydration': 'bg-blue-600 text-white',
  'non-greasy': 'bg-sky-600 text-white',
  'professional-grade': 'bg-slate-700 text-white',
  'home-use': 'bg-slate-600 text-white',
  'travel-friendly': 'bg-cyan-600 text-white',
  portable: 'bg-cyan-600 text-white',
  '4-in-1': 'bg-orange-600 text-white',
  'smart-sensor': 'bg-teal-700 text-white',
  'spf-50': 'bg-yellow-500 text-white',
  'broad-spectrum': 'bg-yellow-500 text-white',
  'daily-use': 'bg-sky-400 text-white',
  'fast-absorbing': 'bg-teal-400 text-white',
  'sensitive-skin': 'bg-rose-300 text-rose-900',
  brightening: 'bg-yellow-400 text-yellow-900',
  hydrating: 'bg-blue-400 text-white',
  'green-tea': 'bg-green-600 text-white',
  'low-pH': 'bg-indigo-400 text-white',
  'pH-balanced': 'bg-indigo-400 text-white',
  'tear-free': 'bg-pink-300 text-pink-900',
  'acne-prone': 'bg-red-400 text-white',
  'lightweight': 'bg-sky-300 text-sky-900',
};

const skinTypeLabels: Record<string, { emoji: string; color: string }> = {
  oily:      { emoji: '💧', color: 'bg-blue-100 text-blue-700 border border-blue-200' },
  dry:       { emoji: '🌿', color: 'bg-amber-100 text-amber-700 border border-amber-200' },
  combination: { emoji: '☯️', color: 'bg-purple-100 text-purple-700 border border-purple-200' },
  sensitive: { emoji: '🌸', color: 'bg-pink-100 text-pink-700 border border-pink-200' },
  normal:    { emoji: '✨', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const primaryIngredient = product.ingredients?.[0] || null;
  const visibleSkinTypes = product.skinTypes?.slice(0, 3) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative bg-card rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-hover transition-all duration-300"
    >
      {/* Top badges row */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.discount && product.discount > 0 && (
          <Badge className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5">
            {product.discount}% OFF
          </Badge>
        )}
        {product.badges?.slice(0, 1).map((badge) => (
          <Badge key={badge} className={`text-[10px] font-medium px-2 py-0.5 ${badgeColors[badge] || 'bg-gray-500 text-white'}`}>
            {badge.replace('-', ' ')}
          </Badge>
        ))}
      </div>

      {/* Wishlist */}
      <button
        onClick={handleWishlistToggle}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all shadow-sm ${
          inWishlist 
            ? 'bg-red-500 text-white shadow-red-200' 
            : 'bg-card/90 backdrop-blur-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100'
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${inWishlist ? 'fill-current' : ''}`} />
      </button>

      {/* Image */}
      <Link href={`/shop/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          
          {/* Out of stock */}
          {product.stockCount <= 0 && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
              <span className="text-foreground font-semibold text-sm bg-card px-4 py-1.5 rounded-full border border-border shadow-sm">
                Out of stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Brand + Key Ingredient */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            {product.brand}
          </span>
          {primaryIngredient && (
            <span className="text-[10px] text-primary font-semibold truncate max-w-[50%] text-right">
              {primaryIngredient}
            </span>
          )}
        </div>

        {/* Name */}
        <Link href={`/shop/${product.id}`}>
          <h3 className="font-medium text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {product.rating} ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          {product.discount && product.discount > 0 && (
            <span className="text-[10px] text-green-600 font-bold">
              Save {formatPrice(product.originalPrice! - product.price)}
            </span>
          )}
        </div>

        {/* Low stock warning */}
        {product.stockCount > 0 && product.stockCount < 20 && (
          <p className="text-[11px] text-orange-500 font-medium flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Only {product.stockCount} left
          </p>
        )}

        {/* Skin type strip */}
        {visibleSkinTypes.length > 0 && (
          <div className="flex items-center gap-1 pt-1">
            {visibleSkinTypes.map((st) => {
              const info = skinTypeLabels[st];
              return (
                <span
                  key={st}
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium ${info?.color || 'bg-muted text-muted-foreground'}`}
                >
                  <span className="text-[10px]">{info?.emoji}</span>
                  {st}
                </span>
              );
            })}
            {product.skinTypes.length > 3 && (
              <span className="text-[9px] text-muted-foreground">+{product.skinTypes.length - 3}</span>
            )}
          </div>
        )}

        {/* Add to cart */}
        <div className="pt-2">
          <Button
            onClick={handleAddToCart}
            disabled={product.stockCount <= 0}
            className="w-full h-9 text-xs font-semibold gradient-primary text-primary-foreground gap-1.5 rounded-xl shadow-primary hover:shadow-lg transition-shadow"
            size="sm"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {product.stockCount > 0 ? 'Add to cart' : 'Out of stock'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
