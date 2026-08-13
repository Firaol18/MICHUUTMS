export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'TOUR_MANAGER'
  | 'BOOKING_AGENT'
  | 'ACCOUNTANT'
  | 'GUIDE'
  | 'DRIVER'
  | 'CUSTOMER'
  // Legacy aliases
  | 'admin'
  | 'tour_operator'
  | 'tour_guide'
  | 'finance_manager'
  | 'tourist';

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
