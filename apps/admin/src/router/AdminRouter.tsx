import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { AdminLayout } from '@tms/shared/components/layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Admin Portal Features
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';
import { AdminToursPage } from '@/features/admin/AdminToursPage';
import { AdminUsersPage } from '@/features/admin/AdminUsersPage';
import { AdminBookingsPage } from '@/features/admin/AdminBookingsPage';
import { AdminIssuesPage } from '@/features/admin/AdminIssuesPage';
import { AdminEnquiriesPage } from '@/features/admin/AdminEnquiriesPage';
import { AdminPagesPage } from '@/features/admin/AdminPagesPage';
import { AdminGuidesPage } from '@/features/admin/AdminGuidesPage';
import { AdminSettingsPage } from '@/features/admin/AdminSettingsPage';
import { AdminRolesPage } from '@/features/admin/AdminRolesPage';
import { AdminPermissionResourcesPage } from '@/features/admin/AdminPermissionResourcesPage';
import { AdminPermissionActionsPage } from '@/features/admin/AdminPermissionActionsPage';
import { AdminSuppliersPage } from '@/features/admin/AdminSuppliersPage';
import { AdminDriversPage } from '@/features/admin/AdminDriversPage';
import { AdminVehiclesPage } from '@/features/admin/AdminVehiclesPage';
import { AdminPaymentsPage } from '@/features/admin/AdminPaymentsPage';
import { AdminExpensesPage } from '@/features/admin/AdminExpensesPage';
import { AdminReportsPage } from '@/features/admin/AdminReportsPage';
import { AdminEventsPage } from '@/features/admin/AdminEventsPage';
import { AdminBlogPage } from '@/features/admin/AdminBlogPage';
import { AdminCustomTripsPage } from '@/features/admin/AdminCustomTripsPage';
import { AdminEmployeesPage } from '@/features/admin/AdminEmployeesPage';
import { AdminCompaniesPage } from '@/features/admin/AdminCompaniesPage';
import { AdminCorporateUsersPage } from '@/features/admin/AdminCorporateUsersPage';
import { AdminTravelPoliciesPage } from '@/features/admin/AdminTravelPoliciesPage';
import { AdminCorporateBookingsPage } from '@/features/admin/AdminCorporateBookingsPage';

// Auth
import { AdminLoginPage } from '@/features/auth/AdminLoginPage';

export const AdminRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Login ── */}
        <Route path="/login" element={<AdminLoginPage />} />

        {/* ── Admin Management Portal Protected Routes ── */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={['admin', 'tour_operator', 'finance_manager']}
              redirectTo="/login"
            />
          }
        >
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<AdminDashboardPage />} />
            <Route path="/tours" element={<AdminToursPage />} />
            <Route path="/bookings" element={<AdminBookingsPage />} />
            <Route path="/users" element={<AdminUsersPage />} />
            <Route path="/customers" element={<AdminUsersPage />} />
            <Route path="/suppliers" element={<AdminSuppliersPage />} />
            <Route path="/guides" element={<AdminGuidesPage />} />
            <Route path="/drivers" element={<AdminDriversPage />} />
            <Route path="/vehicles" element={<AdminVehiclesPage />} />
            <Route path="/payments" element={<AdminPaymentsPage />} />
            <Route path="/expenses" element={<AdminExpensesPage />} />
            <Route path="/reports" element={<AdminReportsPage />} />
            <Route path="/issues" element={<AdminIssuesPage />} />
            <Route path="/enquiries" element={<AdminEnquiriesPage />} />
            <Route path="/custom-trips" element={<AdminCustomTripsPage />} />
            <Route path="/events" element={<AdminEventsPage />} />
            <Route path="/blog" element={<AdminBlogPage />} />
            <Route path="/pages" element={<AdminPagesPage />} />
            <Route path="/roles" element={<AdminRolesPage />} />
            <Route path="/employees" element={<AdminEmployeesPage />} />
            <Route path="/permission-resources" element={<AdminPermissionResourcesPage />} />
            <Route path="/permission-actions" element={<AdminPermissionActionsPage />} />

            {/* Corporate Management */}
            <Route path="/companies" element={<AdminCompaniesPage />} />
            <Route path="/corporate-users" element={<AdminCorporateUsersPage />} />
            <Route path="/travel-policies" element={<AdminTravelPoliciesPage />} />
            <Route path="/corporate-bookings" element={<AdminCorporateBookingsPage />} />

            {/* Guarded Settings Route */}
            <Route
              element={
                <ProtectedRoute
                  requiredResource="settings"
                  requiredAction="read"
                  redirectTo="/login"
                />
              }
            >
              <Route path="/settings" element={<AdminSettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
