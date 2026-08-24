import { http } from './apiClient';
import { useNotificationStore } from '@tms/shared/store/useNotificationStore';
import type { TourPackage, TourCategory, Destination } from '@tms/shared/types/tour';
import type { Booking, BookingStatus, PaymentStatus, TravelerInfo } from '@tms/shared/types/booking';
import type { TourGuide, GuideCertification, GuideAvailability, GuidePayment } from '@tms/shared/types/guide';
import type { MetricCardData } from '@tms/shared/types/common';

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

// ─────────────────────────────────────────────────────────────────────────────
// Data-shape mappers  (backend → frontend types)
// ─────────────────────────────────────────────────────────────────────────────

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
    paymentMethod: b.paymentMethod,
    paymentReceiptUrl: b.paymentReceiptUrl,
    transactionReference: b.transactionReference,
    bookingDate: typeof b.bookingDate === 'string' ? b.bookingDate : new Date(b.bookingDate).toISOString().split('T')[0],
    assignedGuideId: b.assignedGuideId,
    assignedGuideName: b.assignedGuideName,
    cancellationReason: b.cancellationReason,
    refundStatus: b.refundStatus,
  };
}

function mapBackendGuide(g: any): TourGuide {
  return {
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
    tourFee: Number(g.tourFee ?? g.dailyRate) || 120,
  };
}

function mapBackendIssue(i: any): IssueTicket {
  return {
    id: String(i.id),
    ticketId: i.ticketId,
    reportedBy: i.reportedBy,
    email: i.email,
    issueType: i.issueType,
    description: i.description,
    dateReported:
      typeof i.dateReported === 'string'
        ? i.dateReported.split('T')[0]
        : new Date(i.dateReported).toISOString().split('T')[0],
    status: i.status,
    adminReason: i.adminReason,
    resolvedAt: i.resolvedAt
      ? typeof i.resolvedAt === 'string'
        ? i.resolvedAt.split('T')[0]
        : new Date(i.resolvedAt).toISOString().split('T')[0]
      : undefined,
    resolvedBy: i.resolvedBy,
  };
}

