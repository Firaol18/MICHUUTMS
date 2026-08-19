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
