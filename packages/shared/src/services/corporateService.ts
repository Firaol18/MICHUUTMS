import type {
  Company,
  CorporateUser,
  TravelPolicy,
  CorporateBooking,
} from '@tms/shared/types/corporate';

// ── Mock Initial Corporate Data ───────────────────────────────────────────────

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'Ethiopian Airlines Group',
    code: 'EAG-001',
    registrationNo: 'ET-CORP-98421',
    industry: 'Aviation & Logistics',
    email: 'travel-desk@ethiopianairlines.com',
    phone: '+251 11 665 2222',
    address: 'Bole International Airport Complex, Addis Ababa',
    country: 'Ethiopia',
    creditLimit: 250000,
    availableBalance: 182400,
    usedAmount: 67600,
    isActive: true,
    adminName: 'Dawit Abebe',
    adminEmail: 'dawit.abebe@ethiopianairlines.com',
    employeeCount: 420,
    createdAt: '2025-01-15',
  },
  {
    id: 'comp-2',
    name: 'Commercial Bank of Ethiopia (CBE)',
    code: 'CBE-002',
    registrationNo: 'ET-FIN-10492',
    industry: 'Banking & Financial Services',
    email: 'procurement@cbe.com.et',
    phone: '+251 11 551 5004',
    address: 'CBE HQ Tower, Churchill Road, Addis Ababa',
    country: 'Ethiopia',
    creditLimit: 500000,
    availableBalance: 412500,
    usedAmount: 87500,
    isActive: true,
    adminName: 'Selamawit Tadesse',
    adminEmail: 'selamawit.t@cbe.com.et',
    employeeCount: 850,
    createdAt: '2025-02-10',
  },
  {
    id: 'comp-3',
    name: 'Ethio Telecom Enterprise',
    code: 'ETC-003',
    registrationNo: 'ET-TEL-77219',
    industry: 'Telecommunications',
    email: 'travel@ethiotelecom.et',
    phone: '+251 11 550 0000',
    address: 'Ethio Telecom Building, Churchill Ave',
    country: 'Ethiopia',
    creditLimit: 300000,
    availableBalance: 245000,
    usedAmount: 55000,
    isActive: true,
    employeeCount: 610,
    createdAt: '2025-03-01',
  },
  {
    id: 'comp-4',
    name: 'Dangote Cement Ethiopia PLC',
    code: 'DCE-004',
    registrationNo: 'ET-IND-33821',
    industry: 'Manufacturing & Infrastructure',
    email: 'logistics@dangote-et.com',
    phone: '+251 11 662 1010',
    address: 'Muger Cement Plant, Oromia',
    country: 'Ethiopia',
    creditLimit: 150000,
    availableBalance: 128900,
    usedAmount: 21100,
    isActive: true,
    employeeCount: 190,
    createdAt: '2025-04-18',
  },
];

