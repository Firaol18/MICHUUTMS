import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Portal Features
import { HomePage } from '@/features/public/HomePage';
import { TourCatalogPage } from '@/features/public/TourCatalogPage';
import { TourDetailsPage } from '@/features/public/TourDetailsPage';
import { EventsCalendarPage } from '@/features/public/EventsCalendarPage';
import { TravelBlogPage } from '@/features/public/TravelBlogPage';
import { UserDashboardPage } from '@/features/public/UserDashboardPage';
import { ContactFaqPage } from '@/features/public/ContactFaqPage';
import { CustomItineraryBuilderPage } from '@/features/public/CustomItineraryBuilderPage';

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

// Auth Login Pages
import { LoginPage } from '@/features/auth/LoginPage';
import { AdminLoginPage } from '@/features/auth/AdminLoginPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Traveler Portal Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tours" element={<TourCatalogPage />} />
          <Route path="/tours/:id" element={<TourDetailsPage />} />
          <Route path="/my-bookings" element={<UserDashboardPage />} />
          <Route path="/user/dashboard" element={<UserDashboardPage />} />
          <Route path="/events" element={<EventsCalendarPage />} />
          <Route path="/blog" element={<TravelBlogPage />} />
          <Route path="/contact" element={<ContactFaqPage />} />
          <Route path="/faq" element={<ContactFaqPage />} />
          <Route path="/plan-trip" element={<CustomItineraryBuilderPage />} />
          <Route path="/custom-trip" element={<CustomItineraryBuilderPage />} />
        </Route>

        {/* Public Traveler Login & Register Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dedicated Admin Staff Login Route */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Management Portal Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'tour_operator', 'finance_manager']} redirectTo="/admin/login" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/tours" element={<AdminToursPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/issues" element={<AdminIssuesPage />} />
            <Route path="/admin/enquiries" element={<AdminEnquiriesPage />} />
            <Route path="/admin/pages" element={<AdminPagesPage />} />
            <Route path="/admin/guides" element={<AdminGuidesPage />} />

            {/* Guarded Settings Route */}
            <Route element={<ProtectedRoute requiredResource="settings" requiredAction="read" redirectTo="/admin/login" />}>
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
