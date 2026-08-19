import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { usePermissions } from '@tms/shared/hooks/usePermissions';
import type { PermissionResource, PermissionAction, Role } from '@tms/shared/types/rbac';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Badge } from '@tms/shared/components/common/Badge';

interface ProtectedRouteProps {
  requiredResource?: PermissionResource;
  requiredAction?: PermissionAction;
  allowedRoles?: Role | Role[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredResource,
  requiredAction,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { can, hasRole, userRole } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  let isAuthorized = true;

  if (allowedRoles) {
    isAuthorized = isAuthorized && hasRole(allowedRoles);
  }

  if (requiredResource && requiredAction) {
    isAuthorized = isAuthorized && can(requiredResource, requiredAction);
  }

  if (!isAuthorized) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh', padding: '2rem' }}>
        <Card glass style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div
            className="flex-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'var(--status-danger-bg)',
              color: 'var(--status-danger)',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '0.5rem' }}>
            Access Restricted (RBAC Enforcement)
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Your active role <Badge variant="warning">{userRole.toUpperCase()}</Badge> does not have permission to access resource{' '}
            <code>{requiredResource || 'this route'}</code>.
          </p>
          <div className="flex-center" style={{ gap: '0.75rem' }}>
            <Button variant="primary" size="sm" icon={<ArrowLeft size={16} />} onClick={() => window.history.back()}>
              Return to Previous Page
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <Outlet />;
};

/**
 * GuestRoute — accessible only when NOT logged in.
 * If the user is already authenticated, redirect them to the user dashboard.
 */
export const GuestRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate to="/user/dashboard" replace />;
};