export const INITIAL_CORPORATE_USERS: CorporateUser[] = [
  {
    id: 'c-usr-1',
    name: 'Dawit Abebe',
    email: 'dawit.abebe@ethiopianairlines.com',
    phone: '+251 91 123 4567',
    employeeId: 'EMP-001',
    jobTitle: 'Head of Corporate Travel',
    companyId: 'comp-1',
    companyName: 'Ethiopian Airlines Group',
    department: 'Executive Management',
    departmentName: 'Executive Management',
    corporateRole: 'CORPORATE_ADMIN',
    status: 'ACTIVE',
    isActive: true,
    totalBookings: 12,
    totalSpend: 18400,
    createdAt: '2025-01-20',
  },
  {
    id: 'c-usr-2',
    name: 'Selam Hailu',
    email: 'selam.hailu@ethiopianairlines.com',
    phone: '+251 91 234 5678',
    employeeId: 'EMP-014',
    jobTitle: 'Travel Manager',
    companyId: 'comp-1',
    companyName: 'Ethiopian Airlines Group',
    department: 'Operations',
    departmentName: 'Operations & Logistics',
    corporateRole: 'TRAVEL_MANAGER',
    managerId: 'c-usr-1',
    managerName: 'Dawit Abebe',
    status: 'ACTIVE',
    isActive: true,
    totalBookings: 31,
    totalSpend: 42700,
    createdAt: '2025-01-22',
  },
  {
    id: 'c-usr-3',
    name: 'Biruk Tesfaye',
    email: 'biruk.tesfaye@ethiopianairlines.com',
    phone: '+251 92 345 6789',
    employeeId: 'EMP-028',
    jobTitle: 'Senior Budget Approver',
    companyId: 'comp-1',
    companyName: 'Ethiopian Airlines Group',
    department: 'Finance',
    departmentName: 'Finance & Risk Control',
    corporateRole: 'APPROVER',
    managerId: 'c-usr-2',
    managerName: 'Selam Hailu',
    status: 'ACTIVE',
    isActive: true,
    totalBookings: 0,
    totalSpend: 0,
    createdAt: '2025-02-01',
  },
  {
    id: 'c-usr-4',
    name: 'Mekdes Girma',
    email: 'mekdes.girma@ethiopianairlines.com',
    phone: '+251 93 456 7890',
    employeeId: 'EMP-102',
    jobTitle: 'Sales Executive',
    companyId: 'comp-1',
    companyName: 'Ethiopian Airlines Group',
    department: 'Sales',
    departmentName: 'Sales & Business Development',
    corporateRole: 'TRAVELER',
    managerId: 'c-usr-2',
    managerName: 'Selam Hailu',
    status: 'ACTIVE',
    isActive: true,
    totalBookings: 7,
    totalSpend: 4900,
    createdAt: '2025-02-10',
  },
  {
    id: 'c-usr-5',
    name: 'Abel Yonas',
    email: 'abel.yonas@ethiopianairlines.com',
    phone: '+251 94 567 8901',
    employeeId: 'EMP-215',
    jobTitle: 'Field Engineer',
    companyId: 'comp-1',
    companyName: 'Ethiopian Airlines Group',
    department: 'Engineering',
    departmentName: 'Aircraft Engineering',
    corporateRole: 'TRAVELER',
    managerId: 'c-usr-2',
    managerName: 'Selam Hailu',
    status: 'ACTIVE',
    isActive: true,
    totalBookings: 3,
    totalSpend: 2150,
    createdAt: '2025-03-01',
  },
  // CBE employees
  {
    id: 'c-usr-6',
    name: 'Selamawit Tadesse',
    email: 'selamawit.t@cbe.com.et',
    phone: '+251 92 345 6789',
    employeeId: 'CBE-001',
    jobTitle: 'Head of Procurement',
    companyId: 'comp-2',
    companyName: 'Commercial Bank of Ethiopia (CBE)',
    department: 'Finance',
    departmentName: 'Finance & Risk Control',
    corporateRole: 'CORPORATE_ADMIN',
    status: 'ACTIVE',
    isActive: true,
    totalBookings: 8,
    totalSpend: 11200,
    createdAt: '2025-02-14',
  },
];

export const INITIAL_TRAVEL_POLICIES: TravelPolicy[] = [
  {
    id: 'pol-1',
    companyId: 'comp-1',
    name: 'Executive & Senior Staff Travel Policy',
    description: 'Permits Business Class for international flights over 5 hours. Hotel ceiling $300/night. All upgrades beyond Economy require manager pre-approval for trips over $1,200.',
    maxFlightPrice: 2000,
    allowedCabinClasses: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS'],
    requiresApprovalAbove: 1200,
    approvalThreshold: 1200,
    maxHotelNightlyRate: 300,
    requiresHotelApprovalAbove: 220,
    advanceBookingDays: 3,
    effectiveDate: '2025-01-22',
    isActive: true,
    createdAt: '2025-01-22',
  },
  {
    id: 'pol-2',
    companyId: 'comp-2',
    name: 'Standard Corporate Travel Policy (CBE)',
    description: 'Economy class standard for all staff. Maximum $1,000 flight, $180 hotel rate ceiling. All requests above $800 require Finance Director approval.',
    maxFlightPrice: 1000,
    allowedCabinClasses: ['ECONOMY'],
    requiresApprovalAbove: 800,
    approvalThreshold: 800,
    maxHotelNightlyRate: 180,
    requiresHotelApprovalAbove: 140,
    advanceBookingDays: 7,
    effectiveDate: '2025-02-15',
    isActive: true,
    createdAt: '2025-02-15',
  },
  {
    id: 'pol-3',
    companyId: 'comp-3',
    name: 'Engineering & Field Ops Travel Policy',
    description: 'Regional flights with flexible rebooking options. Standard 3-4 star hotels only. All requests require 2 days advance booking.',
    maxFlightPrice: 850,
    allowedCabinClasses: ['ECONOMY'],
    requiresApprovalAbove: 650,
    approvalThreshold: 650,
    maxHotelNightlyRate: 150,
    requiresHotelApprovalAbove: 120,
    advanceBookingDays: 2,
    effectiveDate: '2025-03-10',
    isActive: true,
    createdAt: '2025-03-10',
  },
];

