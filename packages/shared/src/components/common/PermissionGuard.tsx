import React from 'react';
import { usePermissions } from '@tms/shared/hooks/usePermissions';
import type { PermissionResource, PermissionAction, Role } from '@tms/shared/types/rbac';

export interface PermissionGuardProps {
  resource?: PermissionResource;
  action?: PermissionAction;
  allowedRoles?: Role | Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RBAC Permission Guard component.
 * Conditionally renders children if the logged-in user possesses the required permission/role.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { can, hasRole } = usePermissions();

  let isAuthorized = true;

  if (allowedRoles) {
    isAuthorized = isAuthorized && hasRole(allowedRoles);
  }

  if (resource && action) {
    isAuthorized = isAuthorized && can(resource, action);
  }

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
