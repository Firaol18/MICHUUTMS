import { create } from 'zustand';

export interface UserReview {
  id: string;
  tourId: string;
  tourTitle: string;
  authorName: string;
  authorEmail: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  category: 'tour' | 'hotel' | 'guide';
  targetName?: string;
  isVerifiedBooking?: boolean;
}

interface ReviewState {
  reviews: UserReview[];
  addReview: (review: Omit<UserReview, 'id' | 'date'>) => void;
  getReviewsForTour: (tourId: string) => UserReview[];
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [
    {
      id: 'rev-1',
      tourId: 'tour-101',
      tourTitle: 'Wenchi Crater Lake & Thermal Springs Expedition',
      authorName: 'Eleanor Vance',
      authorEmail: 'eleanor.vance@example.com',
      rating: 5,
      comment: 'An absolutely magical experience! The crater lake boat ride to the monastery island and the thermal hot springs were unforgettable. Ranger Abebe was super knowledgeable!',
      date: '2026-07-20',
      category: 'tour',
      isVerifiedBooking: true,
    },
    {
      id: 'rev-2',
      tourId: 'tour-104',
      tourTitle: 'Danakil Depression & Erta Ale Volcano Expedition',
      authorName: 'David Miller',
      authorEmail: 'david.m@example.com',
      rating: 5,
      comment: 'Standing on the rim of Erta Ale lava lake at midnight is something I will tell my grandkids about. Outstanding logistics by MICHUU!',
      date: '2026-08-02',
      category: 'tour',
      isVerifiedBooking: true,
    },
  ],

  addReview: (newRev) => {
    const created: UserReview = {
      ...newRev,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ reviews: [created, ...state.reviews] }));
  },

  getReviewsForTour: (tourId) => {
    return get().reviews.filter((r) => r.tourId === tourId);
  },
}));
