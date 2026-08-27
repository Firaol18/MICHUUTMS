export interface Company {
  id: string;
  name: string;
  code?: string;        // e.g. "EAG-001"
  registrationNo?: string;
  industry?: string;
  email: string;
  phone?: string;
  address?: string;
  country: string;
  creditLimit: number;
  availableBalance: number;
  usedAmount: number;
  isActive: boolean;
  adminName?: string;   // Initial Corporate Admin
  adminEmail?: string;  // Initial Corporate Admin Email
  employeeCount?: number;
  createdAt: string;
  updatedAt?: string;
}

// ─── Department ───────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  companyId: string;
  name: string;
  managerId?: string;
  isActive: boolean;
}

// ─── Corporate User ───────────────────────────────────────────────────────────

export type CorporateRole = 'CORPORATE_ADMIN' | 'TRAVEL_MANAGER' | 'APPROVER' | 'TRAVELER';
export type CorporateUserStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED';

export interface CorporateUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  employeeId?: string;  // e.g. "EMP-102"
  jobTitle?: string;
  companyId: string;
  companyName?: string;
  department: string;
  departmentId?: string;
  departmentName?: string;
  corporateRole: CorporateRole;
  managerId?: string;
  managerName?: string;
  status?: CorporateUserStatus;
  invitedAt?: string;
  joinedAt?: string;
  isActive: boolean;
  totalBookings?: number;
  totalSpend?: number;
  createdAt: string;
}


// ─── Traveler Profile ─────────────────────────────────────────────────────────

export interface TravelerProfile {
  userId: string;
  passportNumber?: string;
  passportCountry?: string;
  passportExpiry?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: 'M' | 'F' | 'Other';
  seatPreference?: 'WINDOW' | 'AISLE' | 'MIDDLE';
  mealPreference?: 'STANDARD' | 'VEGETARIAN' | 'VEGAN' | 'HALAL' | 'KOSHER';
  loyaltyNumbers?: { airline: string; number: string }[];
  frequentFlyerTier?: string;
}

// ─── Travel Policy ────────────────────────────────────────────────────────────

export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export interface TravelPolicy {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  // Flight rules
  maxFlightPrice: number;
  allowedCabinClasses: CabinClass[];
  requiresApprovalAbove: number;
  approvalThreshold?: number;     // alias for requiresApprovalAbove used in UI
  // Hotel rules
  maxHotelNightlyRate: number;
  requiresHotelApprovalAbove: number;
  // General
  advanceBookingDays?: number; // book at least N days in advance
  effectiveDate: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Flight Search & Results ──────────────────────────────────────────────────

export interface FlightSearchParams {
  tripType: 'ONE_WAY' | 'ROUND_TRIP';
  origin: string;       // IATA code e.g. ADD
  destination: string;  // IATA code
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: CabinClass;
}

export interface FlightSegment {
  flightNumber: string;
  airline: string;
  airlineCode: string;
  airlineLogo?: string;
  origin: string;       // IATA
  originCity: string;
  destination: string;  // IATA
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;     // e.g. "3h 20m"
  aircraft?: string;
  stops: number;
  stopDetails?: { airport: string; layover: string }[];
}

export interface FlightResult {
  id: string;
  outbound: FlightSegment;
  inbound?: FlightSegment;  // round trip
  cabinClass: CabinClass;
  fareClass: string;        // "Y", "J", "F" etc.
  fareFamily?: string;      // "Saver", "Flex", "Business"
  pricePerPerson: number;
  totalPrice: number;
  currency: string;
  baggageAllowance: string; // e.g. "1 x 23kg"
  handBaggage: string;      // e.g. "1 x 7kg"
  isRefundable: boolean;
  changeFee?: number;
  seatsLeft?: number;
  // Policy evaluation
  policyStatus?: 'WITHIN_POLICY' | 'REQUIRES_APPROVAL' | 'OUT_OF_POLICY';
  policyNote?: string;
}

// ─── Hotel Search & Results ───────────────────────────────────────────────────

export interface HotelSearchParams {
  destination: string;
  destinationCity: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
}

export interface HotelAmenity {
  name: string;
  icon?: string;
}

export interface HotelRoom {
  id: string;
  name: string;
  bedType: string;      // "King", "Twin", "Double"
  maxGuests: number;
  pricePerNight: number;
  isRefundable: boolean;
  breakfastIncluded: boolean;
  amenities: string[];
  imageUrl?: string;
}

export interface HotelResult {
  id: string;
  name: string;
  starRating: number;
  reviewScore: number;
  reviewCount: number;
  reviewLabel?: string; // "Excellent", "Very Good"
  city: string;
  country: string;
  address: string;
  imageUrl: string;
  images?: string[];
  amenities: HotelAmenity[];
  rooms: HotelRoom[];
  lowestPricePerNight: number;
  totalPrice: number;  // for selected nights
  nights?: number;
  currency: string;
  distanceFromCenter?: string;
  latitude?: number;
  longitude?: number;
  // Policy evaluation
  policyStatus?: 'WITHIN_POLICY' | 'REQUIRES_APPROVAL' | 'OUT_OF_POLICY';
  policyNote?: string;
}

// ─── Corporate Booking ────────────────────────────────────────────────────────

export type CorporateBookingStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'FAILED';

export type CorporateBookingType = 'FLIGHT' | 'HOTEL' | 'FLIGHT_HOTEL';

export interface CorporateBooking {
  id: string;
  reference: string;
  type: CorporateBookingType;
  status: CorporateBookingStatus;
  companyId: string;
  companyName?: string;
  travelerId: string;
  travelerName: string;
  travelerEmail: string;
  departmentId?: string;
  departmentName?: string;
  bookedById?: string;      // Person who made the booking (e.g. Travel Manager)
  bookedByName?: string;
  // Flight details (if applicable)
  flight?: {
    result: FlightResult;
    searchParams: FlightSearchParams;
    passengerDetails?: PassengerDetail[];
    pnr?: string;
  };
  // Hotel details (if applicable)
  hotel?: {
    result: HotelResult;
    searchParams: HotelSearchParams;
    selectedRoomId: string;
    guestDetails?: GuestDetail[];
    confirmationNo?: string;
  };
  totalAmount: number;
  currency: string;
  policyStatus: 'WITHIN_POLICY' | 'REQUIRES_APPROVAL' | 'OUT_OF_POLICY';
  policyViolationReason?: string;   // human-readable reason why it needs approval
  businessPurpose?: string;         // traveler's stated reason for the trip
  approvalRequestId?: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalNote?: string;
  rejectionReason?: string;
  notes?: string;
  // Flat shortcut views for the booking tables
  flightData?: {
    airline: string;
    origin: string;
    destination: string;
    cabinClass: string;
    departureDate: string;
  };
  hotelData?: {
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    nights: number;
  };
  createdAt: string;
  updatedAt?: string;
}

// ─── Passenger / Guest Details ────────────────────────────────────────────────

export interface PassengerDetail {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'M' | 'F';
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
  mealPreference?: string;
  seatPreference?: string;
}

export interface GuestDetail {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialRequests?: string;
}

// ─── Approval ─────────────────────────────────────────────────────────────────

export interface ApprovalRequest {
  id: string;
  bookingId: string;
  bookingReference: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  approverId: string;
  approverName?: string;
  reason?: string;           // why it needs approval (out-of-policy reason)
  requesterNote?: string;    // note from requester to approver
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approverNote?: string;
  createdAt: string;
  resolvedAt?: string;
  totalAmount: number;
  currency: string;
  bookingType: CorporateBookingType;
  bookingSummary: string;    // one-line description
}
