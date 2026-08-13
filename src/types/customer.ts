export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface PassportInfo {
  documentType: 'passport' | 'national_id' | 'other';
  documentNumber: string;
  issuingCountry: string;
  expiryDate: string;
  nationality: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface TravelPreferences {
  preferredTourTypes: string[];   // e.g. ['safari', 'cultural', 'mountain']
  dietaryNeeds: string;           // e.g. 'Vegetarian, Halal'
  languages: string[];            // e.g. ['English', 'Amharic']
  accessibilityNeeds: string;     // e.g. 'Wheelchair access required'
  preferredCurrency: string;      // e.g. 'USD ($)'
  accommodationPreference: string;// e.g. 'Luxury Lodge'
}

export interface CommunicationEntry {
  id: string;
  date: string;
  channel: 'email' | 'phone' | 'whatsapp' | 'in-app' | 'walk-in';
  subject: string;
  summary: string;
  staffName: string;
}

export function getLoyaltyTier(totalBookings: number): LoyaltyTier {
  if (totalBookings >= 15) return 'platinum';
  if (totalBookings >= 8) return 'gold';
  if (totalBookings >= 3) return 'silver';
  return 'bronze';
}

export function getNextTierThreshold(tier: LoyaltyTier): number {
  if (tier === 'bronze') return 3;
  if (tier === 'silver') return 8;
  if (tier === 'gold') return 15;
  return 15; // platinum — already max
}

export const LOYALTY_META: Record<LoyaltyTier, { label: string; color: string; bg: string; emoji: string; benefits: string[] }> = {
  bronze: {
    label: 'Bronze Member',
    color: '#92400e',
    bg: 'rgba(146,64,14,0.12)',
    emoji: '🥉',
    benefits: ['5% discount on next booking', 'Priority email support', 'Monthly travel newsletter'],
  },
  silver: {
    label: 'Silver Member',
    color: '#64748b',
    bg: 'rgba(100,116,139,0.12)',
    emoji: '🥈',
    benefits: ['10% discount on all tours', 'Dedicated phone support', 'Early access to new packages', 'Free airport transfer on 1 booking/year'],
  },
  gold: {
    label: 'Gold Member',
    color: '#b45309',
    bg: 'rgba(180,83,9,0.12)',
    emoji: '🥇',
    benefits: ['15% discount on all tours', 'VIP guide assignment', 'Complimentary room upgrades', 'Priority boarding', 'Exclusive members events'],
  },
  platinum: {
    label: 'Platinum Member',
    color: '#6d28d9',
    bg: 'rgba(109,40,217,0.12)',
    emoji: '💎',
    benefits: ['20% discount on all tours', 'Personal travel concierge', 'Complimentary helicopter transfer', 'Private group expeditions', 'Annual luxury gift hamper'],
  },
};

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  regDate: string;
  status: 'active' | 'blocked';
  // Extended fields
  passport?: PassportInfo;
  emergencyContact?: EmergencyContact;
  travelPreferences?: TravelPreferences;
  communicationHistory?: CommunicationEntry[];
  totalBookings: number;
  totalSpend: number;
  loyaltyTier: LoyaltyTier;
}
