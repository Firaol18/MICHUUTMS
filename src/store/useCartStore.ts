import { create } from 'zustand';

export type CartItemType = 'tour' | 'hotel' | 'transport';

export interface CartItem {
  id: string;
  type: CartItemType;
  title: string;
  subtitle?: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number; // e.g. number of guests or days
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

export const useCartStore = create<CartState>((set, get) => ({
  items: [
    // Pre-populate with a sample multi-item cart for demonstration
    {
      id: 'tour-101-cart',
      type: 'tour',
      title: 'Wenchi Crater Lake & Thermal Springs Expedition',
      subtitle: '3 Days / 2 Nights • Oromia Region',
      imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800',
      unitPrice: 450,
      quantity: 2,
      date: '2026-09-20',
      details: {
        location: 'Wenchi, Ethiopia',
        duration: '3 Days',
        guideName: 'Abebe Bekele (Senior Eco-Ranger)',
      },
    },
    {
      id: 'hotel-skylight-cart',
      type: 'hotel',
      title: 'Ethiopian Skylight Hotel Addis Ababa',
      subtitle: '2 Nights Deluxe Suite (Pre-Tour Stay)',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
      unitPrice: 180,
      quantity: 2,
      date: '2026-09-18',
      details: {
        location: 'Bole Road, Addis Ababa',
        roomType: 'Deluxe King Suite (Breakfast Included)',
      },
    },
    {
      id: 'transport-4x4-cart',
      type: 'transport',
      title: 'Private 4x4 Toyota Land Cruiser Charter',
      subtitle: 'Airport Transfer & Scenic Route Chauffeur',
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
      unitPrice: 120,
      quantity: 3,
      date: '2026-09-18',
      details: {
        vehicleType: '4x4 Land Cruiser (AC, Bottled Water, English Driver)',
      },
    },
  ],
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
        return { items: updatedItems, isOpen: true };
      }
      return {
        items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }],
        isOpen: true,
      };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
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
      return { success: true, message: '15% Promotional Discount Applied!' };
    }
    if (cleanCode === 'WELCOME10') {
      set({ promoCode: cleanCode, discountPercent: 10 });
      return { success: true, message: '10% Welcome Discount Applied!' };
    }
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
}));
