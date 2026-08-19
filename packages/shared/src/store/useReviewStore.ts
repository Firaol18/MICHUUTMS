import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserReview {
  id: string;
  tourId: string;
  tourTitle: string;
  bookingRef?: string;
  authorName: string;
  authorEmail: string;
  avatarUrl?: string;
  rating?: number;             // Backward compatibility overall rating
  overallRating: number;       // Overall 1 to 5 stars
  guideRating: number;         // Guide 1 to 5 stars
  guideName?: string;          // e.g. "Abebe Bekele"
  transportRating: number;     // Transportation 1 to 5 stars
  accommodationRating: number; // Accommodation 1 to 5 stars
  comment: string;
  date: string;
  category?: 'tour' | 'hotel' | 'guide';
  isVerifiedBooking?: boolean;
}

interface ReviewState {
  reviews: UserReview[];
  addReview: (review: Omit<UserReview, 'id' | 'date'>) => void;
  getReviewsForTour: (tourId: string) => UserReview[];
  getAverageRatingsForTour: (tourId: string) => {
    overall: number;
    guide: number;
    transport: number;
    accommodation: number;
    totalCount: number;
  };
}

const INITIAL_REVIEWS: UserReview[] = [
  {
    id: 'rev-1',
    tourId: 'tour-101',
    tourTitle: 'Wenchi Crater Lake & Thermal Springs Expedition',
    bookingRef: 'MCH-BKG-8819',
    authorName: 'Eleanor Vance',
    authorEmail: 'eleanor.vance@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    overallRating: 5,
    guideRating: 5,
    guideName: 'Abebe Bekele',
    transportRating: 4,
    accommodationRating: 5,
    comment: 'An absolutely magical experience! The crater lake boat ride to the monastery island and the thermal hot springs were unforgettable. Ranger Abebe was super knowledgeable and friendly!',
    date: '2026-07-20',
    isVerifiedBooking: true,
  },
  {
    id: 'rev-2',
    tourId: 'tour-101',
    tourTitle: 'Wenchi Crater Lake & Thermal Springs Expedition',
    bookingRef: 'MCH-BKG-4412',
    authorName: 'Sophia Rossi',
    authorEmail: 'sophia.r@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    overallRating: 5,
    guideRating: 5,
    guideName: 'Abebe Bekele',
    transportRating: 5,
    accommodationRating: 4,
    comment: 'The lush greenery and volcanic lake view were breathtaking. 4x4 Cruiser transport was comfortable on mountain roads. Highly recommend!',
    date: '2026-08-01',
    isVerifiedBooking: true,
  },
  {
    id: 'rev-3',
    tourId: 'tour-104',
    tourTitle: 'Danakil Depression & Erta Ale Volcano Expedition',
    bookingRef: 'MCH-BKG-7721',
    authorName: 'Mohammed Ahmed',
    authorEmail: 'm.ahmed@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    overallRating: 5,
    guideRating: 5,
    guideName: 'Mohammed Ahmed',
    transportRating: 5,
    accommodationRating: 4,
    comment: 'Standing on the rim of Erta Ale lava lake at midnight is something I will tell my grandkids about. Outstanding desert logistics by MICHUU!',
    date: '2026-08-05',
    isVerifiedBooking: true,
  },
  {
    id: 'rev-4',
    tourId: 'tour-102',
    tourTitle: 'Lalibela Monolithic Rock Churches Pilgrimage',
    bookingRef: 'MCH-BKG-3301',
    authorName: 'James Okonkwo',
    authorEmail: 'j.okonkwo@example.ng',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    overallRating: 5,
    guideRating: 5,
    guideName: 'Tigist Haile',
    transportRating: 4,
    accommodationRating: 5,
    comment: 'The architectural genius of Biete Ghiorgis is astounding. Tigist gave us deep historical and spiritual insights throughout our stay.',
    date: '2026-08-08',
    isVerifiedBooking: true,
  },
];

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: INITIAL_REVIEWS,

      addReview: (newRev) => {
        const created: UserReview = {
          ...newRev,
          rating: newRev.overallRating,
          id: `rev-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ reviews: [created, ...state.reviews] }));
      },

      getReviewsForTour: (tourId) => {
        return get().reviews.filter((r) => r.tourId === tourId || r.tourId === 'tour-101');
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
    }),
    {
      name: 'michuu-tms-reviews-v2',
    }
  )
);
