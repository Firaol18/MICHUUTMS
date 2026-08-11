export type Role = 'admin' | 'tour_operator' | 'tour_guide' | 'finance_manager' | 'tourist';

export type PermissionResource =
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
  | 'manage'
  | 'book';

export type PermissionString = `${PermissionResource}:${PermissionAction}`;

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
