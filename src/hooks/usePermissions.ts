import { useAuthStore } from '@/store/useAuthStore';
import { hasPermission, hasAnyPermission } from '@/utils/permissions';
import type { Role, PermissionResource, PermissionAction } from '@/types/rbac';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const userRole: Role = user?.role || 'tourist';

  return {
    userRole,
    user,
    can: (resource: PermissionResource, action: PermissionAction): boolean =>
      hasPermission(userRole, resource, action),

    canAny: (
      permissions: Array<{ resource: PermissionResource; action: PermissionAction }>
    ): boolean => hasAnyPermission(userRole, permissions),

    hasRole: (roles: Role | Role[]): boolean => {
      const allowed = Array.isArray(roles) ? roles : [roles];
      return allowed.includes(userRole);
    },
  };
}
