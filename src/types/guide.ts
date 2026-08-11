export type GuideStatus = 'available' | 'on_tour' | 'off_duty';

export interface TourGuide {
  id: string;
  name: string;
  email: string;
  phone: string;
  languages: string[];
  rating: number;
  toursGuidedCount: number;
  avatarUrl: string;
  status: GuideStatus;
  specializations: string[];
}
