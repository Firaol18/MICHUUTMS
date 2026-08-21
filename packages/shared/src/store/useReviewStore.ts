import { create } from 'zustand';
import { reviewService } from '@tms/shared/services/reviewService';

export interface UserReview {
  id: string;
  tourId: string;
  tourTitle: string;
  bookingRef?: string;
  authorName: string;
  authorEmail: string;
  avatarUrl?: string;
  rating?: number;
  overallRating: number;
  guideRating: number;
  guideName?: string;
  transportRating: number;
  accommodationRating: number;
  comment: string;
  date: string;
  category?: 'tour' | 'hotel' | 'guide';
  isVerifiedBooking?: boolean;
}

interface ReviewState {
  reviews: UserReview[];
  isLoading: boolean;
  fetchReviews: (tourId?: string) => Promise<void>;
  addReview: (review: Omit<UserReview, 'id' | 'date'>) => Promise<UserReview>;
  getReviewsForTour: (tourId: string) => UserReview[];
  getAverageRatingsForTour: (tourId: string) => {
    overall: number;
    guide: number;
    transport: number;
    accommodation: number;
    totalCount: number;
  };
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  isLoading: false,

  fetchReviews: async (tourId?: string) => {
    set({ isLoading: true });
    try {
      const data = await reviewService.getAll(tourId);
      set({ reviews: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addReview: async (newRev) => {
    const created = await reviewService.create(newRev);
    set((state) => ({ reviews: [created, ...state.reviews] }));
    return created;
  },

  getReviewsForTour: (tourId) => {
    const revs = get().reviews.filter((r) => r.tourId === tourId || !r.tourId);
    return revs;
  },

  getAverageRatingsForTour: (tourId) => {
    const tourRevs = get().getReviewsForTour(tourId);
    if (tourRevs.length === 0) {
      return { overall: 5.0, guide: 5.0, transport: 4.8, accommodation: 4.7, totalCount: 0 };
    }

    const sumOverall = tourRevs.reduce((acc, r) => acc + r.overallRating, 0);
    const sumGuide = tourRevs.reduce((acc, r) => acc + (r.guideRating || 5), 0);
    const sumTrans = tourRevs.reduce((acc, r) => acc + (r.transportRating || 4), 0);
    const sumAcc = tourRevs.reduce((acc, r) => acc + (r.accommodationRating || 5), 0);

    return {
      overall: Number((sumOverall / tourRevs.length).toFixed(1)),
      guide: Number((sumGuide / tourRevs.length).toFixed(1)),
      transport: Number((sumTrans / tourRevs.length).toFixed(1)),
      accommodation: Number((sumAcc / tourRevs.length).toFixed(1)),
      totalCount: tourRevs.length,
    };
  },
}));

// Initial auto-fetch
useReviewStore.getState().fetchReviews();
