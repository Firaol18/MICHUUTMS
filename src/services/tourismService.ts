import { apiClient } from './apiClient';
import {
  INITIAL_TOURISM_METRICS,
  INITIAL_TOUR_PACKAGES,
  INITIAL_BOOKINGS,
  INITIAL_GUIDES,
  DESTINATIONS,
} from './mockTourismData';
import type { TourPackage, TourCategory, Destination } from '@/types/tour';
import type { Booking, BookingStatus, TravelerInfo } from '@/types/booking';
import type { TourGuide } from '@/types/guide';
import type { MetricCardData } from '@/types/common';

export interface IssueTicket {
  id: string;
  ticketId: string;
  reportedBy: string;
  email: string;
  issueType: string;
  description: string;
  dateReported: string;
  status: 'open' | 'in_progress' | 'resolved';
}

const INITIAL_ISSUES: IssueTicket[] = [
  { id: 'iss-1', ticketId: 'ISS-801', reportedBy: 'Eleanor Vance', email: 'eleanor.vance@example.com', issueType: 'Booking Issues', description: 'Deposit clarification for Wenchi Crater Lake tour.', dateReported: '2026-08-09', status: 'open' },
  { id: 'iss-2', ticketId: 'ISS-802', reportedBy: 'Liam Hemsworth', email: 'liam.h@example.co.uk', issueType: 'Cancellation', description: 'Requesting +2 days extension for Simien Mountains trek.', dateReported: '2026-08-08', status: 'in_progress' },
  { id: 'iss-3', ticketId: 'ISS-803', reportedBy: 'Sophia Rossi', email: 'sophia.r@example.it', issueType: 'Refund', description: 'Fasting vegan meal plan for Lalibela Pilgrimage.', dateReported: '2026-08-05', status: 'resolved' },
];

class TourismService {
  private tours: TourPackage[] = [...INITIAL_TOUR_PACKAGES];
  private bookings: Booking[] = [...INITIAL_BOOKINGS];
  private guides: TourGuide[] = [...INITIAL_GUIDES];
  private issues: IssueTicket[] = [...INITIAL_ISSUES];

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
    const res = await apiClient.post(tour);
    return res.data;
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
    numberOfTravelers: number
  ): Promise<Booking> {
    const tour = this.tours.find((t) => t.id === tourPackageId);
    const pricePerPerson = tour ? tour.pricePerPerson : 1500;
    const tourTitle = tour ? tour.title : 'Custom Luxury Travel Tour';
    const destinationName = tour ? `${tour.destination.name}, ${tour.destination.country}` : 'Global Destination';

    const newBooking: Booking = {
      id: `bk-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingReference: `MCH-BKG-${Math.floor(1000 + Math.random() * 9000)}`,
      tourPackageId,
      tourTitle,
      destinationName,
      traveler,
      travelDate,
      numberOfTravelers,
      totalPrice: pricePerPerson * numberOfTravelers,
      status: 'confirmed',
      paymentStatus: 'paid',
      bookingDate: new Date().toISOString().split('T')[0],
      assignedGuideName: 'Abebe Bekele',
    };

    this.bookings.unshift(newBooking);
    const res = await apiClient.post(newBooking);
    return res.data;
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    const idx = this.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;

    this.bookings[idx] = {
      ...this.bookings[idx],
      status,
    };
    const res = await apiClient.update(this.bookings[idx]);
    return res.data;
  }

  async getGuides(): Promise<TourGuide[]> {
    const res = await apiClient.get(this.guides);
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
      reportedBy: data.reportedBy || 'Traveler Customer',
      email: data.email || 'customer@example.com',
      issueType: data.issueType || 'Booking Issues',
      description: data.description || 'Customer support issue ticket.',
      dateReported: new Date().toISOString().split('T')[0],
      status: 'open',
    };
    this.issues.unshift(newTicket);
    const res = await apiClient.post(newTicket);
    return res.data;
  }

  async updateIssueStatus(id: string, status: 'open' | 'in_progress' | 'resolved'): Promise<IssueTicket | null> {
    const idx = this.issues.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    this.issues[idx] = { ...this.issues[idx], status };
    const res = await apiClient.update(this.issues[idx]);
    return res.data;
  }
}

export const tourismService = new TourismService();
