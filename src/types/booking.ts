export type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'refunded';
export type RefundStatus = 'none' | 'pending' | 'processed' | 'denied';

export interface TravelerInfo {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  specialRequests?: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  tourPackageId: string;
  tourTitle: string;
  destinationName: string;
  traveler: TravelerInfo;
  travelDate: string;
  numberOfTravelers: number;
  numberOfAdults: number;
  numberOfChildren: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  bookingDate: string;
  assignedGuideId?: string;
  assignedGuideName?: string;
  cancellationReason?: string;
  refundStatus?: RefundStatus;
}
