export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'TOUR_MANAGER'
  | 'BOOKING_AGENT'
  | 'ACCOUNTANT'
  | 'GUIDE'
  | 'DRIVER'
  | 'CUSTOMER'
  // Corporate Travel Roles
  | 'CORPORATE_ADMIN'
  | 'TRAVEL_MANAGER'
  | 'APPROVER'
  | 'TRAVELER'
  // Legacy aliases
  | 'admin'
  | 'tour_operator'
  | 'tour_guide'
  | 'finance_manager'
  | 'tourist';

// Helper: Check if a role is a corporate role
export const CORPORATE_ROLES: Role[] = ['CORPORATE_ADMIN', 'TRAVEL_MANAGER', 'APPROVER', 'TRAVELER'];
export const isCorporateRole = (role?: Role | string): boolean =>
  !!role && CORPORATE_ROLES.includes(role as Role);

export type PermissionResource =
  | 'tour'
  | 'booking'
  | 'payment'
  | 'report'
  | 'customer'
  | 'supplier'
  | 'guide'
  | 'driver'
  | 'system'
  // Corporate resources
  | 'corporate_booking'
  | 'corporate_approval'
  | 'corporate_employee'
  | 'corporate_policy'
  // Legacy aliases
  | 'tours'
  | 'bookings'
  | 'guides'
  | 'analytics'
  | 'reviews'
  | 'settings'
  | 'users';

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'refund'
  | 'view'
  | 'manage'
  | 'book';

export type PermissionString =
  | 'tour:create'
  | 'tour:update'
  | 'tour:delete'
  | 'booking:create'
  | 'booking:approve'
  | 'payment:create'
  | 'payment:refund'
  | 'report:view'
  | 'customer:view'
  | 'supplier:manage'
  | string;

export interface PermissionQuery {
  resource: PermissionResource;
  action: PermissionAction;
}

export interface RoleDefinition {
  role: Role;
  label: string;
  description: string;
  permissions: PermissionString[];
}

export interface PermissionResourceItem {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'core' | 'finance' | 'ops' | 'system';
}

export interface PermissionActionItem {
  id: string;
  key: string;
  name: string;
  description: string;
}
