import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import { PublicLayout } from '@tms/shared/components/layout/PublicLayout';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';

// Public Portal Features
import { HomePage } from '@/features/public/HomePage';
import { TourCatalogPage } from '@/features/public/TourCatalogPage';
import { TourDetailsPage } from '@/features/public/TourDetailsPage';
import { EventsCalendarPage } from '@/features/public/EventsCalendarPage';
import { TravelBlogPage } from '@/features/public/TravelBlogPage';
import { ContactFaqPage } from '@/features/public/ContactFaqPage';
import { CustomItineraryBuilderPage } from '@/features/public/CustomItineraryBuilderPage';
import { FlightSearchPage } from '@/features/public/FlightSearchPage';
import { FlightResultsPage } from '@/features/public/FlightResultsPage';
import { HotelSearchPage } from '@/features/public/HotelSearchPage';
import { HotelResultsPage } from '@/features/public/HotelResultsPage';

// ── User Account (authenticated) ──
import { UserAccountLayout } from '@/features/public/UserAccountLayout';
import { UserDashboardOverview } from '@/features/public/UserDashboardOverview';
import { MyBookingsPage } from '@/features/public/MyBookingsPage';
import { InvoicesPage } from '@/features/public/InvoicesPage';
import { WishlistPage } from '@/features/public/WishlistPage';
import { ReviewsPage } from '@/features/public/ReviewsPage';
import { ProfilePage } from '@/features/public/ProfilePage';
import { SupportTicketsPage } from '@/features/public/SupportTicketsPage';

// Guide Portal Features
import { GuideDashboardPage } from '@/features/guide/GuideDashboardPage';

// Auth
import { LoginPage } from '@/features/auth/LoginPage';
import { VerifyEmailPage } from '@/features/auth/VerifyEmailPage';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';

// Corporate Portal Features
import { CorporateLayout } from '@/features/corporate/CorporateLayout';
import { CorporateDashboardPage } from '@/features/corporate/CorporateDashboardPage';
import { CorporateBookingsPage } from '@/features/corporate/CorporateBookingsPage';
import { CorporateApprovalsPage } from '@/features/corporate/CorporateApprovalsPage';
import { CorporateEmployeesPage } from '@/features/corporate/CorporateEmployeesPage';
import { CorporatePolicyPage } from '@/features/corporate/CorporatePolicyPage';
import { CorporateReportsPage } from '@/features/corporate/CorporateReportsPage';

export const PublicRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Traveler Portal (no auth required) ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tours" element={<TourCatalogPage />} />
          <Route path="/tours/:id" element={<TourDetailsPage />} />
          <Route path="/events" element={<EventsCalendarPage />} />
          <Route path="/blog" element={<TravelBlogPage />} />
          <Route path="/contact" element={<ContactFaqPage />} />
          <Route path="/faq" element={<ContactFaqPage />} />
          <Route path="/plan-trip" element={<CustomItineraryBuilderPage />} />
          <Route path="/custom-trip" element={<CustomItineraryBuilderPage />} />
          <Route path="/flights" element={<FlightSearchPage />} />
          <Route path="/flights/results" element={<FlightResultsPage />} />
          <Route path="/hotels" element={<HotelSearchPage />} />
          <Route path="/hotels/results" element={<HotelResultsPage />} />

          {/* ── Authenticated User Account ── */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={['tourist', 'admin', 'tour_operator', 'finance_manager']}
                redirectTo="/login"
              />
            }
          >
            <Route element={<UserAccountLayout />}>
              <Route path="/user/dashboard" element={<UserDashboardOverview />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/user/issues" element={<SupportTicketsPage />} />
              <Route path="/user/invoices" element={<InvoicesPage />} />
              <Route path="/user/wishlist" element={<WishlistPage />} />
              <Route path="/user/reviews" element={<ReviewsPage />} />
              <Route path="/user/profile" element={<ProfilePage />} />
              <Route path="/user/guide-dashboard" element={<GuideDashboardPage />} />
              <Route path="/guide/dashboard" element={<GuideDashboardPage />} />
            </Route>
          </Route>
        </Route>

        {/* ── Dedicated Corporate Workspace (Independent of PublicLayout) ── */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={['CORPORATE_ADMIN', 'TRAVEL_MANAGER', 'APPROVER', 'TRAVELER', 'admin']}
              redirectTo="/login"
            />
          }
        >
          <Route element={<CorporateLayout />}>
            <Route path="/corporate" element={<CorporateDashboardPage />} />
            <Route path="/corporate/dashboard" element={<CorporateDashboardPage />} />
            <Route path="/corporate/bookings" element={<CorporateBookingsPage />} />
            <Route path="/corporate/book-flight" element={<FlightSearchPage />} />
            <Route path="/corporate/flights" element={<FlightSearchPage />} />
            <Route path="/corporate/book-hotel" element={<HotelSearchPage />} />
            <Route path="/corporate/hotels" element={<HotelSearchPage />} />
            <Route path="/corporate/approvals" element={<CorporateApprovalsPage />} />
            <Route path="/corporate/employees" element={<CorporateEmployeesPage />} />
            <Route path="/corporate/policy" element={<CorporatePolicyPage />} />
            <Route path="/corporate/reports" element={<CorporateReportsPage />} />
          </Route>
        </Route>

        {/* ── Auth Routes (publicly accessible with query tokens) ── */}
        <Route element={<PublicLayout />}>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* ── Guest Only: Login & Register ── */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Catch-all → home */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
};

