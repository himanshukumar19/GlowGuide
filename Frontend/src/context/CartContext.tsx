import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/types/product';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
  getCartTax: () => number;
  getShippingCost: () => number;
  itemCount: number;
  appliedPromoCode: string | null;
  applyPromoCode: (code: string) => { success: boolean; message: string; discount?: number };
  removePromoCode: () => void;
  getPromoDiscount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'glowguide-cart';
const PROMO_STORAGE_KEY = 'glowguide-promo';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    const savedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    if (savedPromo) {
      setAppliedPromoCode(savedPromo);
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedPromoCode) {
      localStorage.setItem(PROMO_STORAGE_KEY, appliedPromoCode);
    } else {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    }
  }, [appliedPromoCode]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromoCode(null);
  };

  const getCartSubtotal = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartTax = () => {
    return Math.round(getCartSubtotal() * 0.18); // 18% GST
  };

  const getShippingCost = () => {
    const subtotal = getCartSubtotal();
    return subtotal >= 999 ? 0 : 99;
  };

  const promoCodes: Record<string, { discount: number; minOrder: number; freeShipping?: boolean }> = {
    'FIRST10': { discount: 10, minOrder: 0 },
    'GLOW20': { discount: 20, minOrder: 1500 },
    'SKIN15': { discount: 15, minOrder: 0 },
    'FREESHIP': { discount: 0, minOrder: 500, freeShipping: true },
    'SUMMER25': { discount: 25, minOrder: 2000 }
  };

  const applyPromoCode = (code: string): { success: boolean; message: string; discount?: number } => {
    const upperCode = code.toUpperCase();
    const promo = promoCodes[upperCode];
    
    if (!promo) {
      return { success: false, message: 'Invalid promo code' };
    }

    const subtotal = getCartSubtotal();
    if (subtotal < promo.minOrder) {
      return { success: false, message: `Minimum order of ₹${promo.minOrder} required` };
    }

    setAppliedPromoCode(upperCode);
    return { success: true, message: `Promo code applied! ${promo.discount}% off`, discount: promo.discount };
  };

  const removePromoCode = () => {
    setAppliedPromoCode(null);
  };

  const getPromoDiscount = () => {
    if (!appliedPromoCode) return 0;
    const promo = promoCodes[appliedPromoCode];
    if (!promo) return 0;
    return Math.round((getCartSubtotal() * promo.discount) / 100);
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const tax = getCartTax();
    const shipping = getShippingCost();
    const promoDiscount = getPromoDiscount();
    return subtotal + tax + shipping - promoDiscount;
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartSubtotal,
        getCartTax,
        getShippingCost,
        itemCount,
        appliedPromoCode,
        applyPromoCode,
        removePromoCode,
        getPromoDiscount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
