import { http } from './apiClient';
import { useNotificationStore } from '@/store/useNotificationStore';
import {
  INITIAL_TOURISM_METRICS,
  INITIAL_TOUR_PACKAGES,
  INITIAL_BOOKINGS,
  INITIAL_GUIDES,
  DESTINATIONS,
} from './mockTourismData';
import type { TourPackage, TourCategory, Destination } from '@/types/tour';
import type { Booking, BookingStatus, PaymentStatus, TravelerInfo } from '@/types/booking';
import type { TourGuide, GuideCertification, GuideAvailability, GuidePayment } from '@/types/guide';
import type { MetricCardData } from '@/types/common';

export interface IssueTicket {
  id: string;
  ticketId: string;
  reportedBy: string;
  email: string;
  issueType: string;
  description: string;
  dateReported: string;
  status: 'open' | 'in_progress' | 'resolved' | 'rejected';
  adminReason?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface EnquiryRecord {
  id: string;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  date: string;
  status: 'unread' | 'read' | 'replied';
}

const INITIAL_ISSUES: IssueTicket[] = [
  { id: 'iss-1', ticketId: 'ISS-801', reportedBy: 'Eleanor Vance', email: 'eleanor.vance@example.com', issueType: 'Booking Issues', description: 'Deposit clarification for Wenchi Crater Lake tour.', dateReported: '2026-08-09', status: 'open' },
  { id: 'iss-2', ticketId: 'ISS-802', reportedBy: 'Liam Hemsworth', email: 'liam.h@example.co.uk', issueType: 'Cancellation', description: 'Requesting +2 days extension for Simien Mountains trek.', dateReported: '2026-08-08', status: 'in_progress' },
  { id: 'iss-3', ticketId: 'ISS-803', reportedBy: 'Sophia Rossi', email: 'sophia.r@example.it', issueType: 'Refund', description: 'Fasting vegan meal plan for Lalibela Pilgrimage.', dateReported: '2026-08-05', status: 'resolved', adminReason: 'Meal plan updated with tour operator and chef notified.', resolvedAt: '2026-08-06', resolvedBy: 'Alex Morgan' },
  { id: 'iss-4', ticketId: 'ISS-804', reportedBy: 'Marcus Brody', email: 'm.brody@example.org', issueType: 'Cancellation', description: 'Full refund request past 24-hour non-refundable deadline.', dateReported: '2026-08-03', status: 'rejected', adminReason: 'Cancellation requested past non-refundable 24-hour cutoff per Policy §4.2.', resolvedAt: '2026-08-04', resolvedBy: 'Alex Morgan' },
];

const INITIAL_ENQUIRIES: EnquiryRecord[] = [
  { id: 'enq-1', name: 'David Miller', email: 'david.m@example.com', mobile: '+1 (555) 441-2091', subject: 'Private Danakil Lava Lake Expedition', message: 'Looking for a private 8-person charter to Danakil & Erta Ale in October.', date: '2026-08-10', status: 'unread' },
  { id: 'enq-2', name: 'Claire Dupont', email: 'claire.d@example.fr', mobile: '+33 1 42 68 55 00', subject: 'Corporate Retreat at Wenchi Eco-Lodge', message: 'Inquiring about resort room block reservations for 25 executives in Oromia.', date: '2026-08-07', status: 'read' },
  { id: 'enq-3', name: 'Kenji Sato', email: 'kenji.s@example.jp', mobile: '+81 3 1234 5678', subject: 'Lalibela Cultural Coffee Ceremony', message: 'Can we request a private coffee ceremony master for a family of 4 in Lalibela?', date: '2026-08-04', status: 'replied' },
];

// Helper functions for localStorage fallback
const STORAGE_KEYS = {
  TOURS: 'michuu_tours',
  BOOKINGS: 'michuu_bookings',
  ISSUES: 'michuu_issues',
  ENQUIRIES: 'michuu_enquiries',
  GUIDES: 'michuu_guides',
};

function loadStoredData<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveStoredData<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

function mapBackendTour(t: any): TourPackage {
  return {
    id: String(t.id),
    title: t.title,
    slug: t.slug,
    category: t.category,
    destination: {
      id: `dest-${t.id}`,
      name: t.destinationName || '',
      country: t.destinationCountry || 'Ethiopia',
      region: t.destinationRegion || '',
      imageUrl: t.destinationImageUrl || t.imageUrl || '',
      description: t.destinationDescription || '',
    },
    pricePerPerson: Number(t.pricePerPerson),
    durationDays: Number(t.durationDays),
    maxGroupSize: Number(t.maxGroupSize),
    difficulty: t.difficulty,
    rating: Number(t.rating) || 5.0,
    reviewCount: Number(t.reviewCount) || 0,
    imageUrl: t.imageUrl || '',
    galleryImages: Array.isArray(t.galleryImages) ? t.galleryImages : [],
    summary: t.summary || '',
    included: Array.isArray(t.included) ? t.included : [],
    excluded: Array.isArray(t.excluded) ? t.excluded : [],
    itinerary: Array.isArray(t.itinerary) ? t.itinerary : [],
    isFeatured: Boolean(t.isFeatured),
    status: t.status || 'active',
    originalPrice: t.originalPrice ? Number(t.originalPrice) : undefined,
    discountPercent: t.discountPercent ? Number(t.discountPercent) : undefined,
    offerTag: t.offerTag,
    hasOffer: Boolean(t.hasOffer),
    assignedGuideId: t.assignedGuideId,
    assignedGuideName: t.assignedGuideName,
  };
}

function mapBackendBooking(b: any): Booking {
  return {
    id: String(b.id),
    bookingReference: b.bookingReference,
    tourPackageId: String(b.tourId || b.tourPackageId),
    tourTitle: b.tourTitle,
    destinationName: b.destinationName,
    traveler: b.traveler,
    travelDate: typeof b.travelDate === 'string' ? b.travelDate : new Date(b.travelDate).toISOString().split('T')[0],
    numberOfTravelers: Number(b.numberOfTravelers),
    numberOfAdults: Number(b.numberOfAdults || b.numberOfTravelers),
    numberOfChildren: Number(b.numberOfChildren || 0),
    totalPrice: Number(b.totalPrice),
    status: b.status,
    paymentStatus: b.paymentStatus,
    bookingDate: typeof b.bookingDate === 'string' ? b.bookingDate : new Date(b.bookingDate).toISOString().split('T')[0],
    assignedGuideId: b.assignedGuideId,
    assignedGuideName: b.assignedGuideName,
    cancellationReason: b.cancellationReason,
    refundStatus: b.refundStatus,
  };
}

class TourismService {
  private tours: TourPackage[] = loadStoredData(STORAGE_KEYS.TOURS, INITIAL_TOUR_PACKAGES);
  private bookings: Booking[] = loadStoredData(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  private guides: TourGuide[] = loadStoredData(STORAGE_KEYS.GUIDES, INITIAL_GUIDES);
  private issues: IssueTicket[] = loadStoredData(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
  private enquiries: EnquiryRecord[] = loadStoredData(STORAGE_KEYS.ENQUIRIES, INITIAL_ENQUIRIES);

  async getMetrics(): Promise<MetricCardData[]> {
    return INITIAL_TOURISM_METRICS;
  }

  async getDestinations(): Promise<Destination[]> {
    return DESTINATIONS;
  }

  async getTours(categoryFilter?: TourCategory | 'all', searchQuery?: string): Promise<TourPackage[]> {
    try {
      const params: any = {};
      if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter;
      if (searchQuery && searchQuery.trim() !== '') params.search = searchQuery.trim();

      const res = await http.get('/tours', { params });
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        return res.data.data.map(mapBackendTour);
      }
    } catch {
      // Backend offline fallback
    }

    let result = [...this.tours];
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.destination.name.toLowerCase().includes(q) ||
          t.destination.country.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q)
      );
    }
    return result;
  }

  async getTourById(id: string): Promise<TourPackage | null> {
    try {
      const res = await http.get(`/tours/${id}`);
      if (res.data) {
        return mapBackendTour(res.data);
      }
    } catch {
      // Backend offline fallback
    }

    return this.tours.find((t) => t.id === id || t.slug === id) || null;
  }

  async createTourPackage(newTour: Omit<TourPackage, 'id' | 'rating' | 'reviewCount'>): Promise<TourPackage> {
    const payload = {
      ...newTour,
      destinationName: newTour.destination.name,
      destinationCountry: newTour.destination.country,
      destinationRegion: newTour.destination.region,
      destinationImageUrl: newTour.destination.imageUrl,
      destinationDescription: newTour.destination.description,
    };

    try {
      const res = await http.post('/tours', payload);
      if (res.data) {
        const created = mapBackendTour(res.data);
        this.tours.unshift(created);
        saveStoredData(STORAGE_KEYS.TOURS, this.tours);
        return created;
      }
    } catch {
      // Local fallback
    }

    const tour: TourPackage = {
      ...newTour,
      id: `tour-${Math.floor(1000 + Math.random() * 9000)}`,
      rating: 5.0,
      reviewCount: 1,
    };
    this.tours.unshift(tour);
    saveStoredData(STORAGE_KEYS.TOURS, this.tours);
    return tour;
  }

  async updateTourPackage(id: string, updated: Partial<TourPackage>): Promise<TourPackage | null> {
    try {
      const res = await http.patch(`/tours/${id}`, updated);
      if (res.data) {
        const item = mapBackendTour(res.data);
        const idx = this.tours.findIndex((t) => t.id === id);
        if (idx !== -1) this.tours[idx] = item;
        saveStoredData(STORAGE_KEYS.TOURS, this.tours);
        return item;
      }
    } catch {
      // Fallback
    }

    const idx = this.tours.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.tours[idx] = { ...this.tours[idx], ...updated };
    saveStoredData(STORAGE_KEYS.TOURS, this.tours);
    return this.tours[idx];
  }

  async deleteTourPackage(id: string): Promise<boolean> {
    try {
      await http.delete(`/tours/${id}`);
    } catch {
      // Fallback
    }
    this.tours = this.tours.filter((t) => t.id !== id);
    saveStoredData(STORAGE_KEYS.TOURS, this.tours);
    return true;
  }

  async getBookings(statusFilter?: BookingStatus | 'all', search?: string): Promise<Booking[]> {
    try {
      const params: any = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (search && search.trim() !== '') params.search = search.trim();

      const res = await http.get('/bookings', { params });
      let items: any[] = [];
      if (res.data && Array.isArray(res.data.data)) {
        items = res.data.data;
      } else if (Array.isArray(res.data)) {
        items = res.data;
      }

      if (items.length > 0) {
        const mapped = items.map(mapBackendBooking);
        this.bookings = mapped;
        saveStoredData(STORAGE_KEYS.BOOKINGS, mapped);
        return mapped;
      }
    } catch {
      // Backend offline fallback
    }

    let result = [...this.bookings];
    if (statusFilter && statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter);
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.bookingReference.toLowerCase().includes(q) ||
          b.traveler.name.toLowerCase().includes(q) ||
          b.traveler.email.toLowerCase().includes(q) ||
          b.tourTitle.toLowerCase().includes(q)
      );
    }
    return result;
  }

  async createBooking(
    tourPackageId: string,
    traveler: TravelerInfo,
    travelDate: string,
    numberOfTravelers: number,
    numberOfAdults?: number,
    numberOfChildren?: number
  ): Promise<Booking> {
    const tour = this.tours.find((t) => t.id === tourPackageId || t.slug === tourPackageId);
    const pricePerPerson = tour ? tour.pricePerPerson : 1500;
    const tourTitle = tour ? tour.title : 'Custom Luxury Expedition';
    const destinationName = tour ? `${tour.destination.name}, ${tour.destination.country}` : 'Ethiopian Destination';

    const numTourId = parseInt(String(tourPackageId).replace(/\D/g, ''), 10) || 1;
    const adults = numberOfAdults ?? numberOfTravelers;
    const children = numberOfChildren ?? 0;

    const payload = {
      tourId: numTourId,
      tourTitle,
      destinationName,
      traveler,
      travelDate,
      numberOfTravelers,
      numberOfAdults: adults,
      numberOfChildren: children,
    };

    try {
      const res = await http.post('/bookings', payload);
      if (res.data) {
        const created = mapBackendBooking(res.data);
        this.bookings.unshift(created);
        saveStoredData(STORAGE_KEYS.BOOKINGS, this.bookings);

        // 🔔 Dispatch in-app notifications
        try {
          const notifStore = useNotificationStore.getState();
          notifStore.notifyCustomer(
            traveler.email,
            'booking_confirmation',
            'Reservation Confirmed! 🎟️',
            `Your booking for ${created.tourTitle} (Ref #${created.bookingReference}) is confirmed for ${numberOfTravelers} guest(s).`,
            created.bookingReference,
            '/my-bookings'
          );
          notifStore.notifyAdmin(
            'admin_new_booking',
            `NEW BOOKING: Ref #${created.bookingReference} 🔔`,
            `${traveler.name} booked ${created.tourTitle} ($${created.totalPrice.toLocaleString()}).`,
            created.bookingReference,
            '/admin/bookings'
          );
        } catch {}

        return created;
      }
    } catch (e) {
      console.warn('Backend booking creation failed, using fallback:', e);
    }

    const newBooking: Booking = {
      id: `bk-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingReference: `MCH-BKG-${Math.floor(1000 + Math.random() * 9000)}`,
      tourPackageId,
      tourTitle,
      destinationName,
      traveler,
      travelDate,
      numberOfTravelers,
      numberOfAdults: adults,
      numberOfChildren: children,
      totalPrice: pricePerPerson * numberOfTravelers,
      status: 'pending',
      paymentStatus: 'unpaid',
      bookingDate: new Date().toISOString().split('T')[0],
      assignedGuideName: 'Abebe Bekele',
      refundStatus: 'none',
    };

    this.bookings.unshift(newBooking);
    saveStoredData(STORAGE_KEYS.BOOKINGS, this.bookings);

    try {
      const notifStore = useNotificationStore.getState();
      notifStore.notifyCustomer(
        traveler.email,
        'booking_confirmation',
        'Reservation Confirmed! 🎟️',
        `Your booking for ${newBooking.tourTitle} (Ref #${newBooking.bookingReference}) is confirmed for ${numberOfTravelers} guest(s).`,
        newBooking.bookingReference,
        '/my-bookings'
      );
      notifStore.notifyAdmin(
        'admin_new_booking',
        `NEW BOOKING: Ref #${newBooking.bookingReference} 🔔`,
        `${traveler.name} booked ${newBooking.tourTitle} ($${newBooking.totalPrice.toLocaleString()}).`,
        newBooking.bookingReference,
        '/admin/bookings'
      );
    } catch {}

    return newBooking;
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    try {
      const numId = parseInt(String(id).replace(/\D/g, ''), 10);
      const url = !isNaN(numId) ? `/bookings/${numId}/status` : `/bookings/${id}/status`;
      const res = await http.patch(url, { status });
      if (res.data) {
        const item = mapBackendBooking(res.data);
        const idx = this.bookings.findIndex((b) => b.id === id || b.id === String(numId));
        if (idx !== -1) this.bookings[idx] = item;
        saveStoredData(STORAGE_KEYS.BOOKINGS, this.bookings);
        return item;
      }
    } catch {}

    const idx = this.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.bookings[idx] = { ...this.bookings[idx], status };
    saveStoredData(STORAGE_KEYS.BOOKINGS, this.bookings);
    return this.bookings[idx];
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Booking | null> {
    try {
      const numId = parseInt(String(id).replace(/\D/g, ''), 10);
      const url = !isNaN(numId) ? `/bookings/${numId}/payment-status` : `/bookings/${id}/payment-status`;
      const res = await http.patch(url, { paymentStatus });
      if (res.data) {
        const item = mapBackendBooking(res.data);
        const idx = this.bookings.findIndex((b) => b.id === id || b.id === String(numId));
        if (idx !== -1) this.bookings[idx] = item;
        saveStoredData(STORAGE_KEYS.BOOKINGS, this.bookings);
        return item;
      }
    } catch {}

    const idx = this.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.bookings[idx] = { ...this.bookings[idx], paymentStatus };
    saveStoredData(STORAGE_KEYS.BOOKINGS, this.bookings);
    return this.bookings[idx];
  }

  async cancelBookingWithRefund(
    id: string,
    reason: string,
    requestRefund: boolean
  ): Promise<Booking | null> {
    try {
      const numId = parseInt(String(id).replace(/\D/g, ''), 10);
      const url = !isNaN(numId) ? `/bookings/${numId}/cancel` : `/bookings/${id}/cancel`;
      const res = await http.patch(url, { reason, requestRefund });
      if (res.data) {
        const item = mapBackendBooking(res.data);
        const idx = this.bookings.findIndex((b) => b.id === id || b.id === String(numId));
        if (idx !== -1) this.bookings[idx] = item;
        saveStoredData(STORAGE_KEYS.BOOKINGS, this.bookings);
        return item;
      }
    } catch {}

    const idx = this.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;

    const wasAlreadyPaid = this.bookings[idx].paymentStatus === 'paid';
    this.bookings[idx] = {
      ...this.bookings[idx],
      status: 'cancelled',
      cancellationReason: reason,
      paymentStatus: wasAlreadyPaid && requestRefund ? 'refunded' : this.bookings[idx].paymentStatus,
      refundStatus: wasAlreadyPaid && requestRefund ? 'pending' : 'none',
    };
    saveStoredData(STORAGE_KEYS.BOOKINGS, this.bookings);
    return this.bookings[idx];
  }

  async assignGuideToBooking(bookingId: string, guideName: string): Promise<Booking | null> {
    try {
      const numId = parseInt(String(bookingId).replace(/\D/g, ''), 10);
      const url = !isNaN(numId) ? `/bookings/${numId}/assign-guide` : `/bookings/${bookingId}/assign-guide`;
      const res = await http.patch(url, { assignedGuideName: guideName });
      if (res.data) {
        const item = mapBackendBooking(res.data);
        const idx = this.bookings.findIndex((b) => b.id === bookingId || b.id === String(numId));
        if (idx !== -1) this.bookings[idx] = item;
        saveStoredData(STORAGE_KEYS.BOOKINGS, this.bookings);
        return item;
      }
    } catch {}

    const idx = this.bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    this.bookings[idx] = { ...this.bookings[idx], assignedGuideName: guideName };
    saveStoredData(STORAGE_KEYS.BOOKINGS, this.bookings);
    return this.bookings[idx];
  }

  async getGuides(): Promise<TourGuide[]> {
    try {
      const res = await http.get('/guides');
      if (Array.isArray(res.data)) {
        return res.data.map((g: any) => ({
          id: String(g.id),
          name: g.name,
          email: g.email,
          phone: g.phone,
          avatarUrl: g.avatarUrl,
          rating: Number(g.rating) || 5.0,
          toursGuidedCount: Number(g.toursGuidedCount) || 0,
          languages: Array.isArray(g.languages) ? g.languages : [],
          specializations: Array.isArray(g.specializations) ? g.specializations : [],
          certifications: Array.isArray(g.certifications) ? g.certifications : [],
          availability: Array.isArray(g.availability) ? g.availability : [],
          paymentHistory: Array.isArray(g.paymentHistory) ? g.paymentHistory : [],
          status: g.status || 'Active',
          tourFee: Number(g.tourFee) || 120,
        }));
      }
    } catch {}

    return [...this.guides];
  }

  async addGuide(data: Omit<TourGuide, 'id'>): Promise<TourGuide> {
    try {
      const res = await http.post('/guides', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        rating: data.rating,
        toursGuidedCount: data.toursGuidedCount,
        languages: data.languages,
        specializations: data.specializations,
        certifications: data.certifications,
        availability: data.availability,
        paymentHistory: data.paymentHistory,
        tourFee: data.tourFee,
      });
      if (res.data) {
        const item: TourGuide = { ...data, id: String(res.data.id) };
        this.guides.unshift(item);
        saveStoredData(STORAGE_KEYS.GUIDES, this.guides);
        return item;
      }
    } catch {}

    const newGuide: TourGuide = {
      ...data,
      id: `gd-${Date.now()}`,
      rating: data.rating || 5.0,
      toursGuidedCount: data.toursGuidedCount || 0,
      certifications: data.certifications || [],
      availability: data.availability || [],
      paymentHistory: data.paymentHistory || [],
    };
    this.guides.unshift(newGuide);
    saveStoredData(STORAGE_KEYS.GUIDES, this.guides);
    return newGuide;
  }

  async updateGuide(id: string, updates: Partial<TourGuide>): Promise<TourGuide | null> {
    try {
      const numId = Number(id);
      if (!isNaN(numId)) {
        await http.patch(`/guides/${numId}`, updates);
      }
    } catch {}

    const idx = this.guides.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    this.guides[idx] = { ...this.guides[idx], ...updates };
    saveStoredData(STORAGE_KEYS.GUIDES, this.guides);
    return this.guides[idx];
  }

  async deleteGuide(id: string): Promise<boolean> {
    try {
      const numId = Number(id);
      if (!isNaN(numId)) {
        await http.delete(`/guides/${numId}`);
      }
    } catch {}
    this.guides = this.guides.filter((g) => g.id !== id);
    saveStoredData(STORAGE_KEYS.GUIDES, this.guides);
    return true;
  }

  async addGuideCertification(guideId: string, cert: Omit<GuideCertification, 'id'>): Promise<TourGuide | null> {
    const idx = this.guides.findIndex((g) => g.id === guideId);
    if (idx === -1) return null;
    const newCert: GuideCertification = { ...cert, id: `cert-${Date.now()}` };
    const certs = [...(this.guides[idx].certifications || []), newCert];
    this.guides[idx] = { ...this.guides[idx], certifications: certs };
    saveStoredData(STORAGE_KEYS.GUIDES, this.guides);
    return this.guides[idx];
  }

  async addGuidePayment(guideId: string, payment: Omit<GuidePayment, 'id'>): Promise<TourGuide | null> {
    const idx = this.guides.findIndex((g) => g.id === guideId);
    if (idx === -1) return null;
    const newPay: GuidePayment = { ...payment, id: `pay-${Date.now()}` };
    const payments = [newPay, ...(this.guides[idx].paymentHistory || [])];
    this.guides[idx] = { ...this.guides[idx], paymentHistory: payments };
    saveStoredData(STORAGE_KEYS.GUIDES, this.guides);
    return this.guides[idx];
  }

  async updateGuideAvailability(guideId: string, availability: GuideAvailability[]): Promise<TourGuide | null> {
    const idx = this.guides.findIndex((g) => g.id === guideId);
    if (idx === -1) return null;
    this.guides[idx] = { ...this.guides[idx], availability };
    saveStoredData(STORAGE_KEYS.GUIDES, this.guides);
    return this.guides[idx];
  }

  async getIssueTickets(): Promise<IssueTicket[]> {
    try {
      const res = await http.get('/issues');
      if (Array.isArray(res.data)) {
        return res.data.map((i: any) => ({
          id: String(i.id),
          ticketId: i.ticketId,
          reportedBy: i.reportedBy,
          email: i.email,
          issueType: i.issueType,
          description: i.description,
          dateReported: typeof i.dateReported === 'string' ? i.dateReported : new Date(i.dateReported).toISOString().split('T')[0],
          status: i.status,
          adminReason: i.adminReason,
          resolvedAt: i.resolvedAt,
          resolvedBy: i.resolvedBy,
        }));
      }
    } catch {}

    return [...this.issues];
  }

  async createIssueTicket(data: { reportedBy: string; email: string; issueType: string; description: string }): Promise<IssueTicket> {
    try {
      const res = await http.post('/issues', data);
      if (res.data) {
        const item: IssueTicket = {
          id: String(res.data.id),
          ticketId: res.data.ticketId,
          reportedBy: res.data.reportedBy,
          email: res.data.email,
          issueType: res.data.issueType,
          description: res.data.description,
          dateReported: new Date().toISOString().split('T')[0],
          status: res.data.status || 'open',
        };
        this.issues.unshift(item);
        saveStoredData(STORAGE_KEYS.ISSUES, this.issues);
        return item;
      }
    } catch {}

    const newTicket: IssueTicket = {
      id: `iss-${Date.now()}`,
      ticketId: `ISS-${Math.floor(800 + Math.random() * 200)}`,
      reportedBy: data.reportedBy || 'Public Traveler',
      email: data.email || 'customer@example.com',
      issueType: data.issueType || 'Booking Issues',
      description: data.description || 'Customer support issue ticket.',
      dateReported: new Date().toISOString().split('T')[0],
      status: 'open',
    };
    this.issues.unshift(newTicket);
    saveStoredData(STORAGE_KEYS.ISSUES, this.issues);
    return newTicket;
  }

  async updateIssueStatus(
    id: string,
    status: 'open' | 'in_progress' | 'resolved' | 'rejected',
    adminReason?: string,
    resolvedBy?: string
  ): Promise<IssueTicket | null> {
    try {
      const res = await http.patch(`/issues/${id}/status`, { status, adminReason, resolvedBy });
      if (res.data) {
        const item: IssueTicket = {
          id: String(res.data.id),
          ticketId: res.data.ticketId,
          reportedBy: res.data.reportedBy,
          email: res.data.email,
          issueType: res.data.issueType,
          description: res.data.description,
          dateReported: typeof res.data.dateReported === 'string' ? res.data.dateReported : new Date(res.data.dateReported).toISOString().split('T')[0],
          status: res.data.status,
          adminReason: res.data.adminReason,
          resolvedAt: res.data.resolvedAt,
          resolvedBy: res.data.resolvedBy,
        };
        const idx = this.issues.findIndex((i) => i.id === id);
        if (idx !== -1) this.issues[idx] = item;
        saveStoredData(STORAGE_KEYS.ISSUES, this.issues);
        return item;
      }
    } catch {}

    const idx = this.issues.findIndex((i) => i.id === id);
    if (idx === -1) return null;

    const updatedTicket = {
      ...this.issues[idx],
      status,
      adminReason: adminReason !== undefined ? adminReason : this.issues[idx].adminReason,
      resolvedAt: new Date().toISOString().split('T')[0],
      resolvedBy: resolvedBy || 'Alex Morgan',
    };

    this.issues[idx] = updatedTicket;
    saveStoredData(STORAGE_KEYS.ISSUES, this.issues);
    return updatedTicket;
  }

  async getEnquiries(): Promise<EnquiryRecord[]> {
    try {
      const res = await http.get('/enquiries');
      if (Array.isArray(res.data)) {
        return res.data.map((e: any) => ({
          id: String(e.id),
          name: e.name,
          email: e.email,
          mobile: e.mobile,
          subject: e.subject,
          message: e.message,
          date: typeof e.date === 'string' ? e.date : new Date(e.date).toISOString().split('T')[0],
          status: e.status,
        }));
      }
    } catch {}

    return [...this.enquiries];
  }

  async createEnquiry(data: { name: string; email: string; mobile: string; subject: string; message: string }): Promise<EnquiryRecord> {
    try {
      const res = await http.post('/enquiries', data);
      if (res.data) {
        const item: EnquiryRecord = {
          id: String(res.data.id),
          name: res.data.name,
          email: res.data.email,
          mobile: res.data.mobile || '',
          subject: res.data.subject,
          message: res.data.message,
          date: new Date().toISOString().split('T')[0],
          status: res.data.status || 'unread',
        };
        this.enquiries.unshift(item);
        saveStoredData(STORAGE_KEYS.ENQUIRIES, this.enquiries);
        return item;
      }
    } catch {}

    const newEnquiry: EnquiryRecord = {
      id: `enq-${Date.now()}`,
      name: data.name,
      email: data.email,
      mobile: data.mobile || '+251 91 123 4567',
      subject: data.subject || 'Custom Expedition Inquiry',
      message: data.message,
      date: new Date().toISOString().split('T')[0],
      status: 'unread',
    };
    this.enquiries.unshift(newEnquiry);
    saveStoredData(STORAGE_KEYS.ENQUIRIES, this.enquiries);
    return newEnquiry;
  }

  async updateEnquiryStatus(id: string, status: 'unread' | 'read' | 'replied'): Promise<EnquiryRecord | null> {
    try {
      const res = await http.patch(`/enquiries/${id}/status`, { status });
      if (res.data) {
        const item: EnquiryRecord = {
          id: String(res.data.id),
          name: res.data.name,
          email: res.data.email,
          mobile: res.data.mobile || '',
          subject: res.data.subject,
          message: res.data.message,
          date: typeof res.data.date === 'string' ? res.data.date : new Date(res.data.date).toISOString().split('T')[0],
          status: res.data.status,
        };
        const idx = this.enquiries.findIndex((e) => e.id === id);
        if (idx !== -1) this.enquiries[idx] = item;
        saveStoredData(STORAGE_KEYS.ENQUIRIES, this.enquiries);
        return item;
      }
    } catch {}

    const idx = this.enquiries.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.enquiries[idx] = { ...this.enquiries[idx], status };
    saveStoredData(STORAGE_KEYS.ENQUIRIES, this.enquiries);
    return this.enquiries[idx];
  }

  async deleteEnquiry(id: string): Promise<boolean> {
    try {
      await http.delete(`/enquiries/${id}`);
    } catch {}
    this.enquiries = this.enquiries.filter((e) => e.id !== id);
    saveStoredData(STORAGE_KEYS.ENQUIRIES, this.enquiries);
    return true;
  }
}

export const tourismService = new TourismService();
