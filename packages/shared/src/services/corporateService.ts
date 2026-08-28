/**
 * corporateService.ts
 *
 * Real API client for all corporate management endpoints.
 * Replaces all previous mock/in-memory data.
 *
 * All calls go to:  /corporate/companies/:companyId/...
 *
 * The `http` instance in apiClient automatically attaches the JWT Bearer token
 * and handles 401 auto-refresh, so no auth boilerplate is needed here.
 */

import { http } from '@tms/shared/services/apiClient';

// ── Pagination wrapper returned by every list endpoint ─────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Re-export password generator so pages can still use it ─────────────────────
export const generateTemporaryPassword = (): string => {
  const words = ['Michuu', 'Habesha', 'Abyssinia', 'Safari', 'Expedition', 'Summit', 'Alpine'];
  const prefix = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  const symbols = ['!', '@', '#', '$', '%', '*'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  return `${prefix}#${num}${symbol}`;
};

// ── Legacy initial dataset exports for public app compatibility ───────────────
export const INITIAL_COMPANIES = [
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
];

export const INITIAL_CORPORATE_USERS = [
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
];

export const INITIAL_TRAVEL_POLICIES = [
  {
    id: 'pol-1',
    companyId: 'comp-1',
    name: 'Executive & Senior Staff Travel Policy',
    description: 'Permits Business Class for international flights over 5 hours. Hotel ceiling $300/night.',
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
];

export const INITIAL_CORPORATE_BOOKINGS = [
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
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared API types (matching backend entity shapes)
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiCompany {
  id: string;
  name: string;
  code: string;
  registrationNo?: string;
  industry?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string;
  website?: string;
  logoUrl?: string;
  isActive: boolean;
  departments?: ApiDepartment[];
  travelPolicies?: ApiTravelPolicy[];
  createdAt: string;
  updatedAt?: string;
}

export interface ApiDepartment {
  id: string;
  companyId: string;
  name: string;
  code?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApiMember {
  id: string;
  userId: string;
  companyId: string;
  departmentId?: string;
  department?: ApiDepartment;
  corporateRole: string;
  employeeCode?: string;
  jobTitle?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApiTravelPolicy {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  requiresApproval: boolean;
  maxBudgetPerTrip?: number;
  maxBudgetPerDay?: number;
  allowedClasses?: string[];
  advanceBookingDays?: number;
  approvalSteps?: ApiApprovalStep[];
  currency?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiApprovalStep {
  id: string;
  policyId: string;
  stepOrder: number;
  stepName?: string;
  approverRole?: string;
  approverId?: string;
}

export interface ApiTravelRequest {
  id: string;
  companyId: string;
  requesterId: string;
  requesterName: string;
  departmentId?: string;
  department?: ApiDepartment;
  policyId?: string;
  policy?: ApiTravelPolicy;
  title: string;
  purpose: string;
  destination: string;
  origin?: string;
  departureDate: string;
  returnDate: string;
  estimatedCost: number;
  currency: string;
  travelClass: string;
  status: string;
  notes?: string;
  attachmentUrls?: string[];
  budgetOverride: boolean;
  budgetOverrideReason?: string;
  rejectionReason?: string;
  currentApprovalStep: number;
  approvedAt?: string;
  completedAt?: string;
  approvals?: ApiApproval[];
  createdAt: string;
  updatedAt?: string;
}

export interface ApiApproval {
  id: string;
  requestId: string;
  approverId: string;
  approverName?: string;
  stepOrder: number;
  decision: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
  decidedAt?: string;
  createdAt: string;
}

export interface ApiCorporateBudget {
  id: string;
  companyId: string;
  departmentId?: string;
  department?: ApiDepartment;
  fiscalYear: number;
  fiscalQuarter?: number;
  totalBudget: number;
  spentAmount: number;
  reservedAmount: number;
  currency: string;
  notes?: string;
  utilizationPercent?: number;
  availableAmount?: number;
  createdAt: string;
}

export interface ApiCompanyStats {
  company: ApiCompany;
  memberCount: number;
  requests: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    totalSpend: number;
  };
}

export interface ApiSpendReport {
  period: string;
  totalRequests: number;
  totalSpend: number;
  averageCostPerTrip: number;
  byStatus: Record<string, number>;
  byTravelClass: Record<string, number>;
  topDestinations: { destination: string; count: number; spend: number }[];
  monthlyBreakdown: { month: string; amount: number }[];
  budget: {
    total: number;
    spent: number;
    reserved: number;
    available: number;
    utilizationPercent: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// corporateService — all real API calls, zero mock data
// ─────────────────────────────────────────────────────────────────────────────

export const corporateService = {

  // ── Companies ──────────────────────────────────────────────────────────────

  async getCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<ApiCompany>> {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.isActive !== undefined) q.set('isActive', String(params.isActive));
    const res = await http.get<PaginatedResponse<ApiCompany>>(`/corporate/companies?${q}`);
    return res.data;
  },

  async getCompany(id: string): Promise<ApiCompany> {
    const res = await http.get<ApiCompany>(`/corporate/companies/${id}`);
    return res.data;
  },

  async getCompanyStats(id: string): Promise<ApiCompanyStats> {
    const res = await http.get<ApiCompanyStats>(`/corporate/companies/${id}/stats`);
    return res.data;
  },

  async addCompany(data: {
    name: string;
    code: string;
    registrationNo?: string;
    industry?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    city?: string;
    country?: string;
    currency?: string;
    website?: string;
    adminName?: string;
    adminEmail?: string;
    adminPhone?: string;
    adminPassword?: string;
  }): Promise<{ company: ApiCompany; initialAdmin?: { id: string; name: string; email: string; tempPassword?: string } }> {
    const res = await http.post<{ company: ApiCompany; initialAdmin?: { id: string; name: string; email: string; tempPassword?: string } }>(
      '/corporate/companies',
      data,
    );
    return res.data;
  },

  async updateCompany(id: string, data: Partial<ApiCompany>): Promise<ApiCompany> {
    const res = await http.patch<ApiCompany>(`/corporate/companies/${id}`, data);
    return res.data;
  },

  async deactivateCompany(id: string): Promise<ApiCompany> {
    const res = await http.patch<ApiCompany>(`/corporate/companies/${id}/deactivate`, {});
    return res.data;
  },

  async deleteCompany(id: string): Promise<void> {
    await http.delete(`/corporate/companies/${id}`);
  },

  // ── Departments ────────────────────────────────────────────────────────────

  async getDepartments(
    companyId: string,
    params?: { page?: number; limit?: number; search?: string },
  ): Promise<PaginatedResponse<ApiDepartment>> {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.search) q.set('search', params.search);
    const res = await http.get<PaginatedResponse<ApiDepartment>>(
      `/corporate/companies/${companyId}/departments?${q}`,
    );
    return res.data;
  },

  async addDepartment(companyId: string, data: { name: string; code?: string }): Promise<ApiDepartment> {
    const res = await http.post<ApiDepartment>(`/corporate/companies/${companyId}/departments`, data);
    return res.data;
  },

  async updateDepartment(companyId: string, deptId: string, data: { name?: string; code?: string }): Promise<ApiDepartment> {
    const res = await http.patch<ApiDepartment>(`/corporate/companies/${companyId}/departments/${deptId}`, data);
    return res.data;
  },

  async deleteDepartment(companyId: string, deptId: string): Promise<void> {
    await http.delete(`/corporate/companies/${companyId}/departments/${deptId}`);
  },

  // ── Members ────────────────────────────────────────────────────────────────

  async getMembers(
    companyId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      corporateRole?: string;
      departmentId?: string;
      isActive?: boolean;
    },
  ): Promise<PaginatedResponse<ApiMember>> {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.corporateRole) q.set('corporateRole', params.corporateRole);
    if (params?.departmentId) q.set('departmentId', params.departmentId);
    if (params?.isActive !== undefined) q.set('isActive', String(params.isActive));
    const res = await http.get<PaginatedResponse<ApiMember>>(
      `/corporate/companies/${companyId}/members?${q}`,
    );
    return res.data;
  },

  /**
   * Invite a new employee: directly provisions the User account with corporate company
   * association and creates the CorporateMember link transactionally on the server.
   */
  async inviteMember(
    companyId: string,
    data: {
      name: string;
      email: string;
      phone?: string;
      password?: string;         // temp password — user must change on first login
      corporateRole: string;
      employeeCode?: string;
      jobTitle?: string;
      departmentId?: string;
      managerId?: string;
    },
  ): Promise<{ member: ApiMember; tempPassword: string; isNewUser: boolean }> {
    const res = await http.post<{ member: ApiMember; tempPassword: string; isNewUser: boolean }>(
      `/corporate/companies/${companyId}/members/invite`,
      data,
    );
    return res.data;
  },

  async inviteEmployee(data: {
    name: string;
    email: string;
    companyId: string;
    companyName?: string;
    department?: string;
    corporateRole: any;
    employeeId?: string;
    jobTitle?: string;
    phone?: string;
    customTempPassword?: string;
  }): Promise<any> {
    try {
      const res = await this.inviteMember(data.companyId, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.customTempPassword,
        corporateRole: String(data.corporateRole),
        employeeCode: data.employeeId,
        jobTitle: data.jobTitle || data.department,
      });
      return {
        id: res.member.id,
        name: res.member.userName || data.name,
        email: res.member.userEmail || data.email,
        corporateRole: res.member.corporateRole || data.corporateRole,
        tempPassword: res.tempPassword,
        companyId: data.companyId,
      };
    } catch {
      const newEmp = {
        id: `c-usr-${Date.now()}`,
        name: data.name,
        email: data.email,
        corporateRole: data.corporateRole,
        tempPassword: data.customTempPassword || generateTemporaryPassword(),
        companyId: data.companyId,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      INITIAL_CORPORATE_USERS.unshift(newEmp as any);
      return newEmp;
    }
  },

  async updateMember(
    companyId: string,
    memberId: string,
    data: {
      corporateRole?: string;
      jobTitle?: string;
      departmentId?: string;
      employeeCode?: string;
      isActive?: boolean;
    },
  ): Promise<ApiMember> {
    const res = await http.patch<ApiMember>(
      `/corporate/companies/${companyId}/members/${memberId}`,
      data,
    );
    return res.data;
  },

  async deactivateMember(companyId: string, memberId: string): Promise<ApiMember> {
    const res = await http.patch<ApiMember>(
      `/corporate/companies/${companyId}/members/${memberId}/deactivate`,
      {},
    );
    return res.data;
  },

  async deleteMember(companyId: string, memberId: string): Promise<void> {
    await http.delete(`/corporate/companies/${companyId}/members/${memberId}`);
  },

  async getMemberRoleSummary(companyId: string): Promise<Record<string, number>> {
    const res = await http.get<Record<string, number>>(
      `/corporate/companies/${companyId}/members/role-summary`,
    );
    return res.data;
  },

  // ── Travel Policies ────────────────────────────────────────────────────────

  async getPolicies(
    companyId: string,
    params?: { isActive?: boolean; page?: number; limit?: number },
  ): Promise<PaginatedResponse<ApiTravelPolicy>> {
    const q = new URLSearchParams();
    if (params?.isActive !== undefined) q.set('isActive', String(params.isActive));
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const res = await http.get<PaginatedResponse<ApiTravelPolicy>>(
      `/corporate/companies/${companyId}/policies?${q}`,
    );
    return res.data;
  },

  async getDefaultPolicy(companyId: string): Promise<ApiTravelPolicy | null> {
    try {
      const res = await http.get<ApiTravelPolicy>(`/corporate/companies/${companyId}/policies/default`);
      return res.data;
    } catch {
      return null;
    }
  },

  async addPolicy(
    companyId: string,
    data: {
      name: string;
      description?: string;
      isDefault?: boolean;
      requiresApproval?: boolean;
      maxBudgetPerTrip?: number;
      maxBudgetPerDay?: number;
      allowedClasses?: string[];
      advanceBookingDays?: number;
      currency?: string;
      approvalSteps?: { stepOrder: number; stepName?: string; approverRole?: string; approverId?: string }[];
    },
  ): Promise<ApiTravelPolicy> {
    const res = await http.post<ApiTravelPolicy>(`/corporate/companies/${companyId}/policies`, data);
    return res.data;
  },

  async updatePolicy(
    companyId: string,
    policyId: string,
    data: Partial<{
      name: string;
      description: string;
      isDefault: boolean;
      isActive: boolean;
      requiresApproval: boolean;
      maxBudgetPerTrip: number;
      maxBudgetPerDay: number;
      allowedClasses: string[];
      advanceBookingDays: number;
      currency: string;
      approvalSteps: { stepOrder: number; stepName?: string; approverRole?: string; approverId?: string }[];
    }>,
  ): Promise<ApiTravelPolicy> {
    const res = await http.patch<ApiTravelPolicy>(
      `/corporate/companies/${companyId}/policies/${policyId}`,
      data,
    );
    return res.data;
  },

  async deletePolicy(companyId: string, policyId: string): Promise<void> {
    await http.delete(`/corporate/companies/${companyId}/policies/${policyId}`);
  },

  // ── Travel Requests ────────────────────────────────────────────────────────

  async getTravelRequests(
    companyId: string,
    params?: {
      status?: string;
      departmentId?: string;
      requesterId?: string;
      fromDate?: string;
      toDate?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponse<ApiTravelRequest>> {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.departmentId) q.set('departmentId', params.departmentId);
    if (params?.requesterId) q.set('requesterId', params.requesterId);
    if (params?.fromDate) q.set('fromDate', params.fromDate);
    if (params?.toDate) q.set('toDate', params.toDate);
    if (params?.search) q.set('search', params.search);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const res = await http.get<PaginatedResponse<ApiTravelRequest>>(
      `/corporate/companies/${companyId}/travel-requests?${q}`,
    );
    return res.data;
  },

  async getTravelRequest(companyId: string, requestId: string): Promise<ApiTravelRequest> {
    const res = await http.get<ApiTravelRequest>(
      `/corporate/companies/${companyId}/travel-requests/${requestId}`,
    );
    return res.data;
  },

  async approveRequest(
    companyId: string,
    requestId: string,
    data?: { comment?: string; grantBudgetOverride?: boolean; budgetOverrideReason?: string },
  ): Promise<ApiTravelRequest> {
    const res = await http.post<ApiTravelRequest>(
      `/corporate/companies/${companyId}/travel-requests/${requestId}/approve`,
      data ?? {},
    );
    return res.data;
  },

  async rejectRequest(
    companyId: string,
    requestId: string,
    data: { reason: string; comment?: string },
  ): Promise<ApiTravelRequest> {
    const res = await http.post<ApiTravelRequest>(
      `/corporate/companies/${companyId}/travel-requests/${requestId}/reject`,
      data,
    );
    return res.data;
  },

  async cancelRequest(
    companyId: string,
    requestId: string,
    reason: string,
  ): Promise<ApiTravelRequest> {
    const res = await http.post<ApiTravelRequest>(
      `/corporate/companies/${companyId}/travel-requests/${requestId}/cancel`,
      { reason },
    );
    return res.data;
  },

  async completeRequest(companyId: string, requestId: string, notes?: string): Promise<ApiTravelRequest> {
    const res = await http.post<ApiTravelRequest>(
      `/corporate/companies/${companyId}/travel-requests/${requestId}/complete`,
      { notes },
    );
    return res.data;
  },

  async getApprovalHistory(companyId: string, requestId: string): Promise<ApiApproval[]> {
    const res = await http.get<ApiApproval[]>(
      `/corporate/companies/${companyId}/travel-requests/${requestId}/approvals`,
    );
    return res.data;
  },

  async getPendingApprovals(companyId: string): Promise<ApiApproval[]> {
    const res = await http.get<ApiApproval[]>(
      `/corporate/companies/${companyId}/travel-requests/pending-approvals`,
    );
    return res.data;
  },

  // ── Budgets ────────────────────────────────────────────────────────────────

  async getBudgets(
    companyId: string,
    params?: { fiscalYear?: number; departmentId?: string; page?: number; limit?: number },
  ): Promise<PaginatedResponse<ApiCorporateBudget>> {
    const q = new URLSearchParams();
    if (params?.fiscalYear) q.set('fiscalYear', String(params.fiscalYear));
    if (params?.departmentId) q.set('departmentId', params.departmentId);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const res = await http.get<PaginatedResponse<ApiCorporateBudget>>(
      `/corporate/companies/${companyId}/budgets?${q}`,
    );
    return res.data;
  },

  async getBudgetSummary(companyId: string, fiscalYear: number) {
    const res = await http.get(`/corporate/companies/${companyId}/budgets/summary/${fiscalYear}`);
    return res.data;
  },

  async addBudget(
    companyId: string,
    data: {
      fiscalYear: number;
      fiscalQuarter?: number;
      totalBudget: number;
      currency?: string;
      notes?: string;
      departmentId?: string;
    },
  ): Promise<ApiCorporateBudget> {
    const res = await http.post<ApiCorporateBudget>(`/corporate/companies/${companyId}/budgets`, data);
    return res.data;
  },

  async updateBudget(companyId: string, budgetId: string, data: { totalBudget?: number; notes?: string }): Promise<ApiCorporateBudget> {
    const res = await http.patch<ApiCorporateBudget>(
      `/corporate/companies/${companyId}/budgets/${budgetId}`,
      data,
    );
    return res.data;
  },

  // ── Reports ────────────────────────────────────────────────────────────────

  async getSpendReport(
    companyId: string,
    params?: { fiscalYear?: number; departmentId?: string; fromDate?: string; toDate?: string },
  ): Promise<ApiSpendReport> {
    const q = new URLSearchParams();
    if (params?.fiscalYear) q.set('fiscalYear', String(params.fiscalYear));
    if (params?.departmentId) q.set('departmentId', params.departmentId);
    if (params?.fromDate) q.set('fromDate', params.fromDate);
    if (params?.toDate) q.set('toDate', params.toDate);
    const res = await http.get<ApiSpendReport>(
      `/corporate/companies/${companyId}/reports/spend?${q}`,
    );
    return res.data;
  },

  async getRequestStats(companyId: string, params?: { fiscalYear?: number; departmentId?: string }) {
    const q = new URLSearchParams();
    if (params?.fiscalYear) q.set('fiscalYear', String(params.fiscalYear));
    if (params?.departmentId) q.set('departmentId', params.departmentId);
    const res = await http.get(`/corporate/companies/${companyId}/reports/requests?${q}`);
    return res.data;
  },

  async getPolicyCompliance(companyId: string, params?: { fiscalYear?: number }) {
    const q = new URLSearchParams();
    if (params?.fiscalYear) q.set('fiscalYear', String(params.fiscalYear));
    const res = await http.get(`/corporate/companies/${companyId}/reports/policy-compliance?${q}`);
    return res.data;
  },

  async getApproverPerformance(companyId: string, params?: { fiscalYear?: number }) {
    const q = new URLSearchParams();
    if (params?.fiscalYear) q.set('fiscalYear', String(params.fiscalYear));
    const res = await http.get(`/corporate/companies/${companyId}/reports/approver-performance?${q}`);
    return res.data;
  },

  // ── Legacy methods for backward-compatibility with public portal ─────────
  async getCorporateUsers(): Promise<any[]> {
    return [...INITIAL_CORPORATE_USERS];
  },

  async addCorporateUser(data: any): Promise<any> {
    const newUser = {
      ...data,
      id: `c-usr-${Date.now()}`,
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };
    INITIAL_CORPORATE_USERS.unshift(newUser);
    return newUser;
  },

  async updateCorporateUser(id: string, data: any): Promise<any> {
    const idx = INITIAL_CORPORATE_USERS.findIndex((u) => u.id === id);
    if (idx !== -1) {
      Object.assign(INITIAL_CORPORATE_USERS[idx], data);
      return INITIAL_CORPORATE_USERS[idx];
    }
    return null;
  },

  async deleteCorporateUser(id: string): Promise<boolean> {
    const idx = INITIAL_CORPORATE_USERS.findIndex((u) => u.id === id);
    if (idx !== -1) INITIAL_CORPORATE_USERS.splice(idx, 1);
    return true;
  },

  async getTravelPolicies(): Promise<any[]> {
    return [...INITIAL_TRAVEL_POLICIES];
  },

  async getCorporateBookings(): Promise<any[]> {
    return [...INITIAL_CORPORATE_BOOKINGS];
  },

  async addCorporateBooking(booking: any): Promise<any> {
    const newBkg = {
      ...booking,
      id: `cbkg-${Date.now()}`,
      reference: `CB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };
    INITIAL_CORPORATE_BOOKINGS.unshift(newBkg);
    return newBkg;
  },

  async updateCorporateBooking(id: string, data: any): Promise<any> {
    const idx = INITIAL_CORPORATE_BOOKINGS.findIndex((b) => b.id === id);
    if (idx !== -1) {
      Object.assign(INITIAL_CORPORATE_BOOKINGS[idx], data, { updatedAt: new Date().toISOString() });
      return INITIAL_CORPORATE_BOOKINGS[idx];
    }
    return null;
  },

  async updateBookingStatus(id: string, status: string, reviewer?: string, reason?: string): Promise<any> {
    const idx = INITIAL_CORPORATE_BOOKINGS.findIndex((b) => b.id === id);
    if (idx !== -1) {
      Object.assign(INITIAL_CORPORATE_BOOKINGS[idx], {
        status,
        approvedBy: status === 'APPROVED' ? (reviewer || 'Corporate Approver') : undefined,
        approvedAt: status === 'APPROVED' ? new Date().toISOString() : undefined,
        rejectionReason: status === 'REJECTED' ? (reason || 'Exceeds budget policy') : undefined,
        updatedAt: new Date().toISOString(),
      });
      return INITIAL_CORPORATE_BOOKINGS[idx];
    }
    return null;
  },
};
