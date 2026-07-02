'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';

interface WishlistState {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  toggleWishlist: (product: Product) => void;
  getItemCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (product) => {
        set(state => {
          if (state.items.find(item => item.id === product.id)) {
            return state;
          }
          return { items: [...state.items, product] };
        });
      },
      removeFromWishlist: (productId) => {
        set(state => ({
          items: state.items.filter(item => item.id !== productId)
        }));
      },
      isInWishlist: (productId) => {
        return get().items.some(item => item.id === productId);
      },
      toggleWishlist: (product) => {
        set(state => {
          if (state.items.find(item => item.id === product.id)) {
            return { items: state.items.filter(item => item.id !== product.id) };
          }
          return { items: [...state.items, product] };
        });
      },
      clearWishlist: () => {
        set({ items: [] });
      },
      getItemCount: () => {
        return get().items.length;
      }
    }),
    {
      name: 'glowguide-wishlist-store',
      skipHydration: true,
    }
  )
);

export const useWishlist = () => {
  const store = useWishlistStore();
  const itemCount = store.items.length;
  return {
    ...store,
    itemCount
  };
};
