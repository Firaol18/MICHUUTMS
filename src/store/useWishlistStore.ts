import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TourPackage } from '@/types/tour';

interface WishlistState {
  wishlist: TourPackage[];
  toggleWishlist: (tour: TourPackage) => void;
  isWishlisted: (tourId: string) => boolean;
  clearWishlist: () => void;
}

import { toast } from '@/store/useToastStore';

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],

      toggleWishlist: (tour) => {
        set((state) => {
          const exists = state.wishlist.some((item) => item.id === tour.id);
          if (exists) {
            toast.info(`"${tour.title}" removed from your Wishlist.`, 'Wishlist Updated');
            return { wishlist: state.wishlist.filter((item) => item.id !== tour.id) };
          } else {
            toast.success(`"${tour.title}" saved to your Wishlist!`, 'Added to Wishlist');
            return { wishlist: [...state.wishlist, tour] };
          }
        });
      },

      isWishlisted: (tourId) => {
        return get().wishlist.some((item) => item.id === tourId);
      },

      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: 'michuu-tms-wishlist',
    }
  )
);