export const INITIAL_CORPORATE_BOOKINGS: CorporateBooking[] = [
  {
    id: 'cbkg-101',
    reference: 'CB-ET-89412',
    type: 'FLIGHT',
    status: 'CONFIRMED',
    companyId: 'comp-1',
    companyName: 'Ethiopian Airlines Group',
    travelerId: 'c-usr-1',
    travelerName: 'Dawit Abebe',
    travelerEmail: 'dawit.abebe@ethiopianairlines.com',
    bookedById: 'c-usr-1',
    bookedByName: 'Dawit Abebe',
    departmentName: 'Executive Management',
    totalAmount: 1850,
    currency: 'USD',
    policyStatus: 'WITHIN_POLICY',
    businessPurpose: 'Delegation to Dubai Aviation Expo 2026',
    approvedBy: 'Auto-Policy Approved',
    approvedAt: '2026-08-20T10:30:00Z',
    flightData: {
      airline: 'Ethiopian Airlines',
      origin: 'ADD',
      destination: 'DXB',
      cabinClass: 'BUSINESS',
      departureDate: '2026-09-05',
    },
    createdAt: '2026-08-20T10:15:00Z',
  },
  {
    id: 'cbkg-102',
    reference: 'CB-ET-33910',
    type: 'HOTEL',
    status: 'PENDING_APPROVAL',
    companyId: 'comp-1',
    companyName: 'Ethiopian Airlines Group',
    travelerId: 'c-usr-4',
    travelerName: 'Mekdes Girma',
    travelerEmail: 'mekdes.girma@ethiopianairlines.com',
    bookedById: 'c-usr-2',
    bookedByName: 'Selam Hailu',
    departmentName: 'Sales & Business Development',
    totalAmount: 555,
    currency: 'USD',
    policyStatus: 'REQUIRES_APPROVAL',
    businessPurpose: 'Annual KE sales review summit in Nairobi',
    policyViolationReason: 'Nightly rate $185/night exceeds $300 policy cap per night',
    hotelData: {
      hotelName: 'Radisson Blu Nairobi',
      roomType: 'Deluxe King',
      checkIn: '2026-09-10',
      checkOut: '2026-09-13',
      nights: 3,
    },
    createdAt: '2026-08-25T14:40:00Z',
  },
  {
    id: 'cbkg-103',
    reference: 'CB-ET-55120',
    type: 'FLIGHT',
    status: 'PENDING_APPROVAL',
    companyId: 'comp-1',
    companyName: 'Ethiopian Airlines Group',
    travelerId: 'c-usr-5',
    travelerName: 'Abel Yonas',
    travelerEmail: 'abel.yonas@ethiopianairlines.com',
    bookedById: 'c-usr-5',
    bookedByName: 'Abel Yonas',
    departmentName: 'Aircraft Engineering',
    totalAmount: 2200,
    currency: 'USD',
    policyStatus: 'REQUIRES_APPROVAL',
    businessPurpose: 'Aircraft MRO supplier meeting in London',
    policyViolationReason: 'Total fare $2,200 exceeds $2,000 policy maximum',
    flightData: {
      airline: 'Ethiopian Airlines',
      origin: 'ADD',
      destination: 'LHR',
      cabinClass: 'BUSINESS',
      departureDate: '2026-09-12',
    },
    createdAt: '2026-08-26T09:00:00Z',
  },
  {
    id: 'cbkg-104',
    reference: 'CB-ET-77301',
    type: 'FLIGHT',
    status: 'APPROVED',
    companyId: 'comp-1',
    companyName: 'Ethiopian Airlines Group',
    travelerId: 'c-usr-4',
    travelerName: 'Mekdes Girma',
    travelerEmail: 'mekdes.girma@ethiopianairlines.com',
    bookedById: 'c-usr-2',
    bookedByName: 'Selam Hailu',
    departmentName: 'Sales & Business Development',
    totalAmount: 480,
    currency: 'USD',
    policyStatus: 'WITHIN_POLICY',
    businessPurpose: 'Regional sales prospecting — Kigali corridor',
    flightData: {
      airline: 'Ethiopian Airlines',
      origin: 'ADD',
      destination: 'KGL',
      cabinClass: 'ECONOMY',
      departureDate: '2026-08-28',
    },
    approvedBy: 'Selam Hailu',
    approvedAt: '2026-08-24T09:12:00Z',
    approvalNote: 'Approved — within budget and policy.',
    createdAt: '2026-08-23T18:00:00Z',
  },
];

