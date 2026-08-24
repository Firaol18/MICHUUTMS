import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { http } from '@tms/shared/services/apiClient';
import { BLOG_ARTICLES, type EthiopianEvent, type BlogArticle } from '@tms/shared/services/mockEventsData';

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
  fetchCustomDestinations: () => Promise<void>;
  addCustomDestination: (dest: Omit<CustomDestinationOption, 'id'>) => Promise<CustomDestinationOption>;
  updateCustomDestination: (id: string, updates: Partial<CustomDestinationOption>) => Promise<void>;
  deleteCustomDestination: (id: string) => Promise<void>;

  pricingConfig: CustomTripPricingConfig;
  fetchPricingConfig: () => Promise<void>;
  updatePricingConfig: (updates: Partial<CustomTripPricingConfig>) => Promise<void>;

  // Custom Trip Inquiries (Loaded strictly from real backend)
  customTripInquiries: CustomTripInquiry[];
  fetchCustomTripInquiries: () => Promise<void>;
  addCustomTripInquiry: (inquiry: Omit<CustomTripInquiry, 'id' | 'createdAt' | 'status'>) => Promise<CustomTripInquiry>;
  updateInquiryStatus: (id: string, status: CustomTripInquiry['status']) => Promise<void>;
  deleteCustomTripInquiry: (id: string) => Promise<void>;
}

