import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { http } from '@tms/shared/services/apiClient';
import { ETHIOPIAN_EVENTS, BLOG_ARTICLES, type EthiopianEvent, type BlogArticle } from '@tms/shared/services/mockEventsData';

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
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<EthiopianEvent, 'id'>) => Promise<EthiopianEvent>;
  updateEvent: (id: string, updates: Partial<EthiopianEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  toggleFeaturedEvent: (id: string) => void;

  // Blog Articles
  articles: BlogArticle[];
  fetchArticles: () => Promise<void>;
  addArticle: (article: Omit<BlogArticle, 'id'>) => Promise<BlogArticle>;
  updateArticle: (id: string, updates: Partial<BlogArticle>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;

  // Custom Trip Destinations & Settings
  customDestinations: CustomDestinationOption[];
  addCustomDestination: (dest: Omit<CustomDestinationOption, 'id'>) => CustomDestinationOption;
  updateCustomDestination: (id: string, updates: Partial<CustomDestinationOption>) => void;
  deleteCustomDestination: (id: string) => void;

  pricingConfig: CustomTripPricingConfig;
  updatePricingConfig: (updates: Partial<CustomTripPricingConfig>) => void;

  // Custom Trip Inquiries
  customTripInquiries: CustomTripInquiry[];
  fetchCustomTripInquiries: () => Promise<void>;
  addCustomTripInquiry: (inquiry: Omit<CustomTripInquiry, 'id' | 'createdAt' | 'status'>) => Promise<CustomTripInquiry>;
  updateInquiryStatus: (id: string, status: CustomTripInquiry['status']) => Promise<void>;
}

export const useContentStore = create<ContentStoreState>()(
  persist(
    (set) => ({
      // Events
      events: ETHIOPIAN_EVENTS,

      fetchEvents: async () => {
        try {
          const res = await http.get('/events');
          if (Array.isArray(res.data) && res.data.length > 0) {
            const mapped: EthiopianEvent[] = res.data.map((e: any) => ({
              id: String(e.id),
              title: e.title,
              date: e.eventDate,
              endDate: e.endDate,
              location: e.location,
              region: 'Oromia',
              category: e.category || 'cultural',
              description: e.description,
              imageUrl: e.imageUrl || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
              isFeatured: Boolean(e.isActive),
            }));
            set({ events: mapped });
          }
        } catch {
          // fallback to local
        }
      },

      addEvent: async (eventData) => {
        try {
          const res = await http.post('/events', {
            title: eventData.title,
            description: eventData.description,
            eventDate: eventData.date,
            endDate: eventData.endDate,
            location: eventData.location,
            category: eventData.category,
            imageUrl: eventData.imageUrl,
          });
          if (res.data) {
            const newEvent: EthiopianEvent = {
              ...eventData,
              id: String(res.data.id),
            };
            set((state) => ({ events: [newEvent, ...state.events] }));
            return newEvent;
          }
        } catch {}

        const newEvent: EthiopianEvent = {
          ...eventData,
          id: `evt-${Date.now()}`,
        };
        set((state) => ({ events: [newEvent, ...state.events] }));
        return newEvent;
      },

      updateEvent: async (id, updates) => {
        try {
          const numId = Number(id);
          if (!isNaN(numId)) {
            await http.patch(`/events/${numId}`, updates);
          }
        } catch {}
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },

      deleteEvent: async (id) => {
        try {
          const numId = Number(id);
          if (!isNaN(numId)) {
            await http.delete(`/events/${numId}`);
          }
        } catch {}
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },

      toggleFeaturedEvent: (id) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, isFeatured: !e.isFeatured } : e)),
        }));
      },

      // Blog Articles
      articles: BLOG_ARTICLES,

      fetchArticles: async () => {
        try {
          const res = await http.get('/blog');
          if (Array.isArray(res.data) && res.data.length > 0) {
            const mapped: BlogArticle[] = res.data.map((b: any) => ({
              id: String(b.id),
              slug: b.slug,
              title: b.title,
              excerpt: b.excerpt,
              content: b.content,
              author: b.authorName,
              authorAvatar: b.authorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
              publishedAt: typeof b.publishedAt === 'string' ? b.publishedAt : new Date(b.publishedAt).toISOString().split('T')[0],
              readMinutes: Number(b.readTimeMinutes) || 5,
              coverImage: b.coverImageUrl || 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200',
              tags: b.tags || [],
              category: b.category || 'culture',
            }));
            set({ articles: mapped });
          }
        } catch {}
      },

      addArticle: async (articleData) => {
        const slug = articleData.slug || articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        try {
          const res = await http.post('/blog', {
            title: articleData.title,
            slug,
            excerpt: articleData.excerpt,
            content: articleData.content,
            authorName: articleData.author,
            authorAvatarUrl: articleData.authorAvatar,
            coverImageUrl: articleData.coverImage,
            category: articleData.category,
            tags: articleData.tags,
            readTimeMinutes: articleData.readMinutes,
          });
          if (res.data) {
            const newArticle: BlogArticle = {
              ...articleData,
              id: String(res.data.id),
              slug,
            };
            set((state) => ({ articles: [newArticle, ...state.articles] }));
            return newArticle;
          }
        } catch {}

        const newArticle: BlogArticle = {
          ...articleData,
          id: `blog-${Date.now()}`,
          slug,
        };
        set((state) => ({ articles: [newArticle, ...state.articles] }));
        return newArticle;
      },

      updateArticle: async (id, updates) => {
        try {
          const numId = Number(id);
          if (!isNaN(numId)) {
            await http.patch(`/blog/${numId}`, updates);
          }
        } catch {}
        set((state) => ({
          articles: state.articles.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
      },

      deleteArticle: async (id) => {
        try {
          const numId = Number(id);
          if (!isNaN(numId)) {
            await http.delete(`/blog/${numId}`);
          }
        } catch {}
        set((state) => ({
          articles: state.articles.filter((a) => a.id !== id),
        }));
      },

      // Custom Destinations
      customDestinations: DEFAULT_DESTINATIONS,
      addCustomDestination: (dest) => {
        const item = { ...dest, id: `dest-${Date.now()}` };
        set((state) => ({ customDestinations: [...state.customDestinations, item] }));
        return item;
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
        set((state) => ({ pricingConfig: { ...state.pricingConfig, ...updates } }));
      },

      // Custom Trip Inquiries
      customTripInquiries: DEFAULT_INQUIRIES,

      fetchCustomTripInquiries: async () => {
        try {
          const res = await http.get('/custom-trips');
          if (Array.isArray(res.data)) {
            const mapped: CustomTripInquiry[] = res.data.map((c: any) => ({
              id: String(c.id),
              destinations: [],
              destinationsNames: c.destination,
              tripDays: c.durationDays,
              travelersCount: c.groupSize,
              startDate: c.preferredStartDate,
              accommodationTier: 'standard',
              transportType: 'landcruiser',
              estimatedPerPerson: 1200,
              totalEstimatedPrice: 1200 * c.groupSize,
              customerName: c.name,
              customerEmail: c.email,
              customerPhone: c.phone,
              createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date(c.createdAt).toISOString().split('T')[0],
              status: c.status,
            }));
            set({ customTripInquiries: mapped });
          }
        } catch {}
      },

      addCustomTripInquiry: async (inquiry) => {
        try {
          const res = await http.post('/custom-trips', {
            name: inquiry.customerName || 'Traveler',
            email: inquiry.customerEmail || 'traveler@example.com',
            phone: inquiry.customerPhone || '',
            destination: inquiry.destinationsNames,
            durationDays: inquiry.tripDays,
            groupSize: inquiry.travelersCount,
            preferredStartDate: inquiry.startDate || new Date().toISOString().split('T')[0],
            budget: inquiry.accommodationTier,
            interests: inquiry.destinations,
          });
          if (res.data) {
            const newInq: CustomTripInquiry = {
              ...inquiry,
              id: String(res.data.id),
              createdAt: new Date().toISOString().split('T')[0],
              status: 'pending',
            };
            set((state) => ({ customTripInquiries: [newInq, ...state.customTripInquiries] }));
            return newInq;
          }
        } catch {}

        const newInq: CustomTripInquiry = {
          ...inquiry,
          id: `ct-${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'pending',
        };
        set((state) => ({ customTripInquiries: [newInq, ...state.customTripInquiries] }));
        return newInq;
      },

      updateInquiryStatus: async (id, status) => {
        try {
          const numId = Number(id);
          if (!isNaN(numId)) {
            await http.patch(`/custom-trips/${numId}/status`, { status });
          }
        } catch {}
        set((state) => ({
          customTripInquiries: state.customTripInquiries.map((inq) =>
            inq.id === id ? { ...inq, status } : inq
          ),
        }));
      },
    }),
    {
      name: 'michuu-tms-content',
    }
  )
);
