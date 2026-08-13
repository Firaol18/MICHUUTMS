import { apiClient } from './apiClient';
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

// Helper functions for localStorage state persistence across tabs/reloads
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

class TourismService {
  private tours: TourPackage[] = loadStoredData(STORAGE_KEYS.TOURS, INITIAL_TOUR_PACKAGES);
  private bookings: Booking[] = loadStoredData(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  private guides: TourGuide[] = loadStoredData(STORAGE_KEYS.GUIDES, INITIAL_GUIDES);
  private issues: IssueTicket[] = loadStoredData(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
  private enquiries: EnquiryRecord[] = loadStoredData(STORAGE_KEYS.ENQUIRIES, INITIAL_ENQUIRIES);

  async getMetrics(): Promise<MetricCardData[]> {
    const res = await apiClient.get(INITIAL_TOURISM_METRICS);
    return res.data;
  }

  async getDestinations(): Promise<Destination[]> {
    const res = await apiClient.get(DESTINATIONS);
    return res.data;
  }

  async getTours(categoryFilter?: TourCategory | 'all', searchQuery?: string): Promise<TourPackage[]> {
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

    const res = await apiClient.get(result);
    return res.data;
  }

  async getTourById(id: string): Promise<TourPackage | null> {
    const item = this.tours.find((t) => t.id === id || t.slug === id) || null;
    const res = await apiClient.get(item);
    return res.data;
  }

  async createTourPackage(newTour: Omit<TourPackage, 'id' | 'rating' | 'reviewCount'>): Promise<TourPackage> {
    const tour: TourPackage = {
      ...newTour,
      id: `tour-${Math.floor(1000 + Math.random() * 9000)}`,
      rating: 5.0,
      reviewCount: 1,
    };
    this.tours.unshift(tour);
    saveStoredData(STORAGE_KEYS.TOURS, this.tours);
    const res = await apiClient.post(tour);
    return res.data;
  }

  async updateTourPackage(id: string, updated: Partial<TourPackage>): Promise<TourPackage | null> {
    const idx = this.tours.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.tours[idx] = { ...this.tours[idx], ...updated };
    saveStoredData(STORAGE_KEYS.TOURS, this.tours);
    const res = await apiClient.update(this.tours[idx]);
    return res.data;
  }

  async deleteTourPackage(id: string): Promise<boolean> {
    this.tours = this.tours.filter((t) => t.id !== id);
    saveStoredData(STORAGE_KEYS.TOURS, this.tours);
    return true;
  }

  async getBookings(statusFilter?: BookingStatus | 'all', search?: string): Promise<Booking[]> {
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

    const res = await apiClient.get(result);
    return res.data;
  }

  async createBooking(
    tourPackageId: string,
    traveler: TravelerInfo,
    travelDate: string,
    numberOfTravelers: number,
    numberOfAdults?: number,
    numberOfChildren?: number
  ): Promise<Booking> {
    const tour = this.tours.find((t) => t.id === tourPackageId);
    const pricePerPerson = tour ? tour.pricePerPerson : 1500;
    const tourTitle = tour ? tour.title : 'Custom Luxury Expedition';
    const destinationName = tour ? `${tour.destination.name}, ${tour.destination.country}` : 'Ethiopian Destination';

    // Capacity check
    if (tour && numberOfTravelers > tour.maxGroupSize) {
      throw new Error(`This tour only has ${tour.maxGroupSize} spots available. Please reduce your group size.`);
    }

    const adults = numberOfAdults ?? numberOfTravelers;
    const children = numberOfChildren ?? 0;

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

    // 🔔 Dispatch in-app notifications to Customer & Admin
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
    } catch (e) {
      console.error('Failed to trigger notification', e);
    }

    const res = await apiClient.post(newBooking);
    return res.data;
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    const idx = this.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;

    this.bookings[idx] = { ...this.bookings[idx], status };
    saveStoredData(STORAGE_KEYS.BOOKINGS, this.bookings);
    const res = await apiClient.update(this.bookings[idx]);
    return res.data;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Booking | null> {
    const idx = this.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;

    this.bookings[idx] = { ...this.bookings[idx], paymentStatus };
    saveStoredData(STORAGE_KEYS.BOOKINGS, this.bookings);

    const bkg = this.bookings[idx];
    try {
      const notifStore = useNotificationStore.getState();
      if (paymentStatus === 'paid') {
        notifStore.notifyCustomer(
          bkg.traveler.email,
          'payment_confirmation',
          'Payment Confirmed! 💳',
          `Payment of $${bkg.totalPrice.toLocaleString()} confirmed for Ref #${bkg.bookingReference}.`,
          bkg.bookingReference,
          '/my-bookings'
        );
        notifStore.notifyAdmin(
          'admin_payment_received',
          `PAYMENT RECEIVED: $${bkg.totalPrice.toLocaleString()} 💵`,
          `${bkg.traveler.name} paid invoice for Ref #${bkg.bookingReference}.`,
          bkg.bookingReference,
          '/admin/bookings'
        );
      }
    } catch (e) {
      console.error('Failed to trigger payment notification', e);
    }

    const res = await apiClient.update(this.bookings[idx]);
    return res.data;
  }

  async cancelBookingWithRefund(
    id: string,
    reason: string,
    requestRefund: boolean
  ): Promise<Booking | null> {
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

    const bkg = this.bookings[idx];
    try {
      const notifStore = useNotificationStore.getState();
      notifStore.notifyCustomer(
        bkg.traveler.email,
        'booking_cancellation',
        'Booking Cancelled ❌',
        `Booking Ref #${bkg.bookingReference} for ${bkg.tourTitle} has been cancelled.`,
        bkg.bookingReference,
        '/my-bookings'
      );
      notifStore.notifyAdmin(
        'admin_cancellation_request',
        `CANCELLATION REQUESTED 🚨`,
        `${bkg.traveler.name} requested cancellation for Ref #${bkg.bookingReference}. Reason: ${reason}`,
        bkg.bookingReference,
        '/admin/bookings'
      );
    } catch (e) {
      console.error('Failed to trigger cancellation notification', e);
    }

    const res = await apiClient.update(this.bookings[idx]);
    return res.data;
  }

  async assignGuideToBooking(bookingId: string, guideName: string): Promise<Booking | null> {
    const idx = this.bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    this.bookings[idx] = { ...this.bookings[idx], assignedGuideName: guideName };
    saveStoredData(STORAGE_KEYS.BOOKINGS, this.bookings);

    const bkg = this.bookings[idx];
    try {
      const notifStore = useNotificationStore.getState();
      notifStore.notifyCustomer(
        bkg.traveler.email,
        'schedule_change',
        'Ranger Guide Assigned 📅',
        `Senior Ranger Guide ${guideName} has been assigned to lead your expedition (Ref #${bkg.bookingReference}).`,
        bkg.bookingReference,
        '/my-bookings'
      );
    } catch (e) {
      console.error('Failed to trigger guide assignment notification', e);
    }

    const res = await apiClient.update(this.bookings[idx]);
    return res.data;
  }

  async getGuides(): Promise<TourGuide[]> {
    const res = await apiClient.get(this.guides);
    return res.data;
  }

  async createGuide(data: Omit<TourGuide, 'id'>): Promise<TourGuide> {
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
    const res = await apiClient.post(newGuide);
    return res.data;
  }

  async updateGuide(id: string, updates: Partial<TourGuide>): Promise<TourGuide | null> {
    const idx = this.guides.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    this.guides[idx] = { ...this.guides[idx], ...updates };
    saveStoredData(STORAGE_KEYS.GUIDES, this.guides);
    const res = await apiClient.update(this.guides[idx]);
    return res.data;
  }

  async deleteGuide(id: string): Promise<boolean> {
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
    const res = await apiClient.update(this.guides[idx]);
    return res.data;
  }

  async addGuidePayment(guideId: string, payment: Omit<GuidePayment, 'id'>): Promise<TourGuide | null> {
    const idx = this.guides.findIndex((g) => g.id === guideId);
    if (idx === -1) return null;
    const newPay: GuidePayment = { ...payment, id: `pay-${Date.now()}` };
    const payments = [newPay, ...(this.guides[idx].paymentHistory || [])];
    this.guides[idx] = { ...this.guides[idx], paymentHistory: payments };
    saveStoredData(STORAGE_KEYS.GUIDES, this.guides);
    const res = await apiClient.update(this.guides[idx]);
    return res.data;
  }

  async updateGuideAvailability(guideId: string, availability: GuideAvailability[]): Promise<TourGuide | null> {
    const idx = this.guides.findIndex((g) => g.id === guideId);
    if (idx === -1) return null;
    this.guides[idx] = { ...this.guides[idx], availability };
    saveStoredData(STORAGE_KEYS.GUIDES, this.guides);
    const res = await apiClient.update(this.guides[idx]);
    return res.data;
  }

  async getIssueTickets(): Promise<IssueTicket[]> {
    const res = await apiClient.get([...this.issues]);
    return res.data;
  }

  async createIssueTicket(data: { reportedBy: string; email: string; issueType: string; description: string }): Promise<IssueTicket> {
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
    const res = await apiClient.post(newTicket);
    return res.data;
  }

  async updateIssueStatus(
    id: string,
    status: 'open' | 'in_progress' | 'resolved' | 'rejected',
    adminReason?: string,
    resolvedBy?: string
  ): Promise<IssueTicket | null> {
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

    // Push in-app notification to ticket reporter
    const statusLabel = status.toUpperCase().replace('_', ' ');
    const reasonText = adminReason ? ` Note: "${adminReason}"` : '';
    useNotificationStore.getState().addNotification({
      userEmail: updatedTicket.email,
      title: `Support Ticket #${updatedTicket.ticketId} ${statusLabel}`,
      message: `Your ticket "${updatedTicket.issueType}" status was updated to ${statusLabel}.${reasonText}`,
      type: status === 'resolved' ? 'issue_resolved' : status === 'rejected' ? 'issue_rejected' : 'issue_update',
      link: '/user/issues',
    });

    const res = await apiClient.update(this.issues[idx]);
    return res.data;
  }

  async getEnquiries(): Promise<EnquiryRecord[]> {
    const res = await apiClient.get([...this.enquiries]);
    return res.data;
  }

  async createEnquiry(data: { name: string; email: string; mobile: string; subject: string; message: string }): Promise<EnquiryRecord> {
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
    const res = await apiClient.post(newEnquiry);
    return res.data;
  }

  async updateEnquiryStatus(id: string, status: 'unread' | 'read' | 'replied'): Promise<EnquiryRecord | null> {
    const idx = this.enquiries.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.enquiries[idx] = { ...this.enquiries[idx], status };
    saveStoredData(STORAGE_KEYS.ENQUIRIES, this.enquiries);
    const res = await apiClient.update(this.enquiries[idx]);
    return res.data;
  }
}

export const tourismService = new TourismService();
