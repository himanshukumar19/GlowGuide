export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'men-women' | 'korean' | 'children' | 'senior' | 'laser-devices';
  subcategory?: 'cleanser' | 'serum' | 'moisturizer' | 'sunscreen' | 'toner' | 'device' | 'kit' | 'lip-care';
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  description: string;
  shortDescription: string;
  keyBenefits: string[];
  ingredients: string[];
  howToUse: string;
  skinTypes: ('oily' | 'dry' | 'combination' | 'sensitive' | 'normal')[];
  suitableFor: ('men' | 'women' | 'children' | 'teens' | 'adults' | 'seniors')[];
  concerns: string[];
  volume: string;
  inStock: boolean;
  stockCount: number;
  badges?: ('bestseller' | 'new' | 'organic' | 'dermatologist-tested' | 'cruelty-free' | 'vegan' | 'natural' | 'korean-formula')[];
  whereToBuy: {
    amazon?: string;
    nykaa?: string;
    flipkart?: string;
    official?: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  reviewTitle: string;
  reviewText: string;
  verified: boolean;
  helpful: number;
}

export interface Address {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'office';
}

export interface Order {
  orderId: string;
  items: CartItem[];
  shippingAddress: Address;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered';
  paymentMethod: string;
  createdAt: Date;
}

export type SortOption = 'price-low' | 'price-high' | 'rating' | 'newest' | 'bestseller' | 'discount';

export interface FilterState {
  category: string[];
  priceRange: [number, number];
  skinTypes: string[];
  brands: string[];
  rating: number;
  discount: number;
  inStock: boolean;
}
