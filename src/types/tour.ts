export type TourCategory = 'safari' | 'cultural' | 'beach' | 'mountain' | 'city' | 'luxury';

export type DifficultyLevel = 'easy' | 'moderate' | 'challenging' | 'extreme';

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  mealsIncluded?: string[];
  accommodation?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  imageUrl: string;
  description: string;
}

export interface Review {
  id: string;
  authorName: string;
  avatarUrl?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface TourPackage {
  id: string;
  title: string;
  slug: string;
  category: TourCategory;
  destination: Destination;
  pricePerPerson: number;
  durationDays: number;
  maxGroupSize: number;
  difficulty: DifficultyLevel;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  galleryImages: string[];
  summary: string;
  included: string[];
  excluded: string[];
  itinerary: ItineraryDay[];
  isFeatured: boolean;
  status: 'active' | 'draft' | 'sold_out';
  originalPrice?: number;
  discountPercent?: number;
  offerTag?: string;
  hasOffer?: boolean;
  assignedGuideId?: string;
  assignedGuideName?: string;
  bookedSeats?: number;
  availableSlots?: number;
}
