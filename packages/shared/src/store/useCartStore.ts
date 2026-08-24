import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from './useToastStore';

export interface CartItem {
  id: string;
  type: 'tour' | 'event' | 'hotel' | 'flight' | 'car' | 'custom_trip' | 'transport' | string;
  title: string;
  subtitle?: string;
  image?: string;
  imageUrl?: string;
  unitPrice: number;
  currency?: string;
  quantity: number;
  date?: string;
  details?: any;
  bookingDetails?: {
    startDate?: string;
    endDate?: string;
    travelers?: number;
    roomType?: string;
    seatClass?: string;
    pickupLocation?: string;
    specialRequests?: string;
    tourType?: string;
    guideLanguage?: string;
  };
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  promoCode: string;
  discountPercent: number;
  appliedItemTitle?: string;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;

  // Getters
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: '',
      discountPercent: 0,
      appliedItemTitle: undefined,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      addItem: (newItem) => {
        const existing = get().items.find((item) => item.id === newItem.id);
        if (existing) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === newItem.id ? { ...item, quantity: item.quantity + (newItem.quantity || 1) } : item
            ),
          }));
          toast.success(`Updated "${newItem.title}" quantity in cart!`, 'Cart Updated');
        } else {
          set((state) => ({
            items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }],
          }));
          toast.success(`"${newItem.title}" added to your booking cart!`, 'Cart Updated');
        }
      },

      removeItem: (id) => {
        const itemToRemove = get().items.find((i) => i.id === id);
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
        if (itemToRemove) {
          toast.info(`"${itemToRemove.title}" removed from cart.`, 'Cart');
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

      clearCart: () => set({ items: [], promoCode: '', discountPercent: 0, appliedItemTitle: undefined }),

      removePromoCode: () => {
        set({ promoCode: '', discountPercent: 0, appliedItemTitle: undefined });
        toast.info('Promo code removed.', 'Discount');
      },

      applyPromoCode: (code) => {
        const cleanCode = code.trim().toUpperCase();

        // 15% Welcome and Platform Codes
        if (
          cleanCode.startsWith('MICHUU15') ||
          cleanCode === 'MICHUU15' ||
          cleanCode === 'ETHIOPIA2026' ||
          cleanCode.startsWith('MICHUU-WELCOME')
        ) {
          set({ promoCode: cleanCode, discountPercent: 15 });
          toast.success('15% Travel Offer Applied! (Deducted from 1 Tour or Event item)', 'Offer Active 🎉');
          return { success: true, message: '15% Offer Applied to 1 Tour or Event item!' };
        }

        if (cleanCode === 'WELCOME10') {
          set({ promoCode: cleanCode, discountPercent: 10 });
          toast.success('10% Welcome Discount Applied to 1 Tour or Event item!', 'Offer Active 🎉');
          return { success: true, message: '10% Welcome Discount Applied to 1 Tour or Event!' };
        }

        toast.warning('Invalid promo code. Enter your newsletter voucher (e.g. MICHUU15).', 'Invalid Code');
        return { success: false, message: 'Invalid promo code.' };
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
      },

      /**
       * Single-use offer restriction:
       * Discount applies to strictly 1 Tour Package or 1 Cultural Event item in the cart.
       */
      getDiscountAmount: () => {
        const { items, discountPercent } = get();
        if (!discountPercent || items.length === 0) return 0;

        // Find qualifying tour or event items
        const qualifyingItems = items.filter(
          (item) => item.type === 'tour' || item.type === 'event' || item.type === 'custom_trip'
        );

        if (qualifyingItems.length === 0) {
          // Fallback: If no explicit category tagged, apply to highest unit item
          const fallbackMax = items.reduce((prev, curr) => (curr.unitPrice > prev.unitPrice ? curr : prev));
          return Math.round((fallbackMax.unitPrice * discountPercent) / 100);
        }

        // Apply discount to the single highest unit price tour or event
        const highestTourOrEvent = qualifyingItems.reduce((prev, curr) =>
          curr.unitPrice > prev.unitPrice ? curr : prev
        );

        return Math.round((highestTourOrEvent.unitPrice * discountPercent) / 100);
      },

      getTotalPrice: () => {
        return Math.max(0, get().getSubtotal() - get().getDiscountAmount());
      },
    }),
    {
      name: 'michuu-tms-cart',
      partialize: (state) => ({
        items: state.items,
        isOpen: state.isOpen,
        promoCode: state.promoCode,
        discountPercent: state.discountPercent,
      }),
    }
  )
);
