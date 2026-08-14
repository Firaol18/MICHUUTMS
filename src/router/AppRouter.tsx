import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';

// Public Portal Features
import { HomePage } from '@/features/public/HomePage';
import { TourCatalogPage } from '@/features/public/TourCatalogPage';
import { TourDetailsPage } from '@/features/public/TourDetailsPage';
import { EventsCalendarPage } from '@/features/public/EventsCalendarPage';
import { TravelBlogPage } from '@/features/public/TravelBlogPage';
import { ContactFaqPage } from '@/features/public/ContactFaqPage';
import { CustomItineraryBuilderPage } from '@/features/public/CustomItineraryBuilderPage';

// ── User Account (authenticated) ──
import { UserAccountLayout } from '@/features/public/UserAccountLayout';
import { UserDashboardOverview } from '@/features/public/UserDashboardOverview';
import { MyBookingsPage } from '@/features/public/MyBookingsPage';
import { InvoicesPage } from '@/features/public/InvoicesPage';
import { WishlistPage } from '@/features/public/WishlistPage';
import { ReviewsPage } from '@/features/public/ReviewsPage';
import { ProfilePage } from '@/features/public/ProfilePage';
import { SupportTicketsPage } from '@/features/public/SupportTicketsPage';

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

// Guide Portal Features
import { GuideDashboardPage } from '@/features/guide/GuideDashboardPage';

// Auth Login Pages
import { LoginPage } from '@/features/auth/LoginPage';
import { AdminLoginPage } from '@/features/auth/AdminLoginPage';

export const AppRouter: React.FC = () => {
  // Determine if the user is accessing the app via the designated Admin port (5174) or an admin subdomain
  const isAdminApp = window.location.port === '5174' || window.location.hostname.startsWith('admin');

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Traveler Portal (no auth required) ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={isAdminApp ? <Navigate to="/admin" replace /> : <HomePage />} />
          <Route path="/tours" element={<TourCatalogPage />} />
          <Route path="/tours/:id" element={<TourDetailsPage />} />
          <Route path="/events" element={<EventsCalendarPage />} />
          <Route path="/blog" element={<TravelBlogPage />} />
          <Route path="/contact" element={<ContactFaqPage />} />
          <Route path="/faq" element={<ContactFaqPage />} />
          <Route path="/plan-trip" element={<CustomItineraryBuilderPage />} />
          <Route path="/custom-trip" element={<CustomItineraryBuilderPage />} />

          {/* ── Authenticated User Account (all roles) ── */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={['tourist', 'admin', 'tour_operator', 'finance_manager']}
                redirectTo="/login"
              />
            }
          >
            <Route element={<UserAccountLayout />}>
              {/* /user/dashboard → overview */}
              <Route path="/user/dashboard" element={<UserDashboardOverview />} />

              {/* /my-bookings → bookings list */}
              <Route path="/my-bookings" element={<MyBookingsPage />} />

              {/* /user/issues → support tickets tracker */}
              <Route path="/user/issues" element={<SupportTicketsPage />} />

              {/* /user/invoices → receipts */}
              <Route path="/user/invoices" element={<InvoicesPage />} />

              {/* /user/wishlist → wishlist */}
              <Route path="/user/wishlist" element={<WishlistPage />} />

              {/* /user/reviews → reviews */}
              <Route path="/user/reviews" element={<ReviewsPage />} />

              {/* /user/profile → profile & settings */}
              <Route path="/user/profile" element={<ProfilePage />} />

              {/* /user/guide-dashboard & /guide/dashboard → Guide Portal */}
              <Route path="/user/guide-dashboard" element={<GuideDashboardPage />} />
              <Route path="/guide/dashboard" element={<GuideDashboardPage />} />
            </Route>
          </Route>
        </Route>

        {/* ── Public Traveler Login & Register (guest only) ── */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* ── Dedicated Admin Staff Login Route ── */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* ── Admin Management Portal Protected Routes ── */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={['admin', 'tour_operator', 'finance_manager']}
              redirectTo="/admin/login"
            />
          }
        >
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/tours" element={<AdminToursPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/customers" element={<AdminUsersPage />} />
            <Route path="/admin/suppliers" element={<AdminSuppliersPage />} />
            <Route path="/admin/guides" element={<AdminGuidesPage />} />
            <Route path="/admin/drivers" element={<AdminDriversPage />} />
            <Route path="/admin/vehicles" element={<AdminVehiclesPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/expenses" element={<AdminExpensesPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/issues" element={<AdminIssuesPage />} />
            <Route path="/admin/enquiries" element={<AdminEnquiriesPage />} />
            <Route path="/admin/custom-trips" element={<AdminCustomTripsPage />} />
            <Route path="/admin/events" element={<AdminEventsPage />} />
            <Route path="/admin/blog" element={<AdminBlogPage />} />
            <Route path="/admin/pages" element={<AdminPagesPage />} />
            <Route path="/admin/roles" element={<AdminRolesPage />} />
            <Route path="/admin/employees" element={<AdminEmployeesPage />} />
            <Route path="/admin/permission-resources" element={<AdminPermissionResourcesPage />} />
            <Route path="/admin/permission-actions" element={<AdminPermissionActionsPage />} />

            {/* Guarded Settings Route */}
            <Route
              element={
                <ProtectedRoute
                  requiredResource="settings"
                  requiredAction="read"
                  redirectTo="/admin/login"
                />
              }
            >
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
