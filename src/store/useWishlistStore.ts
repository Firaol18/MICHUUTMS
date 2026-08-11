import { create } from 'zustand';
import type { TourPackage } from '@/types/tour';

interface WishlistState {
  wishlist: TourPackage[];
  toggleWishlist: (tour: TourPackage) => void;
  isWishlisted: (tourId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [
    {
      id: 'tour-101',
      title: 'Wenchi Crater Lake & Thermal Springs Expedition',
      slug: 'wenchi-crater-lake-expedition',
      category: 'mountain',
      destination: {
        id: 'dest-wenchi',
        name: 'Wenchi Crater Lake',
        country: 'Ethiopia',
        region: 'Oromia Region',
        imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800',
        description: 'Extinct volcanic crater featuring pristine crater lake, hot mineral springs, and forest trails.',
      },
      pricePerPerson: 450,
      durationDays: 3,
      maxGroupSize: 12,
      difficulty: 'moderate',
      rating: 4.9,
      reviewCount: 38,
      imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800',
      galleryImages: [
        'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800',
      ],
      summary: 'Explore Ethiopia’s breathtaking volcanic crater lake, soak in natural thermal springs.',
      included: ['Guided crater rim trek', 'Hot springs entrance', 'Full board meals'],
      excluded: ['International flights', 'Personal tips'],
      itinerary: [
        { dayNumber: 1, title: 'Addis to Wenchi', description: 'Drive west from Addis Ababa to Ambo and ascend to Wenchi crater rim.' }
      ],
      isFeatured: true,
      status: 'active',
      hasOffer: true,
      discountPercent: 15,
      originalPrice: 530,
      offerTag: '15% OFF SEASONAL PROMO',
    },
  ],

  toggleWishlist: (tour) => {
    set((state) => {
      const exists = state.wishlist.some((item) => item.id === tour.id);
      if (exists) {
        return { wishlist: state.wishlist.filter((item) => item.id !== tour.id) };
      } else {
        return { wishlist: [...state.wishlist, tour] };
      }
    });
  },

  isWishlisted: (tourId) => {
    return get().wishlist.some((item) => item.id === tourId);
  },

  clearWishlist: () => set({ wishlist: [] }),
}));
