import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BLOG_ARTICLES, type EthiopianEvent, type BlogArticle } from '@/services/mockEventsData';

export interface CustomDestinationOption {
  id: string;
  name: string;
  region: string;
  pricePerDay: number;
  image: string;
  description?: string;
  highlights?: string[];
  isActive: boolean;
}

export interface CustomTripInquiry {
  id: string;
  destinations: string[];
  destinationsNames: string;
  tripDays: number;
  travelersCount: number;
  startDate: string;
  accommodationTier: 'luxury' | 'standard' | 'budget';
  transportType: 'landcruiser' | 'flight' | 'bus';
  estimatedPerPerson: number;
  totalEstimatedPrice: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  status: 'pending' | 'quoted' | 'confirmed' | 'cancelled';
}

export interface CustomTripPricingConfig {
  tierMultipliers: {
    luxury: number;
    standard: number;
    budget: number;
  };
  transportRates: {
    landcruiserPerDay: number;
    flightFixedRate: number;
    busFixedRate: number;
  };
}

const DEFAULT_DESTINATIONS: CustomDestinationOption[] = [
  { id: 'wenchi', name: 'Wenchi Crater Lake', region: 'Oromia', pricePerDay: 150, image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800', description: 'Emerald caldera lake with thermal hot springs and boat tours', isActive: true },
  { id: 'lalibela', name: 'Lalibela Rock Churches', region: 'Amhara', pricePerDay: 180, image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800', description: '12th-century UNESCO subterranean monolithic rock-hewn cathedrals', isActive: true },
  { id: 'simien', name: 'Simien Mountains Trekking', region: 'Amhara', pricePerDay: 160, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', description: 'Jagged highland escarpments and endemic Gelada baboon safaris', isActive: true },
  { id: 'danakil', name: 'Danakil & Erta Ale Volcano', region: 'Afar', pricePerDay: 220, image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800', description: 'Active lava lake, neon hydrothermal sulfur pools, and salt pans', isActive: true },
  { id: 'bale', name: 'Bale Mountains Safari', region: 'Oromia', pricePerDay: 140, image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', description: 'Afro-alpine habitat of the endangered Ethiopian Red Wolf and Harenna cloud forest', isActive: true },
  { id: 'harar', name: 'Harar Jugol City', region: 'Harari', pricePerDay: 130, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', description: 'Historic 16th-century walled Islamic city and nocturnal wild hyena feeding', isActive: true },
];

const DEFAULT_PRICING_CONFIG: CustomTripPricingConfig = {
  tierMultipliers: {
    luxury: 1.4,
    standard: 1.0,
    budget: 0.8,
  },
  transportRates: {
    landcruiserPerDay: 120,
    flightFixedRate: 250,
    busFixedRate: 50,
  },
};

const DEFAULT_INQUIRIES: CustomTripInquiry[] = [
  {
    id: 'ct-101',
    destinations: ['wenchi', 'lalibela'],
    destinationsNames: 'Wenchi Crater Lake + Lalibela Rock Churches',
    tripDays: 5,
    travelersCount: 2,
    startDate: '2026-10-15',
    accommodationTier: 'luxury',
    transportType: 'landcruiser',
    estimatedPerPerson: 1455,
    totalEstimatedPrice: 2910,
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.vance@example.com',
    customerPhone: '+1 555-0192',
    createdAt: '2026-08-10',
    status: 'pending',
  },
  {
    id: 'ct-102',
    destinations: ['danakil', 'simien'],
    destinationsNames: 'Danakil & Erta Ale Volcano + Simien Mountains',
    tripDays: 7,
    travelersCount: 4,
    startDate: '2026-11-05',
    accommodationTier: 'standard',
    transportType: 'flight',
    estimatedPerPerson: 1392,
    totalEstimatedPrice: 5568,
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.org',
    customerPhone: '+44 20 7946 0991',
    createdAt: '2026-08-12',
    status: 'quoted',
  },
];

interface ContentStoreState {
  // Events
  events: EthiopianEvent[];
  addEvent: (event: Omit<EthiopianEvent, 'id'>) => EthiopianEvent;
  updateEvent: (id: string, updates: Partial<EthiopianEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleFeaturedEvent: (id: string) => void;

  // Blog Articles
  articles: BlogArticle[];
  addArticle: (article: Omit<BlogArticle, 'id'>) => BlogArticle;
  updateArticle: (id: string, updates: Partial<BlogArticle>) => void;
  deleteArticle: (id: string) => void;

  // Custom Trip Destinations & Settings
  customDestinations: CustomDestinationOption[];
  addCustomDestination: (dest: Omit<CustomDestinationOption, 'id'>) => CustomDestinationOption;
  updateCustomDestination: (id: string, updates: Partial<CustomDestinationOption>) => void;
  deleteCustomDestination: (id: string) => void;

  pricingConfig: CustomTripPricingConfig;
  updatePricingConfig: (updates: Partial<CustomTripPricingConfig>) => void;

  // Custom Trip Inquiries
  customTripInquiries: CustomTripInquiry[];
  addCustomTripInquiry: (inquiry: Omit<CustomTripInquiry, 'id' | 'createdAt' | 'status'>) => CustomTripInquiry;
  updateInquiryStatus: (id: string, status: CustomTripInquiry['status']) => void;
}

export const useContentStore = create<ContentStoreState>()(
  persist(
    (set, get) => ({
      // Events initial (empty - loaded from backend)
      events: [],
      addEvent: (eventData) => {
        const newEvent: EthiopianEvent = {
          ...eventData,
          id: `evt-${Date.now()}`,
        };
        set((state) => ({ events: [newEvent, ...state.events] }));
        return newEvent;
      },
      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },
      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },
      toggleFeaturedEvent: (id) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, isFeatured: !e.isFeatured } : e)),
        }));
      },

      // Blog Articles initial
      articles: BLOG_ARTICLES,
      addArticle: (articleData) => {
        const newArticle: BlogArticle = {
          ...articleData,
          id: `blog-${Date.now()}`,
          slug: articleData.slug || articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        };
        set((state) => ({ articles: [newArticle, ...state.articles] }));
        return newArticle;
      },
      updateArticle: (id, updates) => {
        set((state) => ({
          articles: state.articles.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
      },
      deleteArticle: (id) => {
        set((state) => ({
          articles: state.articles.filter((a) => a.id !== id),
        }));
      },

      // Custom Destinations
      customDestinations: DEFAULT_DESTINATIONS,
      addCustomDestination: (destData) => {
        const newDest: CustomDestinationOption = {
          ...destData,
          id: `dest-${Date.now()}`,
        };
        set((state) => ({ customDestinations: [...state.customDestinations, newDest] }));
        return newDest;
      },
      updateCustomDestination: (id, updates) => {
        set((state) => ({
          customDestinations: state.customDestinations.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        }));
      },
      deleteCustomDestination: (id) => {
        set((state) => ({
          customDestinations: state.customDestinations.filter((d) => d.id !== id),
        }));
      },

      pricingConfig: DEFAULT_PRICING_CONFIG,
      updatePricingConfig: (updates) => {
        set((state) => ({
          pricingConfig: { ...state.pricingConfig, ...updates },
        }));
      },

      // Inquiries
      customTripInquiries: DEFAULT_INQUIRIES,
      addCustomTripInquiry: (inquiryData) => {
        const newInquiry: CustomTripInquiry = {
          ...inquiryData,
          id: `ct-${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'pending',
        };
        set((state) => ({ customTripInquiries: [newInquiry, ...state.customTripInquiries] }));
        return newInquiry;
      },
      updateInquiryStatus: (id, status) => {
        set((state) => ({
          customTripInquiries: state.customTripInquiries.map((inq) =>
            inq.id === id ? { ...inq, status } : inq
          ),
        }));
      },
    }),
    {
      name: 'tms_content_storage_v2',
    }
  )
);