export const useContentStore = create<ContentStoreState>()(
  persist(
    (set, get) => ({
      // Events (Loaded strictly from real backend)
      events: [],

      fetchEvents: async () => {
        try {
          const res = await http.get('/events');
          if (Array.isArray(res.data)) {
            const mapped: EthiopianEvent[] = res.data.map((e: any) => {
              // Extract region from location or tags if available
              const locMatch = typeof e.location === 'string' ? e.location.match(/\(([^)]+)\)$/) : null;
              const regionFromLoc = locMatch ? locMatch[1] : undefined;
              const region = e.region || regionFromLoc || (Array.isArray(e.tags) && e.tags[0]) || 'Oromia';

              const ethiopianDate = e.ethiopianDate || (Array.isArray(e.tags) ? e.tags.find((t: string) => t.includes('(') || t.includes('፲') || t.includes('፩') || t.includes('፳') || t.includes('፮')) : undefined);

              return {
                id: String(e.id),
                title: e.title,
                date: typeof e.eventDate === 'string' ? e.eventDate.split('T')[0] : (e.date || '2026-10-01'),
                endDate: e.endDate ? (typeof e.endDate === 'string' ? e.endDate.split('T')[0] : e.endDate) : undefined,
                ethiopianDate,
                location: e.location,
                region,
                category: e.category || 'cultural',
                description: e.description,
                imageUrl: e.imageUrl || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
                // status is auto-computed by backend from real dates
                status: e.status as 'upcoming' | 'ongoing' | 'completed',
                // isFeatured = isActive AND not already completed
                isFeatured: Boolean(e.isActive) && e.status !== 'completed',
                price: typeof e.price === 'number' ? e.price : 0,
                isFree: Boolean(e.isFree),
                hasOffer: Boolean(e.hasOffer),
                offerTag: e.offerTag ?? undefined,
                discountPercent: e.discountPercent ?? undefined,
                originalPrice: e.originalPrice ?? undefined,
                tipForVisitors: e.tipForVisitors,
                dressCode: e.dressCode,
              };
            });

            set({ events: mapped });
          } else {
            set({ events: [] });
          }
        } catch (error) {
          console.error('Failed to fetch events from backend API:', error);
          set({ events: [] });
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
            isActive: eventData.isFeatured !== false,
            price: eventData.price ?? 0,
            isFree: eventData.isFree ?? (!eventData.price || eventData.price === 0),
            hasOffer: eventData.hasOffer ?? false,
            offerTag: eventData.offerTag,
            discountPercent: eventData.discountPercent,
            originalPrice: eventData.originalPrice,
          });
          if (res.data) {
            const locMatch = typeof res.data.location === 'string' ? res.data.location.match(/\(([^)]+)\)$/) : null;
            const regionFromLoc = locMatch ? locMatch[1] : undefined;
            const region = res.data.region || regionFromLoc || (Array.isArray(res.data.tags) && res.data.tags[0]) || eventData.region || 'Oromia';
            const newEvent: EthiopianEvent = {
              ...eventData,
              id: String(res.data.id),
              region,
              price: typeof res.data.price === 'number' ? res.data.price : (eventData.price ?? 0),
              isFree: res.data.isFree ?? eventData.isFree ?? false,
              hasOffer: res.data.hasOffer ?? eventData.hasOffer ?? false,
              offerTag: res.data.offerTag ?? eventData.offerTag,
              discountPercent: res.data.discountPercent ?? eventData.discountPercent,
              originalPrice: res.data.originalPrice ?? eventData.originalPrice,
            };
            set((state) => ({ events: [newEvent, ...state.events] }));
            return newEvent;
          }
        } catch (error) {
          console.error('Failed to add event on backend:', error);
          throw error;
        }

        const newEvent: EthiopianEvent = {
          ...eventData,
          id: `evt-${Date.now()}`,
        };
        set((state) => ({ events: [newEvent, ...state.events] }));
        return newEvent;
      },

      updateEvent: async (id, updates) => {
        try {
          await http.patch(`/events/${id}`, {
            ...(updates.title && { title: updates.title }),
            ...(updates.description && { description: updates.description }),
            ...(updates.date && { eventDate: updates.date }),
            ...(updates.endDate !== undefined && { endDate: updates.endDate }),
            ...(updates.location && { location: updates.location }),
            ...(updates.category && { category: updates.category }),
            ...(updates.imageUrl && { imageUrl: updates.imageUrl }),
            ...(updates.isFeatured !== undefined && { isActive: updates.isFeatured }),
            ...(updates.price !== undefined && { price: updates.price }),
            ...(updates.isFree !== undefined && { isFree: updates.isFree }),
            ...(updates.hasOffer !== undefined && { hasOffer: updates.hasOffer }),
            ...(updates.offerTag !== undefined && { offerTag: updates.offerTag }),
            ...(updates.discountPercent !== undefined && { discountPercent: updates.discountPercent }),
            ...(updates.originalPrice !== undefined && { originalPrice: updates.originalPrice }),
          });
        } catch (error) {
          console.error('Failed to update event on backend:', error);
        }
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },

      deleteEvent: async (id) => {
        try {
          await http.delete(`/events/${id}`);
        } catch (error) {
          console.error('Failed to delete event on backend:', error);
        }
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },

      toggleFeaturedEvent: async (id) => {
        const current = get().events.find((e) => e.id === id);
        if (!current) return;
        const newFeatured = !current.isFeatured;
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, isFeatured: newFeatured } : e)),
        }));
        try {
          await http.patch(`/events/${id}`, { isActive: newFeatured });
        } catch (error) {
          console.error('Failed to toggle featured event on backend:', error);
        }
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
          await http.patch(`/blog/${id}`, {
            ...(updates.title && { title: updates.title }),
            ...(updates.slug && { slug: updates.slug }),
            ...(updates.excerpt && { excerpt: updates.excerpt }),
            ...(updates.content && { content: updates.content }),
            ...(updates.author && { authorName: updates.author }),
            ...(updates.authorAvatar && { authorAvatarUrl: updates.authorAvatar }),
            ...(updates.coverImage && { coverImageUrl: updates.coverImage }),
            ...(updates.category && { category: updates.category }),
            ...(updates.tags && { tags: updates.tags }),
            ...(updates.readMinutes !== undefined && { readTimeMinutes: updates.readMinutes }),
          });
        } catch (err) {
          console.error('Failed to update blog post on backend:', err);
        }
        set((state) => ({
          articles: state.articles.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
      },

      deleteArticle: async (id) => {
        try {
          await http.delete(`/blog/${id}`);
        } catch (err) {
          console.error('Failed to delete blog post on backend:', err);
        }
        set((state) => ({
          articles: state.articles.filter((a) => a.id !== id),
        }));
      },

      // Custom Destinations
      customDestinations: DEFAULT_DESTINATIONS,

      fetchCustomDestinations: async () => {
        try {
          const res = await http.get('/custom-trips/destinations/all');
          if (Array.isArray(res.data) && res.data.length > 0) {
            set({ customDestinations: res.data });
          }
        } catch {}
      },

      addCustomDestination: async (dest) => {
        try {
          const res = await http.post('/custom-trips/destinations', dest);
          if (res.data) {
            set((state) => ({ customDestinations: [...state.customDestinations, res.data] }));
            return res.data;
          }
        } catch {}
        const item = { ...dest, id: `dest-${Date.now()}` };
        set((state) => ({ customDestinations: [...state.customDestinations, item] }));
        return item;
      },

      updateCustomDestination: async (id, updates) => {
        try {
          await http.patch(`/custom-trips/destinations/${id}`, updates);
        } catch {}
        set((state) => ({
          customDestinations: state.customDestinations.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        }));
      },

      deleteCustomDestination: async (id) => {
        try {
          await http.delete(`/custom-trips/destinations/${id}`);
        } catch {}
        set((state) => ({
          customDestinations: state.customDestinations.filter((d) => d.id !== id),
        }));
      },

      pricingConfig: DEFAULT_PRICING_CONFIG,

      fetchPricingConfig: async () => {
        try {
          const res = await http.get('/custom-trips/pricing/config');
          if (res.data) {
            set({
              pricingConfig: {
                tierMultipliers: {
                  luxury: res.data.luxuryMultiplier ?? 1.4,
                  standard: res.data.standardMultiplier ?? 1.0,
                  budget: res.data.budgetMultiplier ?? 0.8,
                },
                transportRates: {
                  landcruiserPerDay: res.data.landcruiserPerDay ?? 120,
                  flightFixedRate: res.data.flightFixedRate ?? 250,
                  busFixedRate: res.data.busFixedRate ?? 50,
                },
              },
            });
          }
        } catch {}
      },

      updatePricingConfig: async (updates) => {
        set((state) => ({ pricingConfig: { ...state.pricingConfig, ...updates } }));
        try {
          const current = get().pricingConfig;
          await http.patch('/custom-trips/pricing/config', {
            luxuryMultiplier: current.tierMultipliers.luxury,
            standardMultiplier: current.tierMultipliers.standard,
            budgetMultiplier: current.tierMultipliers.budget,
            landcruiserPerDay: current.transportRates.landcruiserPerDay,
            flightFixedRate: current.transportRates.flightFixedRate,
            busFixedRate: current.transportRates.busFixedRate,
          });
        } catch {}
      },

      // Custom Trip Inquiries (Loaded strictly from real backend)
      customTripInquiries: [],

      fetchCustomTripInquiries: async () => {
        try {
          const res = await http.get('/custom-trips');
          if (Array.isArray(res.data)) {
            const mapped: CustomTripInquiry[] = res.data.map((c: any) => {
              const duration = c.durationDays || 5;
              const guests = c.groupSize || 2;
              const perPerson = c.estimatedPerPerson || (duration * 180);
              const total = c.totalEstimatedPrice || (perPerson * guests);
              return {
                id: String(c.id),
                destinations: Array.isArray(c.interests) ? c.interests : [],
                destinationsNames: c.destination || 'Custom Ethiopian Expedition',
                tripDays: duration,
                travelersCount: guests,
                startDate: typeof c.preferredStartDate === 'string' ? c.preferredStartDate.split('T')[0] : (c.preferredStartDate || '2026-10-01'),
                accommodationTier: (c.budget === 'luxury' || c.budget === 'budget') ? c.budget : 'standard',
                transportType: 'landcruiser',
                estimatedPerPerson: perPerson,
                totalEstimatedPrice: total,
                customerName: c.name || 'Traveler',
                customerEmail: c.email || '',
                customerPhone: c.phone || '',
                createdAt: typeof c.createdAt === 'string' ? c.createdAt.split('T')[0] : new Date(c.createdAt).toISOString().split('T')[0],
                status: c.status || 'pending',
              };
            });
            set({ customTripInquiries: mapped });
          } else {
            set({ customTripInquiries: [] });
          }
        } catch (error) {
          console.error('Failed to fetch custom trips from backend:', error);
          set({ customTripInquiries: [] });
        }
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
              status: res.data.status || 'pending',
            };
            set((state) => ({ customTripInquiries: [newInq, ...state.customTripInquiries] }));
            return newInq;
          }
        } catch (error) {
          console.error('Failed to submit custom trip to backend:', error);
        }

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
          await http.patch(`/custom-trips/${id}/status`, { status });
        } catch (error) {
          console.error('Failed to update custom trip status on backend:', error);
        }
        set((state) => ({
          customTripInquiries: state.customTripInquiries.map((inq) =>
            inq.id === id ? { ...inq, status } : inq
          ),
        }));
      },

      deleteCustomTripInquiry: async (id) => {
        try {
          await http.delete(`/custom-trips/${id}`);
        } catch (error) {
          console.error('Failed to delete custom trip on backend:', error);
        }
        set((state) => ({
          customTripInquiries: state.customTripInquiries.filter((inq) => inq.id !== id),
        }));
      },
    }),
    {
      name: 'michuu-tms-content',
    }
  )
);
