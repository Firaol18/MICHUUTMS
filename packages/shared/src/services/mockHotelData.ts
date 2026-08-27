import type { HotelResult, HotelSearchParams } from '@tms/shared/types/corporate';

// ─── Mock Hotel Database ───────────────────────────────────────────────────

export const POPULAR_DESTINATIONS = [
  'Addis Ababa', 'Dubai', 'Nairobi', 'London', 'Paris', 'Frankfurt',
  'New York', 'Doha', 'Cairo', 'Johannesburg', 'Bahir Dar', 'Lalibela',
  'Gondar', 'Hawassa', 'Dire Dawa',
];

// ─── Generate Mock Hotel Results ───────────────────────────────────────────

export function generateMockHotels(params: HotelSearchParams): HotelResult[] {
  const city = params.destinationCity || params.destination;
  const nights = calcNights(params.checkIn, params.checkOut) || 2;

  const hotels: HotelResult[] = [
    {
      id: 'HT-001',
      name: `Sheraton ${city} Hotel`,
      starRating: 5,
      reviewScore: 9.1,
      reviewCount: 2840,
      reviewLabel: 'Exceptional',
      city,
      country: 'Ethiopia',
      address: `1 King George VI Street, ${city}`,
      imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
      ],
      amenities: [
        { name: 'Free Wi-Fi' },
        { name: 'Swimming Pool' },
        { name: 'Fitness Center' },
        { name: 'Spa' },
        { name: 'Restaurant' },
        { name: 'Bar' },
        { name: 'Airport Shuttle' },
        { name: 'Business Center' },
        { name: 'Room Service' },
        { name: 'Concierge' },
      ],
      rooms: [
        {
          id: 'RM-001-A',
          name: 'Deluxe Room',
          bedType: 'King',
          maxGuests: 2,
          pricePerNight: 185,
          isRefundable: true,
          breakfastIncluded: false,
          amenities: ['Air conditioning', 'Mini bar', 'Safe', '42" TV', 'Bathtub'],
          imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=600',
        },
        {
          id: 'RM-001-B',
          name: 'Deluxe Room with Breakfast',
          bedType: 'King',
          maxGuests: 2,
          pricePerNight: 220,
          isRefundable: true,
          breakfastIncluded: true,
          amenities: ['Air conditioning', 'Mini bar', 'Safe', '42" TV', 'Bathtub'],
          imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=600',
        },
        {
          id: 'RM-001-C',
          name: 'Club Room',
          bedType: 'King',
          maxGuests: 2,
          pricePerNight: 290,
          isRefundable: true,
          breakfastIncluded: true,
          amenities: ['Club lounge access', 'Evening cocktails', 'Mini bar', 'Premium bath amenities'],
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600',
        },
      ],
      lowestPricePerNight: 185,
      totalPrice: 185 * nights,
      nights,
      currency: 'USD',
      distanceFromCenter: '0.5 km from city center',
    },
    {
      id: 'HT-002',
      name: `Radisson Blu ${city}`,
      starRating: 5,
      reviewScore: 8.7,
      reviewCount: 1620,
      reviewLabel: 'Excellent',
      city,
      country: 'Ethiopia',
      address: `Woreda 23, Bole Road, ${city}`,
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=800',
      ],
      amenities: [
        { name: 'Free Wi-Fi' },
        { name: 'Rooftop Pool' },
        { name: 'Fitness Center' },
        { name: 'Restaurant' },
        { name: 'Bar' },
        { name: 'Meeting Rooms' },
        { name: 'Room Service' },
        { name: 'Parking' },
      ],
      rooms: [
        {
          id: 'RM-002-A',
          name: 'Superior Room',
          bedType: 'Queen',
          maxGuests: 2,
          pricePerNight: 155,
          isRefundable: true,
          breakfastIncluded: false,
          amenities: ['Air conditioning', 'Work desk', 'Coffee maker', '40" TV'],
        },
        {
          id: 'RM-002-B',
          name: 'Business Class Room',
          bedType: 'King',
          maxGuests: 2,
          pricePerNight: 195,
          isRefundable: true,
          breakfastIncluded: true,
          amenities: ['Air conditioning', 'Large work desk', 'Nespresso machine', 'Lounge access'],
        },
        {
          id: 'RM-002-C',
          name: 'Junior Suite',
          bedType: 'King',
          maxGuests: 3,
          pricePerNight: 280,
          isRefundable: true,
          breakfastIncluded: true,
          amenities: ['Separate living area', 'Kitchenette', 'City view', 'Premium amenities'],
          imageUrl: 'https://images.unsplash.com/photo-1591088398332-8596b4f6ab28?auto=format&fit=crop&q=80&w=600',
        },
      ],
      lowestPricePerNight: 155,
      totalPrice: 155 * nights,
      nights,
      currency: 'USD',
      distanceFromCenter: '1.2 km from city center',
    },
    {
      id: 'HT-003',
      name: `Hilton ${city}`,
      starRating: 4,
      reviewScore: 8.3,
      reviewCount: 3102,
      reviewLabel: 'Very Good',
      city,
      country: 'Ethiopia',
      address: `Menelik II Avenue, ${city}`,
      imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
      amenities: [
        { name: 'Free Wi-Fi' },
        { name: 'Pool' },
        { name: 'Gym' },
        { name: 'Restaurant' },
        { name: '24h Front Desk' },
        { name: 'Laundry' },
      ],
      rooms: [
        {
          id: 'RM-003-A',
          name: 'Standard Room',
          bedType: 'Double',
          maxGuests: 2,
          pricePerNight: 120,
          isRefundable: false,
          breakfastIncluded: false,
          amenities: ['Air conditioning', 'TV', 'Safe'],
        },
        {
          id: 'RM-003-B',
          name: 'Standard Room — Free Cancellation',
          bedType: 'Double',
          maxGuests: 2,
          pricePerNight: 138,
          isRefundable: true,
          breakfastIncluded: false,
          amenities: ['Air conditioning', 'TV', 'Safe'],
        },
        {
          id: 'RM-003-C',
          name: 'Executive Room',
          bedType: 'King',
          maxGuests: 2,
          pricePerNight: 175,
          isRefundable: true,
          breakfastIncluded: true,
          amenities: ['Executive lounge', 'Evening snacks', 'Express check-out'],
        },
      ],
      lowestPricePerNight: 120,
      totalPrice: 120 * nights,
      nights,
      currency: 'USD',
      distanceFromCenter: '0.8 km from city center',
    },
    {
      id: 'HT-004',
      name: `Jupiter International Hotel`,
      starRating: 4,
      reviewScore: 7.9,
      reviewCount: 892,
      reviewLabel: 'Good',
      city,
      country: 'Ethiopia',
      address: `Bole Sub-City, ${city}`,
      imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800',
      amenities: [
        { name: 'Free Wi-Fi' },
        { name: 'Restaurant' },
        { name: 'Bar' },
        { name: 'Conference Rooms' },
        { name: 'Airport Shuttle' },
      ],
      rooms: [
        {
          id: 'RM-004-A',
          name: 'Standard Room',
          bedType: 'Twin',
          maxGuests: 2,
          pricePerNight: 89,
          isRefundable: false,
          breakfastIncluded: false,
          amenities: ['Air conditioning', 'TV'],
        },
        {
          id: 'RM-004-B',
          name: 'Standard Room + Breakfast',
          bedType: 'Queen',
          maxGuests: 2,
          pricePerNight: 115,
          isRefundable: true,
          breakfastIncluded: true,
          amenities: ['Air conditioning', 'TV', 'Work desk'],
        },
      ],
      lowestPricePerNight: 89,
      totalPrice: 89 * nights,
      nights,
      currency: 'USD',
      distanceFromCenter: '2.5 km from airport',
    },
    {
      id: 'HT-005',
      name: `The Addis Ababa Marriott`,
      starRating: 5,
      reviewScore: 9.4,
      reviewCount: 1245,
      reviewLabel: 'Exceptional',
      city,
      country: 'Ethiopia',
      address: `Arat Kilo, ${city}`,
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c4fe1c4d?auto=format&fit=crop&q=80&w=800',
      amenities: [
        { name: 'Free Wi-Fi' },
        { name: 'Infinity Pool' },
        { name: 'Luxury Spa' },
        { name: 'Fitness Center' },
        { name: '3 Restaurants' },
        { name: 'Rooftop Bar' },
        { name: 'Butler Service' },
        { name: 'Airport Transfer' },
        { name: 'Executive Lounge' },
        { name: 'Business Center' },
      ],
      rooms: [
        {
          id: 'RM-005-A',
          name: 'Deluxe Guest Room',
          bedType: 'King',
          maxGuests: 2,
          pricePerNight: 250,
          isRefundable: true,
          breakfastIncluded: true,
          amenities: ['City view', 'Nespresso', 'Marble bathroom', 'Premium minibar'],
          imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=600',
        },
        {
          id: 'RM-005-B',
          name: 'Executive Suite',
          bedType: 'King',
          maxGuests: 2,
          pricePerNight: 420,
          isRefundable: true,
          breakfastIncluded: true,
          amenities: ['Living room', 'Dining area', 'Panoramic view', 'Butler on call', 'Private check-in'],
          imageUrl: 'https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?auto=format&fit=crop&q=80&w=600',
        },
      ],
      lowestPricePerNight: 250,
      totalPrice: 250 * nights,
      nights,
      currency: 'USD',
      distanceFromCenter: '0.3 km from city center',
    },
  ];

  // Apply policy status — policy limit $200/night
  return hotels.map((h) => {
    const rate = h.lowestPricePerNight;
    let policyStatus: HotelResult['policyStatus'] = 'WITHIN_POLICY';
    let policyNote: string | undefined;

    if (rate > 300) {
      policyStatus = 'OUT_OF_POLICY';
      policyNote = `Exceeds maximum nightly rate of $200 by $${rate - 200}`;
    } else if (rate > 200) {
      policyStatus = 'REQUIRES_APPROVAL';
      policyNote = `Exceeds preferred rate — manager approval required`;
    }

    return {
      ...h,
      policyStatus,
      policyNote,
      totalPrice: h.lowestPricePerNight * nights,
      nights,
    };
  });
}

function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const d1 = new Date(checkIn).getTime();
  const d2 = new Date(checkOut).getTime();
  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
}
