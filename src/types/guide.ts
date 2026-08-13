export type GuideStatus = 'available' | 'on_tour' | 'off_duty';

export interface GuideCertification {
  id: string;
  name: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  documentUrl?: string;
}

export interface GuideAvailability {
  date: string;        // ISO date string 'YYYY-MM-DD'
  isAvailable: boolean;
  note?: string;
}

export interface GuidePayment {
  id: string;
  tourTitle: string;
  bookingReference: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'withheld';
}

export interface TourGuide {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality?: string;
  bio?: string;
  experienceYears?: number;
  tourFee?: number;           // fee per tour day in USD
  languages: string[];
  rating: number;
  toursGuidedCount: number;
  avatarUrl: string;
  status: GuideStatus;
  specializations: string[];
  assignedTourIds?: string[];
  certifications?: GuideCertification[];
  availability?: GuideAvailability[];
  paymentHistory?: GuidePayment[];
}