function mapBackendEnquiry(e: any): EnquiryRecord {
  return {
    id: String(e.id),
    name: e.name,
    email: e.email,
    mobile: e.mobile || '',
    subject: e.subject,
    message: e.message,
    date:
      typeof e.date === 'string'
        ? e.date.split('T')[0]
        : new Date(e.date).toISOString().split('T')[0],
    status: e.status,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TourismService — 100% backend, zero fallbacks
// ─────────────────────────────────────────────────────────────────────────────

class TourismService {

  // ── Metrics ────────────────────────────────────────────────────────────────

  /** Dashboard KPI cards — requires GET /metrics endpoint on the backend */
  async getMetrics(): Promise<MetricCardData[]> {
    const res = await http.get('/metrics');
    return res.data;
  }

  // ── Destinations ───────────────────────────────────────────────────────────

  /** Derives distinct destinations from the tours table via GET /tours */
  async getDestinations(): Promise<Destination[]> {
    const res = await http.get('/tours', { params: { limit: 200 } });
    const tours: TourPackage[] = (res.data?.data ?? res.data ?? []).map(mapBackendTour);
    const seen = new Set<string>();
    return tours
      .filter((t) => {
        if (seen.has(t.destination.name)) return false;
        seen.add(t.destination.name);
        return true;
      })
      .map((t) => t.destination);
  }

  // ── Tours ──────────────────────────────────────────────────────────────────

  async getTours(categoryFilter?: TourCategory | 'all', searchQuery?: string): Promise<TourPackage[]> {
    const params: Record<string, string> = {};
    if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter;
    if (searchQuery && searchQuery.trim() !== '') params.search = searchQuery.trim();

    const res = await http.get('/tours', { params });
    const raw = res.data?.data ?? res.data ?? [];
    return (Array.isArray(raw) ? raw : []).map(mapBackendTour);
  }

  async getTourById(id: string): Promise<TourPackage | null> {
    const res = await http.get(`/tours/${id}`);
    return res.data ? mapBackendTour(res.data) : null;
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
    const res = await http.post('/tours', payload);
    return mapBackendTour(res.data);
  }

  async updateTourPackage(id: string, updated: Partial<TourPackage>): Promise<TourPackage | null> {
    const res = await http.patch(`/tours/${id}`, updated);
    return res.data ? mapBackendTour(res.data) : null;
  }

  async deleteTourPackage(id: string): Promise<boolean> {
    await http.delete(`/tours/${id}`);
    return true;
  }

  // ── Bookings ───────────────────────────────────────────────────────────────

  async getBookings(statusFilter?: BookingStatus | 'all', search?: string): Promise<Booking[]> {
    const params: Record<string, string> = {};
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
    if (search && search.trim() !== '') params.search = search.trim();

    const res = await http.get('/bookings', { params });
    const raw: any[] = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
    return raw.map(mapBackendBooking);
  }

  async createBooking(
    tourPackageId: string,
    traveler: TravelerInfo,
    travelDate: string,
    numberOfTravelers: number,
    numberOfAdults?: number,
    numberOfChildren?: number,
    options?: {
      title?: string;
      destination?: string;
      totalPrice?: number;
      status?: string;
      paymentStatus?: string;
      paymentMethod?: string;
      paymentReceiptUrl?: string;
      transactionReference?: string;
    },
  ): Promise<Booking> {
    const adults = numberOfAdults ?? numberOfTravelers;
    const children = numberOfChildren ?? 0;

    const payload = {
      tourId: tourPackageId,
      traveler,
      travelDate,
      numberOfTravelers,
      numberOfAdults: adults,
      numberOfChildren: children,
      ...(options || {}),
    };

    const res = await http.post('/bookings', payload);
    const created = mapBackendBooking(res.data);

    // In-app notifications — must never block the booking response
    try {
      const notifStore = useNotificationStore.getState();
      notifStore.notifyCustomer(
        traveler.email,
        'booking_confirmation',
        'Reservation Confirmed! 🎟️',
        `Your booking for ${created.tourTitle} (Ref #${created.bookingReference}) is confirmed for ${numberOfTravelers} guest(s).`,
        created.bookingReference,
        '/my-bookings',
      );
      notifStore.notifyAdmin(
        'admin_new_booking',
        `NEW BOOKING: Ref #${created.bookingReference} 🔔`,
        `${traveler.name} booked ${created.tourTitle} ($${created.totalPrice.toLocaleString()}).`,
        created.bookingReference,
        '/admin/bookings',
      );
    } catch {}

    return created;
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    const res = await http.patch(`/bookings/${id}/status`, { status });
    return res.data ? mapBackendBooking(res.data) : null;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Booking | null> {
    const res = await http.patch(`/bookings/${id}/payment-status`, { paymentStatus });
    return res.data ? mapBackendBooking(res.data) : null;
  }

  async cancelBookingWithRefund(
    id: string,
    reason: string,
    requestRefund: boolean,
  ): Promise<Booking | null> {
    const res = await http.patch(`/bookings/${id}/cancel`, { reason, requestRefund });
    return res.data ? mapBackendBooking(res.data) : null;
  }

  async assignGuideToBooking(bookingId: string, guideName: string): Promise<Booking | null> {
    const res = await http.patch(`/bookings/${bookingId}/assign-guide`, {
      assignedGuideName: guideName,
    });
    return res.data ? mapBackendBooking(res.data) : null;
  }

  // ── Guides ─────────────────────────────────────────────────────────────────

  async getGuides(): Promise<TourGuide[]> {
    const res = await http.get('/guides');
    const raw = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    return raw.map(mapBackendGuide);
  }

  async addGuide(data: Omit<TourGuide, 'id'>): Promise<TourGuide> {
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
    return mapBackendGuide(res.data);
  }

  async createGuide(data: Omit<TourGuide, 'id'>): Promise<TourGuide> {
    return this.addGuide(data);
  }

  async updateGuide(id: string, updates: Partial<TourGuide>): Promise<TourGuide | null> {
    const res = await http.patch(`/guides/${id}`, updates);
    return res.data ? mapBackendGuide(res.data) : null;
  }

  async deleteGuide(id: string): Promise<boolean> {
    await http.delete(`/guides/${id}`);
    return true;
  }

  private async getGuideById(id: string): Promise<TourGuide | null> {
    const res = await http.get(`/guides/${id}`);
    return res.data ? mapBackendGuide(res.data) : null;
  }

  async addGuideCertification(guideId: string, cert: Omit<GuideCertification, 'id'>): Promise<TourGuide | null> {
    const current = await this.getGuideById(guideId);
    if (!current) return null;
    const newCert: GuideCertification = { ...cert, id: `cert-${Date.now()}` };
    const certifications = [...(current.certifications || []), newCert];
    return this.updateGuide(guideId, { certifications });
  }

  async addGuidePayment(guideId: string, payment: Omit<GuidePayment, 'id'>): Promise<TourGuide | null> {
    const current = await this.getGuideById(guideId);
    if (!current) return null;
    const newPay: GuidePayment = { ...payment, id: `pay-${Date.now()}` };
    const paymentHistory = [newPay, ...(current.paymentHistory || [])];
    return this.updateGuide(guideId, { paymentHistory });
  }

  async updateGuideAvailability(guideId: string, availability: GuideAvailability[]): Promise<TourGuide | null> {
    return this.updateGuide(guideId, { availability });
  }

  // ── Issue Tickets ──────────────────────────────────────────────────────────

  async getIssueTickets(filters?: {
    status?: string;
    category?: string;
    issueType?: string;
    branch?: string;
    search?: string;
  }): Promise<IssueTicket[]> {
    const params: Record<string, string> = {};
    if (filters?.status && filters.status !== 'all' && filters.status !== 'All Status')
      params.status = filters.status;
    if (filters?.category && filters.category !== 'all' && filters.category !== 'All Category')
      params.category = filters.category;
    if (filters?.issueType && filters.issueType !== 'all')
      params.issueType = filters.issueType;
    if (filters?.branch && filters.branch !== 'all' && filters.branch !== 'All Branch')
      params.branch = filters.branch;
    if (filters?.search) params.search = filters.search;

    const res = await http.get('/issues', { params });
    const raw = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    return raw.map(mapBackendIssue);
  }

  async createIssueTicket(data: {
    reportedBy: string;
    email: string;
    issueType: string;
    description: string;
  }): Promise<IssueTicket> {
    const res = await http.post('/issues', data);
    return mapBackendIssue(res.data);
  }

  async updateIssueStatus(
    id: string,
    status: 'open' | 'in_progress' | 'resolved' | 'rejected',
    adminReason?: string,
    resolvedBy?: string,
  ): Promise<IssueTicket | null> {
    const res = await http.patch(`/issues/${id}/status`, { status, adminReason, resolvedBy });
    return res.data ? mapBackendIssue(res.data) : null;
  }

  // ── Enquiries ──────────────────────────────────────────────────────────────

  async getEnquiries(): Promise<EnquiryRecord[]> {
    const res = await http.get('/enquiries');
    const raw = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    return raw.map(mapBackendEnquiry);
  }

  async createEnquiry(data: {
    name: string;
    email: string;
    mobile: string;
    subject: string;
    message: string;
  }): Promise<EnquiryRecord> {
    const res = await http.post('/enquiries', data);
    return mapBackendEnquiry(res.data);
  }

  async updateEnquiryStatus(
    id: string,
    status: 'unread' | 'read' | 'replied',
  ): Promise<EnquiryRecord | null> {
    const res = await http.patch(`/enquiries/${id}/status`, { status });
    return res.data ? mapBackendEnquiry(res.data) : null;
  }

  async deleteEnquiry(id: string): Promise<boolean> {
    await http.delete(`/enquiries/${id}`);
    return true;
  }

  // ── Reviews ────────────────────────────────────────────────────────────────

  async getReviews(tourId?: string) {
    const params: Record<string, string> = {};
    if (tourId) params.tourId = tourId;
    const res = await http.get('/reviews', { params });
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  }

  async createReview(data: any) {
    const res = await http.post('/reviews', data);
    return res.data;
  }

  async deleteReview(id: string): Promise<boolean> {
    await http.delete(`/reviews/${id}`);
    return true;
  }

  async getAverageRatings(tourId: string) {
    const res = await http.get(`/reviews/${tourId}/ratings`);
    return res.data;
  }

  // ── Events & Festivals ───────────────────────────────────────────────────────

  async getEvents(query?: { category?: string; search?: string; status?: string }) {
    try {
      const params: Record<string, string> = {};
      if (query?.category && query.category !== 'all') params.category = query.category;
      if (query?.search) params.search = query.search;
      if (query?.status) params.status = query.status;

      const res = await http.get('/events', { params });
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  }

  async getEventById(id: string) {
    try {
      const res = await http.get(`/events/${id}`);
      return res.data;
    } catch {
      return null;
    }
  }
}

export const tourismService = new TourismService();
