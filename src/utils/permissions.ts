import type {
  Role,
  PermissionResource,
  PermissionAction,
  PermissionString,
  RoleDefinition,
} from '@/types/rbac';

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  admin: {
    role: 'admin',
    label: 'Tourism Administrator',
    description: 'Full portal control, package approvals, financial reports, user management, and settings.',
    permissions: [
      'tours:create',
      'tours:read',
      'tours:update',
      'tours:delete',
      'tours:manage',
      'tours:book',
      'bookings:create',
      'bookings:read',
      'bookings:update',
      'bookings:delete',
      'bookings:manage',
      'guides:create',
      'guides:read',
      'guides:update',
      'guides:delete',
      'guides:manage',
      'analytics:read',
      'reviews:manage',
      'settings:read',
      'settings:update',
      'settings:manage',
    ],
  },
  tour_operator: {
    role: 'tour_operator',
    label: 'Tour Operator',
    description: 'Creates and manages tour packages, reviews customer reservations, assigns guides.',
    permissions: [
      'tours:create',
      'tours:read',
      'tours:update',
      'tours:manage',
      'bookings:create',
      'bookings:read',
      'bookings:update',
      'guides:read',
      'guides:update',
      'analytics:read',
      'reviews:read',
    ],
  },
  tour_guide: {
    role: 'tour_guide',
    label: 'Licensed Tour Guide',
    description: 'Views assigned upcoming tours, daily itineraries, and passenger manifests.',
    permissions: [
      'tours:read',
      'bookings:read',
      'guides:read',
    ],
  },
  finance_manager: {
    role: 'finance_manager',
    label: 'Finance Manager',
    description: 'Monitors booking revenue, payment statuses, refunds, and financial reporting.',
    permissions: [
      'bookings:read',
      'bookings:update',
      'analytics:read',
      'tours:read',
      'settings:read',
    ],
  },
  tourist: {
    role: 'tourist',
    label: 'Traveler / Customer',
    description: 'Public traveler. Browses destinations, books tour packages, manages personal bookings.',
    permissions: [
      'tours:read',
      'tours:book',
      'bookings:create',
      'bookings:read',
      'reviews:read',
    ],
  },
};

export function hasPermission(
  role: Role,
  resource: PermissionResource,
  action: PermissionAction
): boolean {
  const roleDef = ROLE_DEFINITIONS[role];
  if (!roleDef) return false;

  // Admin bypass
  if (role === 'admin') return true;

  const targetPerm: PermissionString = `${resource}:${action}`;
  const managePerm: PermissionString = `${resource}:manage`;

  return roleDef.permissions.includes(targetPerm) || roleDef.permissions.includes(managePerm);
}

export function hasAnyPermission(
  role: Role,
  permissionQueries: Array<{ resource: PermissionResource; action: PermissionAction }>
): boolean {
  return permissionQueries.some((q) => hasPermission(role, q.resource, q.action));
}
