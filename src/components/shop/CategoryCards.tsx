'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface Category {
  key: string;
  label: string;
  tagline: string;
  image: string;
}

const categories: Category[] = [
  {
    key: 'men-women',
    label: 'Men & Women',
    tagline: 'Daily essentials for every skin type',
    image: 'https://res.cloudinary.com/dllxwarw6/image/upload/v1783378320/glowguide/products/gg-skin-brightening-kit/gg-skin-brightening-kit.png',
  },
  {
    key: 'korean',
    label: 'K-Beauty',
    tagline: '7-step routines, glass-skin results',
    image: 'https://res.cloudinary.com/dllxwarw6/image/upload/v1783378330/glowguide/products/gg-korean-glass-skin-kit/gg-korean-glass-skin-kit.png',
  },
  {
    key: 'children',
    label: 'For Children',
    tagline: 'Gentle, dermatologist-approved formulas',
    image: 'https://res.cloudinary.com/dllxwarw6/image/upload/v1783378339/glowguide/products/gg-baby-milky-soft-cream/gg-baby-milky-soft-cream.png',
  },
  {
    key: 'senior',
    label: 'For Seniors',
    tagline: 'Targeted care for mature skin',
    image: 'https://res.cloudinary.com/dllxwarw6/image/upload/v1783378347/glowguide/products/gg-deep-hydration-moisturizer/gg-deep-hydration-moisturizer.png',
  },
  {
    key: 'laser-devices',
    label: 'Laser Devices',
    tagline: 'Professional-grade at-home treatments',
    image: 'https://res.cloudinary.com/dllxwarw6/image/upload/v1783378353/glowguide/products/gg-pro-ipl-device/gg-pro-ipl-device.png',
  },
];

interface CategoryCardsProps {
  onSelect: (category: string) => void;
  activeCategory?: string;
}

const CategoryCards = ({ onSelect, activeCategory }: CategoryCardsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {categories.map((cat, i) => {
        const isActive = activeCategory === cat.key;
        return (
          <motion.button
            key={cat.key}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
            onClick={() => onSelect(cat.key)}
            className={`group relative flex flex-col items-center text-center rounded-2xl overflow-hidden border transition-all duration-300 ${
              isActive
                ? 'border-primary shadow-primary ring-2 ring-primary/20'
                : 'border-border shadow-soft hover:shadow-card hover:border-primary/30'
            }`}
          >
            {/* Image */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className={`absolute inset-0 transition-opacity duration-300 ${
                isActive ? 'bg-primary/20' : 'bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-primary/30'
              }`} />
            </div>

            {/* Text */}
            <div className="w-full px-3 py-3 bg-card">
              <p className={`text-sm font-semibold leading-tight transition-colors ${
                isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'
              }`}>
                {cat.label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug hidden sm:block">
                {cat.tagline}
              </p>
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium mt-1.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
              }`}>
                Browse
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>

            {/* Active indicator bar */}
            {isActive && (
              <motion.div
                layoutId="category-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoryCards;
