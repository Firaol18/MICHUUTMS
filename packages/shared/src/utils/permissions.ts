import type {
  Role,
  PermissionResource,
  PermissionAction,
  PermissionString,
  RoleDefinition,
} from '@tms/shared/types/rbac';

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    label: 'Super Administrator',
    description: 'Unrestricted enterprise control across all platform resources, financial ledgers, and RBAC policies.',
    permissions: [
      'tour:create', 'tour:update', 'tour:delete',
      'booking:create', 'booking:approve',
      'payment:create', 'payment:refund',
      'report:view', 'customer:view', 'supplier:manage',
      'tours:create', 'tours:read', 'tours:update', 'tours:delete', 'tours:manage',
      'bookings:create', 'bookings:read', 'bookings:update', 'bookings:manage',
      'guides:create', 'guides:read', 'guides:update', 'guides:manage',
      'analytics:read', 'reviews:manage', 'settings:manage',
    ],
  },
  ADMIN: {
    role: 'ADMIN',
    label: 'Tourism Administrator',
    description: 'Full portal operations management, package approvals, user accounts, and revenue oversight.',
    permissions: [
      'tour:create', 'tour:update', 'tour:delete',
      'booking:create', 'booking:approve',
      'payment:create', 'payment:refund',
      'report:view', 'customer:view', 'supplier:manage',
      'tours:create', 'tours:read', 'tours:update', 'tours:delete', 'tours:manage',
      'bookings:create', 'bookings:read', 'bookings:update',
      'guides:create', 'guides:read', 'guides:update',
      'analytics:read', 'reviews:manage', 'settings:read',
    ],
  },
  TOUR_MANAGER: {
    role: 'TOUR_MANAGER',
    label: 'Tour Operations Manager',
    description: 'Creates and manages tour packages, configures itineraries, and assigns guides.',
    permissions: [
      'tour:create', 'tour:update', 'tour:delete',
      'booking:create', 'booking:approve',
      'report:view', 'customer:view', 'supplier:manage',
      'tours:create', 'tours:read', 'tours:update', 'tours:manage',
      'bookings:read', 'bookings:update', 'guides:read', 'guides:update',
    ],
  },
  BOOKING_AGENT: {
    role: 'BOOKING_AGENT',
    label: 'Booking & Reservations Agent',
    description: 'Processes online customer reservations, confirms booking statuses, and verifies passport data.',
    permissions: [
      'booking:create', 'booking:approve',
      'customer:view', 'tour:update',
      'bookings:create', 'bookings:read', 'bookings:update', 'tours:read',
    ],
  },
  ACCOUNTANT: {
    role: 'ACCOUNTANT',
    label: 'Finance Accountant',
    description: 'Monitors booking transactions, processes refund payouts, generates ledger & tax reports.',
    permissions: [
      'payment:create', 'payment:refund',
      'report:view', 'customer:view',
      'bookings:read', 'bookings:update', 'analytics:read', 'settings:read',
    ],
  },
  GUIDE: {
    role: 'GUIDE',
    label: 'Licensed Ranger Guide',
    description: 'Views assigned expedition schedules, passenger rosters, emergency contacts, and daily itineraries.',
    permissions: [
      'customer:view', 'report:view',
      'tours:read', 'bookings:read', 'guides:read',
    ],
  },
  DRIVER: {
    role: 'DRIVER',
    label: 'Expedition Fleet Driver',
    description: 'Accesses vehicle dispatch rosters, tourist pickup points, and passenger headcounts.',
    permissions: [
      'customer:view',
      'tours:read', 'bookings:read',
    ],
  },
  CUSTOMER: {
    role: 'CUSTOMER',
    label: 'Public Traveler / Customer',
    description: 'Browses destinations, reserves tour packages, manages self-service bookings & reviews.',
    permissions: [
      'booking:create', 'payment:create',
      'tours:read', 'tours:book', 'bookings:create', 'bookings:read', 'reviews:read',
    ],
  },

  // ── Legacy Aliases ────────────────────────────────────────────────────────
  admin: {
    role: 'admin',
    label: 'Tourism Administrator (Legacy)',
    description: 'Full portal control.',
    permissions: [
      'tour:create', 'tour:update', 'tour:delete', 'booking:create', 'booking:approve',
      'payment:create', 'payment:refund', 'report:view', 'customer:view', 'supplier:manage',
      'tours:create', 'tours:read', 'tours:update', 'tours:delete', 'tours:manage', 'tours:book',
      'bookings:create', 'bookings:read', 'bookings:update', 'bookings:delete', 'bookings:manage',
      'guides:create', 'guides:read', 'guides:update', 'guides:delete', 'guides:manage',
      'analytics:read', 'reviews:manage', 'settings:read', 'settings:update', 'settings:manage',
    ],
  },
  tour_operator: {
    role: 'tour_operator',
    label: 'Tour Operator (Legacy)',
    description: 'Creates and manages tour packages.',
    permissions: [
      'tour:create', 'tour:update', 'booking:create', 'booking:approve', 'customer:view',
      'tours:create', 'tours:read', 'tours:update', 'tours:manage',
      'bookings:create', 'bookings:read', 'bookings:update', 'guides:read', 'guides:update', 'analytics:read', 'reviews:read',
    ],
  },
  tour_guide: {
    role: 'tour_guide',
    label: 'Tour Guide (Legacy)',
    description: 'Views assigned tours.',
    permissions: ['customer:view', 'tours:read', 'bookings:read', 'guides:read'],
  },
  finance_manager: {
    role: 'finance_manager',
    label: 'Finance Manager (Legacy)',
    description: 'Financial reports & payments.',
    permissions: ['payment:create', 'payment:refund', 'report:view', 'bookings:read', 'bookings:update', 'analytics:read', 'tours:read', 'settings:read'],
  },
  tourist: {
    role: 'tourist',
    label: 'Traveler / Customer (Legacy)',
    description: 'Public traveler.',
    permissions: ['booking:create', 'payment:create', 'tours:read', 'tours:book', 'bookings:create', 'bookings:read', 'reviews:read'],
  },

  // ── Corporate Roles ────────────────────────────────────────────────────────
  CORPORATE_ADMIN: {
    role: 'CORPORATE_ADMIN',
    label: 'Corporate Administrator',
    description: 'Full management of company account, travel policies, employees, and corporate approvals.',
    permissions: ['booking:create', 'booking:approve', 'bookings:read', 'bookings:create', 'bookings:update', 'report:view', 'tours:read', 'tours:book'],
  },
  TRAVEL_MANAGER: {
    role: 'TRAVEL_MANAGER',
    label: 'Corporate Travel Manager',
    description: 'Books travel for company employees and manages policy compliance.',
    permissions: ['booking:create', 'booking:approve', 'bookings:read', 'bookings:create', 'bookings:update', 'report:view', 'tours:read', 'tours:book'],
  },
  APPROVER: {
    role: 'APPROVER',
    label: 'Line Budget Approver',
    description: 'Reviews and approves or rejects corporate employee booking requests.',
    permissions: ['booking:approve', 'bookings:read', 'report:view', 'tours:read'],
  },
  TRAVELER: {
    role: 'TRAVELER',
    label: 'Corporate Traveler',
    description: 'Searches and books flights and accommodations under company travel policy.',
    permissions: ['booking:create', 'bookings:read', 'bookings:create', 'tours:read', 'tours:book'],
  },
};

export function hasPermission(
  role: Role,
  resource: PermissionResource,
  action: PermissionAction
): boolean {
  const roleDef = ROLE_DEFINITIONS[role];
  if (!roleDef) return false;

  // Super Admin & Admin bypass
  if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'admin') return true;

  const targetPermSingular: PermissionString = `${resource}:${action}`;
  const targetPermPlural: PermissionString = `${resource}s:${action}`;
  const managePermSingular: PermissionString = `${resource}:manage`;
  const managePermPlural: PermissionString = `${resource}s:manage`;

  return (
    roleDef.permissions.includes(targetPermSingular) ||
    roleDef.permissions.includes(targetPermPlural) ||
    roleDef.permissions.includes(managePermSingular) ||
    roleDef.permissions.includes(managePermPlural)
  );
}

export function hasAnyPermission(
  role: Role,
  permissionQueries: Array<{ resource: PermissionResource; action: PermissionAction }>
): boolean {
  return permissionQueries.some((q) => hasPermission(role, q.resource, q.action));
}
