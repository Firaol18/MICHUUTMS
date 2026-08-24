import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItemType = 'tour' | 'hotel' | 'transport' | 'event';

export interface CartItem {
  id: string;
  type: CartItemType;
  title: string;
  subtitle?: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  date?: string;
  details?: {
    location?: string;
    duration?: string;
    roomType?: string;
    vehicleType?: string;
    guideName?: string;
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  promoCode: string;
  discountPercent: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotalPrice: () => number;
}

import { toast } from '@/store/useToastStore';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: '',
      discountPercent: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === newItem.id);
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += newItem.quantity || 1;
            toast.success(`Updated quantity for "${newItem.title}" in cart!`, 'Cart Updated');
            return { items: updatedItems, isOpen: true };
          }
          toast.success(`"${newItem.title}" added to your cart!`, 'Added to Cart');
          return {
            items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }],
            isOpen: true,
          };
        });
      },

      removeItem: (id) => {
        const item = get().items.find((i) => i.id === id);
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
        if (item) {
          toast.info(`"${item.title}" removed from cart.`, 'Cart Updated');
        }
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        }));
      },

      clearCart: () => set({ items: [], promoCode: '', discountPercent: 0 }),

      applyPromoCode: (code) => {
        const cleanCode = code.trim().toUpperCase();
        if (cleanCode === 'MICHUU15' || cleanCode === 'ETHIOPIA2026') {
          set({ promoCode: cleanCode, discountPercent: 15 });
          toast.success('15% Promotional Discount Applied!', 'Promo Code');
          return { success: true, message: '15% Promotional Discount Applied!' };
        }
        if (cleanCode === 'WELCOME10') {
          set({ promoCode: cleanCode, discountPercent: 10 });
          toast.success('10% Welcome Discount Applied!', 'Promo Code');
          return { success: true, message: '10% Welcome Discount Applied!' };
        }
        toast.warning('Invalid promo code. Try "MICHUU15"', 'Promo Code');
        return { success: false, message: 'Invalid promo code. Try "MICHUU15"' };
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        return Math.round((subtotal * get().discountPercent) / 100);
      },

      getTotalPrice: () => {
        return get().getSubtotal() - get().getDiscountAmount();
      },
    }),
    {
      name: 'michuu-tms-cart',
      partialize: (state) => ({ items: state.items, promoCode: state.promoCode, discountPercent: state.discountPercent }),
    }
  )
);