// ── In-Memory State & Service Methods ─────────────────────────────────────────

let companies = [...INITIAL_COMPANIES];
let corporateUsers = [...INITIAL_CORPORATE_USERS];
let travelPolicies = [...INITIAL_TRAVEL_POLICIES];
let corporateBookings = [...INITIAL_CORPORATE_BOOKINGS];

export const corporateService = {
  // ── Companies ──────────────────────────────────────────────────────────────
  getCompanies: async (): Promise<Company[]> => {
    return new Promise((res) => setTimeout(() => res([...companies]), 150));
  },
  addCompany: async (data: Omit<Company, 'id' | 'createdAt' | 'usedAmount' | 'availableBalance'>): Promise<Company> => {
    const newCompId = `comp-${Date.now()}`;
    const newComp: Company = {
      ...data,
      id: newCompId,
      code: data.code || `CORP-${Math.floor(100 + Math.random() * 900)}`,
      availableBalance: data.creditLimit,
      usedAmount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    companies = [newComp, ...companies];

    // If an initial Corporate Admin was specified, automatically provision or invite them!
    if (data.adminEmail) {
      const initialAdmin: CorporateUser = {
        id: `c-usr-${Date.now()}`,
        name: data.adminName || 'Corporate Administrator',
        email: data.adminEmail,
        companyId: newCompId,
        companyName: data.name,
        department: 'Executive Administration',
        departmentName: 'Executive Administration',
        corporateRole: 'CORPORATE_ADMIN',
        status: 'INVITED',
        invitedAt: new Date().toISOString(),
        isActive: true,
        totalBookings: 0,
        totalSpend: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      corporateUsers = [initialAdmin, ...corporateUsers];
    }

    return newComp;
  },
  updateCompany: async (id: string, data: Partial<Company>): Promise<Company | null> => {
    const idx = companies.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    companies[idx] = { ...companies[idx], ...data };
    return companies[idx];
  },
  deleteCompany: async (id: string): Promise<boolean> => {
    companies = companies.filter((c) => c.id !== id);
    return true;
  },

  // ── Corporate Users & Employee Invitations ─────────────────────────────────
  getCorporateUsers: async (): Promise<CorporateUser[]> => {
    return new Promise((res) => setTimeout(() => res([...corporateUsers]), 150));
  },
  addCorporateUser: async (data: Omit<CorporateUser, 'id' | 'createdAt'>): Promise<CorporateUser> => {
    const newUser: CorporateUser = {
      ...data,
      id: `c-usr-${Date.now()}`,
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };
    corporateUsers = [newUser, ...corporateUsers];
    return newUser;
  },
  // Self-service employee invitation from Corporate Admin
  inviteEmployee: async (data: {
    name: string;
    email: string;
    companyId: string;
    companyName: string;
    department: string;
    corporateRole: CorporateUser['corporateRole'];
    employeeId?: string;
    jobTitle?: string;
    phone?: string;
  }): Promise<CorporateUser> => {
    const newEmployee: CorporateUser = {
      id: `c-usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      employeeId: data.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      jobTitle: data.jobTitle,
      companyId: data.companyId,
      companyName: data.companyName,
      department: data.department,
      departmentName: data.department,
      corporateRole: data.corporateRole,
      status: 'INVITED',
      invitedAt: new Date().toISOString(),
      isActive: true,
      totalBookings: 0,
      totalSpend: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    corporateUsers = [newEmployee, ...corporateUsers];

    // Update company employee count
    const compIdx = companies.findIndex((c) => c.id === data.companyId);
    if (compIdx !== -1) {
      companies[compIdx] = {
        ...companies[compIdx],
        employeeCount: (companies[compIdx].employeeCount || 0) + 1,
      };
    }

    return newEmployee;
  },
  updateCorporateUser: async (id: string, data: Partial<CorporateUser>): Promise<CorporateUser | null> => {
    const idx = corporateUsers.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    corporateUsers[idx] = { ...corporateUsers[idx], ...data };
    return corporateUsers[idx];
  },
  deleteCorporateUser: async (id: string): Promise<boolean> => {
    corporateUsers = corporateUsers.filter((u) => u.id !== id);
    return true;
  },

  // ── Travel Policies ────────────────────────────────────────────────────────
  getTravelPolicies: async (): Promise<TravelPolicy[]> => {
    return new Promise((res) => setTimeout(() => res([...travelPolicies]), 150));
  },
  // Alias for admin pages
  getPolicies: async (): Promise<TravelPolicy[]> => {
    return new Promise((res) => setTimeout(() => res([...travelPolicies]), 150));
  },
  addPolicy: async (data: Omit<TravelPolicy, 'id' | 'createdAt'>): Promise<TravelPolicy> => {
    const newPol: TravelPolicy = {
      ...data,
      id: `pol-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    travelPolicies = [newPol, ...travelPolicies];
    return newPol;
  },
  updatePolicy: async (id: string, data: Partial<TravelPolicy>): Promise<TravelPolicy | null> => {
    const idx = travelPolicies.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    travelPolicies[idx] = { ...travelPolicies[idx], ...data };
    return travelPolicies[idx];
  },
  deletePolicy: async (id: string): Promise<boolean> => {
    travelPolicies = travelPolicies.filter((p) => p.id !== id);
    return true;
  },

  // ── Corporate Bookings ─────────────────────────────────────────────────────
  getCorporateBookings: async (): Promise<CorporateBooking[]> => {
    return new Promise((res) => setTimeout(() => res([...corporateBookings]), 150));
  },
  addCorporateBooking: async (booking: Omit<CorporateBooking, 'id' | 'reference' | 'createdAt'>): Promise<CorporateBooking> => {
    const newBkg: CorporateBooking = {
      ...booking,
      id: `cbkg-${Date.now()}`,
      reference: `CB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };
    corporateBookings = [newBkg, ...corporateBookings];
    return newBkg;
  },
  updateCorporateBooking: async (id: string, data: Partial<CorporateBooking>): Promise<CorporateBooking | null> => {
    const idx = corporateBookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    corporateBookings[idx] = { ...corporateBookings[idx], ...data, updatedAt: new Date().toISOString() };
    return corporateBookings[idx];
  },
  updateBookingStatus: async (id: string, status: CorporateBooking['status'], reviewer?: string, reason?: string): Promise<CorporateBooking | null> => {
    const idx = corporateBookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    corporateBookings[idx] = {
      ...corporateBookings[idx],
      status,
      approvedBy: status === 'APPROVED' ? (reviewer || 'Corporate Approver') : undefined,
      approvedAt: status === 'APPROVED' ? new Date().toISOString() : undefined,
      rejectionReason: status === 'REJECTED' ? (reason || 'Exceeds budget policy') : undefined,
      updatedAt: new Date().toISOString(),
    };
    return corporateBookings[idx];
  },
};
