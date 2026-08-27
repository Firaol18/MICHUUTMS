import type { FlightResult, FlightSearchParams, FlightSegment } from '@tms/shared/types/corporate';

// ─── Ethiopian / East-African Airport Database ─────────────────────────────

export const AIRPORTS = [
  { code: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', name: 'Bole International Airport' },
  { code: 'DIR', city: 'Dire Dawa', country: 'Ethiopia', name: 'Aba Tenna Dejazmach Yilma International Airport' },
  { code: 'BJR', city: 'Bahir Dar', country: 'Ethiopia', name: 'Bahir Dar Airport' },
  { code: 'LLI', city: 'Lalibela', country: 'Ethiopia', name: 'Lalibela Airport' },
  { code: 'GDQ', city: 'Gondar', country: 'Ethiopia', name: 'Atse Theodoros Airport' },
  { code: 'JIJ', city: 'Jijiga', country: 'Ethiopia', name: 'Wilwal International Airport' },
  { code: 'AWA', city: 'Awassa', country: 'Ethiopia', name: 'Hawassa Airport' },
  { code: 'DUB', city: 'Dubai', country: 'UAE', name: 'Dubai International Airport' },
  { code: 'DOH', city: 'Doha', country: 'Qatar', name: 'Hamad International Airport' },
  { code: 'NBO', city: 'Nairobi', country: 'Kenya', name: 'Jomo Kenyatta International Airport' },
  { code: 'LHR', city: 'London', country: 'UK', name: 'Heathrow Airport' },
  { code: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle Airport' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
  { code: 'JFK', city: 'New York', country: 'USA', name: 'John F. Kennedy International Airport' },
  { code: 'DXB', city: 'Dubai', country: 'UAE', name: 'Dubai International Airport' },
  { code: 'CMN', city: 'Casablanca', country: 'Morocco', name: 'Mohammed V International Airport' },
  { code: 'CAI', city: 'Cairo', country: 'Egypt', name: 'Cairo International Airport' },
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', name: 'OR Tambo International Airport' },
];

// ─── Mock Airline Data ─────────────────────────────────────────────────────

const AIRLINES = [
  { code: 'ET', name: 'Ethiopian Airlines', logo: '🇪🇹' },
  { code: 'EK', name: 'Emirates', logo: '🇦🇪' },
  { code: 'QR', name: 'Qatar Airways', logo: '🇶🇦' },
  { code: 'KQ', name: 'Kenya Airways', logo: '🇰🇪' },
  { code: 'BA', name: 'British Airways', logo: '🇬🇧' },
  { code: 'LH', name: 'Lufthansa', logo: '🇩🇪' },
  { code: 'TK', name: 'Turkish Airlines', logo: '🇹🇷' },
];

// ─── Helper to build realistic flight segments ─────────────────────────────

function makeSegment(
  from: string, fromCity: string,
  to: string, toCity: string,
  depTime: string, durationHrs: number,
  airline: typeof AIRLINES[0],
  flightNum: string,
  stops: number = 0
): FlightSegment {
  const [h, m] = depTime.split(':').map(Number);
  const arrMins = h * 60 + m + durationHrs * 60;
  const arrH = Math.floor(arrMins / 60) % 24;
  const arrM = arrMins % 60;
  const arrTime = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;
  const durationLabel = `${Math.floor(durationHrs)}h ${Math.round((durationHrs % 1) * 60)}m`;

  return {
    flightNumber: `${airline.code}${flightNum}`,
    airline: airline.name,
    airlineCode: airline.code,
    origin: from,
    originCity: fromCity,
    destination: to,
    destinationCity: toCity,
    departureTime: depTime,
    arrivalTime: arrTime,
    duration: durationLabel,
    aircraft: 'Boeing 737-800',
    stops,
    stopDetails: stops > 0 ? [{ airport: 'DXB', layover: '2h 30m' }] : [],
  };
}

// ─── Generate Mock Flight Results ──────────────────────────────────────────

export function generateMockFlights(params: FlightSearchParams): FlightResult[] {
  const et = AIRLINES[0]; // Ethiopian Airlines
  const ek = AIRLINES[1]; // Emirates
  const qr = AIRLINES[2]; // Qatar Airways
  const kq = AIRLINES[3]; // Kenya Airways
  const ba = AIRLINES[4]; // British Airways
  const lh = AIRLINES[5]; // Lufthansa
  const tk = AIRLINES[6]; // Turkish Airlines

  const isIntl = params.origin !== 'ADD' || !params.destination.match(/^(DIR|BJR|LLI|GDQ|JIJ|AWA)$/);

  const results: FlightResult[] = [
    // Option 1: Ethiopian Airlines — Best Value
    {
      id: 'FL-001',
      outbound: makeSegment(params.origin, getCity(params.origin), params.destination, getCity(params.destination), '06:00', isIntl ? 4.5 : 1.25, et, '401', 0),
      inbound: params.tripType === 'ROUND_TRIP' ? makeSegment(params.destination, getCity(params.destination), params.origin, getCity(params.origin), '14:00', isIntl ? 4.5 : 1.25, et, '402', 0) : undefined,
      cabinClass: params.cabinClass,
      fareClass: params.cabinClass === 'ECONOMY' ? 'Y' : params.cabinClass === 'BUSINESS' ? 'J' : 'F',
      fareFamily: params.cabinClass === 'ECONOMY' ? 'Saver Economy' : params.cabinClass === 'BUSINESS' ? 'Business Classic' : 'First',
      pricePerPerson: params.cabinClass === 'ECONOMY' ? 480 : params.cabinClass === 'BUSINESS' ? 1850 : 4200,
      totalPrice: params.passengers * (params.cabinClass === 'ECONOMY' ? 480 : params.cabinClass === 'BUSINESS' ? 1850 : 4200),
      currency: 'USD',
      baggageAllowance: params.cabinClass === 'ECONOMY' ? '1 x 23kg' : '2 x 32kg',
      handBaggage: params.cabinClass === 'ECONOMY' ? '1 x 7kg' : '1 x 10kg',
      isRefundable: params.cabinClass !== 'ECONOMY',
      changeFee: params.cabinClass === 'ECONOMY' ? 75 : 0,
      seatsLeft: 7,
    },
    // Option 2: Emirates — Premium
    {
      id: 'FL-002',
      outbound: makeSegment(params.origin, getCity(params.origin), params.destination, getCity(params.destination), '09:30', isIntl ? 5.5 : 1.5, ek, '7201', isIntl ? 1 : 0),
      inbound: params.tripType === 'ROUND_TRIP' ? makeSegment(params.destination, getCity(params.destination), params.origin, getCity(params.origin), '17:00', isIntl ? 5.5 : 1.5, ek, '7202', isIntl ? 1 : 0) : undefined,
      cabinClass: params.cabinClass,
      fareClass: params.cabinClass === 'ECONOMY' ? 'B' : 'J',
      fareFamily: params.cabinClass === 'ECONOMY' ? 'Flex Economy' : 'Business Flex',
      pricePerPerson: params.cabinClass === 'ECONOMY' ? 620 : params.cabinClass === 'BUSINESS' ? 2400 : 5800,
      totalPrice: params.passengers * (params.cabinClass === 'ECONOMY' ? 620 : params.cabinClass === 'BUSINESS' ? 2400 : 5800),
      currency: 'USD',
      baggageAllowance: params.cabinClass === 'ECONOMY' ? '2 x 23kg' : '2 x 32kg',
      handBaggage: '1 x 7kg',
      isRefundable: true,
      changeFee: 0,
      seatsLeft: 3,
    },
    // Option 3: Qatar Airways — Flexible
    {
      id: 'FL-003',
      outbound: makeSegment(params.origin, getCity(params.origin), params.destination, getCity(params.destination), '13:15', isIntl ? 6 : 1.75, qr, '5510', isIntl ? 1 : 0),
      inbound: params.tripType === 'ROUND_TRIP' ? makeSegment(params.destination, getCity(params.destination), params.origin, getCity(params.origin), '20:00', isIntl ? 6 : 1.75, qr, '5511', isIntl ? 1 : 0) : undefined,
      cabinClass: params.cabinClass,
      fareClass: params.cabinClass === 'ECONOMY' ? 'T' : 'C',
      fareFamily: params.cabinClass === 'ECONOMY' ? 'Economy Smart' : 'Business Smart',
      pricePerPerson: params.cabinClass === 'ECONOMY' ? 555 : params.cabinClass === 'BUSINESS' ? 2100 : 5200,
      totalPrice: params.passengers * (params.cabinClass === 'ECONOMY' ? 555 : params.cabinClass === 'BUSINESS' ? 2100 : 5200),
      currency: 'USD',
      baggageAllowance: '1 x 23kg',
      handBaggage: '1 x 7kg',
      isRefundable: false,
      changeFee: 50,
      seatsLeft: 12,
    },
    // Option 4: Kenya Airways via Nairobi
    {
      id: 'FL-004',
      outbound: makeSegment(params.origin, getCity(params.origin), params.destination, getCity(params.destination), '16:45', isIntl ? 7.5 : 2, kq, '320', 1),
      inbound: params.tripType === 'ROUND_TRIP' ? makeSegment(params.destination, getCity(params.destination), params.origin, getCity(params.origin), '08:30', isIntl ? 7.5 : 2, kq, '321', 1) : undefined,
      cabinClass: params.cabinClass,
      fareClass: 'Q',
      fareFamily: 'Value Economy',
      pricePerPerson: params.cabinClass === 'ECONOMY' ? 395 : params.cabinClass === 'BUSINESS' ? 1650 : 3900,
      totalPrice: params.passengers * (params.cabinClass === 'ECONOMY' ? 395 : params.cabinClass === 'BUSINESS' ? 1650 : 3900),
      currency: 'USD',
      baggageAllowance: '1 x 23kg',
      handBaggage: '1 x 5kg',
      isRefundable: false,
      changeFee: 100,
      seatsLeft: 18,
    },
    // Option 5: Turkish Airlines — via Istanbul
    {
      id: 'FL-005',
      outbound: makeSegment(params.origin, getCity(params.origin), params.destination, getCity(params.destination), '22:00', isIntl ? 9 : 3, tk, '1600', 1),
      inbound: params.tripType === 'ROUND_TRIP' ? makeSegment(params.destination, getCity(params.destination), params.origin, getCity(params.origin), '11:00', isIntl ? 9 : 3, tk, '1601', 1) : undefined,
      cabinClass: params.cabinClass,
      fareClass: 'M',
      fareFamily: 'Economy Flex Plus',
      pricePerPerson: params.cabinClass === 'ECONOMY' ? 530 : params.cabinClass === 'BUSINESS' ? 2050 : 5000,
      totalPrice: params.passengers * (params.cabinClass === 'ECONOMY' ? 530 : params.cabinClass === 'BUSINESS' ? 2050 : 5000),
      currency: 'USD',
      baggageAllowance: '2 x 23kg',
      handBaggage: '1 x 8kg',
      isRefundable: true,
      changeFee: 0,
      seatsLeft: 5,
    },
  ];

  // Inject policy status based on hardcoded policy limit of $1000 per ticket
  return results.map((r) => {
    const price = r.pricePerPerson;
    let policyStatus: FlightResult['policyStatus'] = 'WITHIN_POLICY';
    let policyNote: string | undefined;

    if (price > 1500) {
      policyStatus = 'OUT_OF_POLICY';
      policyNote = `Exceeds maximum fare of $1,000 by $${(price - 1000).toLocaleString()}`;
    } else if (price > 1000) {
      policyStatus = 'REQUIRES_APPROVAL';
      policyNote = `Exceeds preferred fare limit — manager approval required`;
    }

    return { ...r, policyStatus, policyNote };
  });
}

function getCity(code: string): string {
  const airport = AIRPORTS.find((a) => a.code === code);
  return airport?.city ?? code;
}
