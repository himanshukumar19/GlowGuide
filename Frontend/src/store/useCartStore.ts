import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@/types/product';

const PROMO_CODES: Record<string, { discount: number; minOrder: number; freeShipping?: boolean }> = {
  'FIRST10': { discount: 10, minOrder: 0 },
  'GLOW20': { discount: 20, minOrder: 1500 },
  'SKIN15': { discount: 15, minOrder: 0 },
  'FREESHIP': { discount: 0, minOrder: 500, freeShipping: true },
  'SUMMER25': { discount: 25, minOrder: 2000 }
};

interface CartState {
  items: CartItem[];
  appliedPromoCode: string | null;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartTax: () => number;
  getShippingCost: () => number;
  getPromoDiscount: () => number;
  getCartTotal: () => number;
  getItemCount: () => number;
  applyPromoCode: (code: string) => { success: boolean; message: string; discount?: number };
  removePromoCode: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedPromoCode: null,
      addToCart: (product, quantity = 1) => {
        set(state => {
          const existingItem = state.items.find(item => item.product.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            };
          }
          return { items: [...state.items, { product, quantity }] };
        });
      },
      removeFromCart: (productId) => {
        set(state => ({
          items: state.items.filter(item => item.product.id !== productId)
        }));
      },
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeFromCart(productId);
          return;
        }
        set(state => ({
          items: state.items.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        }));
      },
      clearCart: () => {
        set({ items: [], appliedPromoCode: null });
      },
      getCartSubtotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },
      getCartTax: () => {
        return Math.round(get().getCartSubtotal() * 0.18); // 18% GST
      },
      getShippingCost: () => {
        const subtotal = get().getCartSubtotal();
        const promo = get().appliedPromoCode ? PROMO_CODES[get().appliedPromoCode!] : null;
        if (promo?.freeShipping && subtotal >= promo.minOrder) {
          return 0;
        }
        return subtotal >= 999 ? 0 : 99;
      },
      getPromoDiscount: () => {
        const code = get().appliedPromoCode;
        if (!code) return 0;
        const promo = PROMO_CODES[code];
        if (!promo) return 0;
        return Math.round((get().getCartSubtotal() * promo.discount) / 100);
      },
      getCartTotal: () => {
        const subtotal = get().getCartSubtotal();
        const tax = get().getCartTax();
        const shipping = get().getShippingCost();
        const promoDiscount = get().getPromoDiscount();
        return subtotal + tax + shipping - promoDiscount;
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      applyPromoCode: (code) => {
        const upperCode = code.toUpperCase();
        const promo = PROMO_CODES[upperCode];
        
        if (!promo) {
          return { success: false, message: 'Invalid promo code' };
        }

        const subtotal = get().getCartSubtotal();
        if (subtotal < promo.minOrder) {
          return { success: false, message: `Minimum order of ₹${promo.minOrder} required` };
        }

        set({ appliedPromoCode: upperCode });
        return { success: true, message: `Promo code applied! ${promo.discount}% off`, discount: promo.discount };
      },
      removePromoCode: () => {
        set({ appliedPromoCode: null });
      }
    }),
    {
      name: 'glowguide-cart-store',
    }
  )
);

export const useCart = () => {
  const store = useCartStore();
  const itemCount = store.items.reduce((count, item) => count + item.quantity, 0);
  return {
    ...store,
    itemCount
  };
};
