import type { Role } from './rbac';

export type { Role };

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  department?: string;
  phone?: string;
  nationality?: string;
  ecName?: string;
  ecRelationship?: string;
  ecPhone?: string;
  ecEmail?: string;
  passportType?: string;
  passportNumber?: string;
  passportCountry?: string;
  passportExpiry?: string;
  dietaryNeeds?: string;
  languages?: string;
  accessibility?: string;
  preferredCurrency?: string;
  accommodation?: string;
  tourTypes?: string[];
  completedTripsCount?: number;
  emailVerified?: boolean;
  // ── Corporate identity fields (present when role is a corporate role) ──
  companyId?: string;
  companyName?: string;
  departmentId?: string;
  departmentName?: string;
  managerId?: string;
  managerName?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}
