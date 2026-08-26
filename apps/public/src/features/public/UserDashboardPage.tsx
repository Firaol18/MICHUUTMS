import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { ETicketModal } from '@tms/shared/components/common/ETicketModal';
import { tourismService } from '@tms/shared/services/tourismService';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { getUserAvatarUrl } from '@tms/shared/utils/avatar';
import { useWishlistStore } from '@tms/shared/store/useWishlistStore';
import { useReviewStore } from '@tms/shared/store/useReviewStore';
import type { Booking } from '@tms/shared/types/booking';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  QrCode,
  Compass,
  Heart,
  Star,
  FileText,
  Download,
  Settings,
  Ticket,
  LogOut,
  Send,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Car,
  Building,
  CreditCard,
  Receipt,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, login, isAuthenticated } = useAuthStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { reviews, addReview, fetchReviews } = useReviewStore();

  const [activeTab, setActiveTab] = useState<'trips' | 'invoices' | 'wishlist' | 'reviews' | 'profile'>('trips');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedETicket, setSelectedETicket] = useState<Booking | null>(null);

  // Profile Edit Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+251 9');
  const [profileNationality, setProfileNationality] = useState('Ethiopia');
  const [preferredCurrency, setPreferredCurrency] = useState('ETB (Br) / USD ($)');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [dietaryPref, setDietaryPref] = useState('Standard / Local Cuisine');
  const [profileSaveMessage, setProfileSaveMessage] = useState(false);

  const [reviewTourId, setReviewTourId] = useState('tour-101');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewDisplayCount, setReviewDisplayCount] = useState(3);
  const [expandedReviewIds, setExpandedReviewIds] = useState<Set<string>>(new Set());

  // Invoice Pagination & Expander state
  const [invoiceDisplayCount, setInvoiceDisplayCount] = useState(3);
  const [expandedInvoiceIds, setExpandedInvoiceIds] = useState<Set<string>>(new Set());

  const toggleInvoiceExpand = (id: string) => {
    setExpandedInvoiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleReviewExpand = (id: string) => {
    setExpandedReviewIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Guard: redirect unauthenticated visitors to login (after all hooks)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchReviews();
    const fetchCustomerBookings = async () => {
      setIsLoading(true);
      try {
        const data = await tourismService.getBookings('all');
        if (user?.email && user.role !== 'admin' && user.role !== 'tour_operator') {
          setBookings(data.filter((b) => b.traveler?.email?.toLowerCase() === user.email.toLowerCase()));
        } else {
          setBookings(data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomerBookings();
  }, [fetchReviews, user]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      login(
        {
          ...user,
          name: profileName,
          email: profileEmail,
        },
        'updated-jwt-token'
      );
      setProfileSaveMessage(true);
      setTimeout(() => setProfileSaveMessage(false), 3000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      await addReview({
        tourId: reviewTourId,
        tourTitle: reviewTourId === 'tour-101' ? 'Wenchi Crater Lake Expedition' : 'Danakil Depression Expedition',
        authorName: profileName,
        authorEmail: profileEmail,
        rating: reviewRating,
        overallRating: reviewRating,
        guideRating: 5,
        transportRating: 5,
        accommodationRating: 5,
        comment: reviewComment,
        category: 'tour',
        isVerifiedBooking: true,
      });

      setReviewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  const myReviews = user?.email
    ? reviews.filter((r) => r.authorEmail && r.authorEmail.toLowerCase() === user.email.toLowerCase())
    : [];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header Banner */}
      <Card
        glass
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(6,182,212,0.12) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={getUserAvatarUrl(user)}
            alt={user?.name || 'User'}
            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-primary)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
                {user?.name || 'Traveler'}
              </h1>
              <Badge variant="success">
                {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
                  ? 'Administrator'
                  : user?.role === 'tour_guide' || user?.role === 'GUIDE'
                  ? 'Certified Guide'
                  : 'Traveler Member'}
              </Badge>
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {user?.email || 'traveler@example.com'} • Member since 2026
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" icon={<Compass size={16} />} onClick={() => navigate('/tours')}>
            Explore Tours
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut size={16} />}
            onClick={() => { logout(); navigate('/'); }}
          >
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('trips')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: activeTab === 'trips' ? 700 : 500,
            backgroundColor: activeTab === 'trips' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'trips' ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'trips' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Ticket size={16} /> My Trips ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: activeTab === 'invoices' ? 700 : 500,
            backgroundColor: activeTab === 'invoices' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'invoices' ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'invoices' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={16} /> Invoices & Receipts
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: activeTab === 'wishlist' ? 700 : 500,
            backgroundColor: activeTab === 'wishlist' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'wishlist' ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'wishlist' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Heart size={16} fill={activeTab === 'wishlist' ? '#fff' : 'none'} /> Wishlist ({wishlist.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: activeTab === 'reviews' ? 700 : 500,
            backgroundColor: activeTab === 'reviews' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'reviews' ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'reviews' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Star size={16} fill={activeTab === 'reviews' ? '#fff' : 'none'} /> My Reviews ({myReviews.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: activeTab === 'profile' ? 700 : 500,
            backgroundColor: activeTab === 'profile' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'profile' ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'profile' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Settings size={16} /> Profile & Settings
        </button>
      </div>

      {/* ─── TAB 1: TRIPS & BOOKING HISTORY ─── */}
      {activeTab === 'trips' && (
        <div>
          {isLoading ? (
            <LoadingSpinner label="Fetching your travel reservations..." />
          ) : bookings.length === 0 ? (
            <Card glass style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Compass size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
              <h3>No active travel reservations found.</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Ready to explore? Browse our luxury tour packages and book your next expedition.
              </p>
              <Button variant="primary" onClick={() => navigate('/tours')}>
                Explore Tour Catalog
              </Button>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {bookings.map((bkg) => (
                <Card key={bkg.id} glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 700 }}>
                        Ref #{bkg.bookingReference}
                      </div>
                      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginTop: '0.15rem' }}>{bkg.tourTitle}</h3>
                    </div>

                    <div className="flex-center" style={{ gap: '0.5rem' }}>
                      <Badge variant="success" icon={<CheckCircle2 size={13} />}>
                        {bkg.status.toUpperCase()}
                      </Badge>
                      <Badge variant="info">PAID</Badge>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: 'var(--font-size-sm)' }}>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>Destination</span>
                      <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.375rem', fontWeight: 600 }}>
                        <MapPin size={14} style={{ color: 'var(--brand-primary)' }} /> {bkg.destinationName}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>Departure Date</span>
                      <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.375rem', fontWeight: 600 }}>
                        <Calendar size={14} style={{ color: 'var(--brand-primary)' }} /> {bkg.travelDate}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>Travelers & Total</span>
                      <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.375rem', fontWeight: 600 }}>
                        <Users size={14} style={{ color: 'var(--brand-primary)' }} /> {bkg.numberOfTravelers} Guests (${bkg.totalPrice.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex-between"
                    style={{
                      padding: '0.875rem 1rem',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--font-size-xs)',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <span>Lead Traveler: <strong>{bkg.traveler.name}</strong> ({bkg.traveler.email})</span>
                      {bkg.assignedGuideName && <span style={{ marginLeft: '1rem' }}>Ranger Guide: <strong>{bkg.assignedGuideName}</strong></span>}
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={<QrCode size={14} />}
                      onClick={() => setSelectedETicket(bkg)}
                    >
                      View QR E-Ticket & Pass
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: INVOICES & RECEIPTS ─── */}
      {activeTab === 'invoices' && (
        <div>
          {bookings.length === 0 ? (
            <Card glass style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <Receipt size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, margin: '0 0 0.5rem 0' }}>No Invoices Generated Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                Invoices and official receipts will appear here once you make an expedition booking.
              </p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {bookings.slice(0, invoiceDisplayCount).map((bkg) => {
                const isExpanded = expandedInvoiceIds.has(bkg.id);
                const isPaid = (bkg.paymentStatus || '').toLowerCase() === 'paid';

                return (
                  <Card
                    key={bkg.id}
                    glass
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      border: isExpanded ? '1px solid rgba(37, 99, 235, 0.4)' : '1px solid var(--border-color)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Top Bar */}
                    <div
                      className="flex-between"
                      style={{
                        flexWrap: 'wrap',
                        gap: '1rem',
                        borderBottom: '1px solid var(--border-color)',
                        paddingBottom: '0.875rem',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 700, letterSpacing: '0.04em' }}>
                          TAX INVOICE #{bkg.bookingReference}-INV
                        </div>
                        <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                          {bkg.tourTitle}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount Payable</div>
                          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: isPaid ? '#16a34a' : 'var(--brand-primary)' }}>
                            ${bkg.totalPrice.toLocaleString()} USD
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Download size={14} />}
                          onClick={() => setSelectedETicket(bkg)}
                        >
                          PDF Receipt
                        </Button>
                      </div>
                    </div>

                    {/* Summary Row */}
                    <div
                      className="flex-between"
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-muted)',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span>Date Issued: <strong>{bkg.travelDate}</strong></span>
                        <span>
                          Status:{' '}
                          <strong style={{ color: isPaid ? '#16a34a' : '#ea580c' }}>
                            {isPaid ? 'PAID FULL' : 'UNPAID (DUE ON ARRIVAL)'}
                          </strong>
                        </span>
                        <span>Method: <strong>{bkg.paymentMethod ? bkg.paymentMethod.toUpperCase() : 'TELEBIRR'}</strong></span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        onClick={() => toggleInvoiceExpand(bkg.id)}
                        style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, padding: '0.25rem 0.5rem' }}
                      >
                        {isExpanded ? 'See Less' : 'See More'}
                      </Button>
                    </div>

                    {/* Expanded Full Accounting Breakdown */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: '1.25rem',
                          backgroundColor: 'rgba(37, 99, 235, 0.03)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px dashed rgba(37, 99, 235, 0.25)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                          fontSize: 'var(--font-size-xs)',
                          animation: 'fadeIn 0.2s ease-in-out',
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                          {/* Column 1: Financial */}
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                              <CreditCard size={14} style={{ color: 'var(--brand-primary)' }} /> Itemized Accounting
                            </span>
                            <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                              <div>Booking Reference: <strong style={{ fontFamily: 'monospace' }}>{bkg.bookingReference}</strong></div>
                              {bkg.transactionReference && (
                                <div>Tx ID / CBE Ref: <strong style={{ fontFamily: 'monospace' }}>{bkg.transactionReference}</strong></div>
                              )}
                              <div>Base Rate: <strong>${Math.round(bkg.totalPrice / (bkg.numberOfTravelers || 1)).toLocaleString()} / Person</strong></div>
                              <div>VAT & Tourist Levy (15%): <strong>Included in Total</strong></div>
                              <div>
                                Settlement:{' '}
                                <strong style={{ color: isPaid ? '#16a34a' : '#ea580c' }}>
                                  {isPaid ? '100% Fully Settled' : 'Payable on Arrival'}
                                </strong>
                              </div>
                            </div>
                          </div>

                          {/* Column 2: Traveler info */}
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                              <Users size={14} style={{ color: 'var(--brand-primary)' }} /> Billed Traveler Details
                            </span>
                            <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                              <div>Bill To: <strong>{bkg.traveler.name}</strong></div>
                              <div>Email: <strong>{bkg.traveler.email}</strong></div>
                              <div>Phone: <strong>{bkg.traveler.phone || 'N/A'}</strong></div>
                              <div>Group: <strong>{bkg.numberOfAdults || bkg.numberOfTravelers} Adults, {bkg.numberOfChildren || 0} Children</strong></div>
                            </div>
                          </div>

                          {/* Column 3: Logistics */}
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                              <MapPin size={14} style={{ color: 'var(--brand-primary)' }} /> Logistics & Dispatch
                            </span>
                            <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                              <div>Destination: <strong>{bkg.destinationName}</strong></div>
                              <div>Departure Date: <strong>{bkg.travelDate}</strong></div>
                              <div>Ranger Guide: <strong>{bkg.assignedGuideName || 'Certified Guide Assigned'}</strong></div>
                              <div>Issuing Branch: <strong>MICHUU Tourism Central Bureau</strong></div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Action Shortcuts */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<QrCode size={13} />}
                            onClick={() => setSelectedETicket(bkg)}
                          >
                            View Official E-Pass & Tax Slip
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}

              {/* Load More Invoices Button */}
              {bookings.length > invoiceDisplayCount && (
                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setInvoiceDisplayCount((prev) => prev + 3)}
                    icon={<ChevronDown size={14} />}
                    style={{ fontWeight: 700, padding: '0.55rem 2rem' }}
                  >
                    See More Invoices ({bookings.length - invoiceDisplayCount} remaining)
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: WISHLIST / FAVORITES ─── */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <Card glass style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Heart size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
              <h3>Your wishlist is empty</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Click the heart icon on any tour card to save it to your personal favorites!
              </p>
              <Button variant="primary" onClick={() => navigate('/tours')}>
                Browse Tour Packages
              </Button>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {wishlist.map((tour) => (
                <Card key={tour.id} glass style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 180, backgroundImage: `url(${tour.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <button
                      onClick={() => toggleWishlist(tour)}
                      style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Heart size={16} fill="#ef4444" />
                    </button>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '0.2rem' }}>
                      📍 {tour.destination.name}
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '0.5rem' }}>{tour.title}</h3>
                    <div className="flex-between" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)' }}>
                        ${tour.pricePerPerson} USD
                      </span>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/tours/${tour.id}`)}>
                        Book Tour
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: REVIEWS & POST-TRIP FEEDBACK ─── */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Write a Review Form */}
          <Card glass style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              ✍️ Post-Trip Review & Feedback
            </h3>

            {reviewSuccess && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '1rem' }}>
                ✓ Thank you! Your verified review has been published.
              </div>
            )}

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  Select Completed Tour
                </label>
                <select
                  value={reviewTourId}
                  onChange={(e) => setReviewTourId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="tour-101">Wenchi Crater Lake & Thermal Springs Expedition</option>
                  <option value="tour-104">Danakil Depression & Erta Ale Volcano Expedition</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  Star Rating (1 to 5 Stars)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: star <= reviewRating ? '#fbbf24' : '#cbd5e1' }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  Your Review Comment
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about your ranger guide, accommodation, sights, and tips for future travelers..."
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <Button type="submit" variant="primary" icon={<Send size={16} />}>
                Submit Review
              </Button>
            </form>
          </Card>

          {/* List of Posted Reviews */}
          <div>
            <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                My Published Reviews ({myReviews.length > 0 ? myReviews.length : reviews.length})
              </h3>
              {myReviews.length > 0 && reviews.length > myReviews.length && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Filtered to your verified account feedback
                </span>
              )}
            </div>

            {(myReviews.length > 0 ? myReviews : reviews).length === 0 ? (
              <Card glass style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <Star size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem auto' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                  You haven't posted any reviews yet. Share your expedition experience above!
                </p>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(myReviews.length > 0 ? myReviews : reviews)
                  .slice(0, reviewDisplayCount)
                  .map((rev) => {
                    const isExpanded = expandedReviewIds.has(rev.id);

                    return (
                      <Card
                        key={rev.id}
                        glass
                        style={{
                          padding: '1.25rem',
                          border: isExpanded ? '1px solid rgba(37, 99, 235, 0.4)' : '1px solid var(--border-color)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div className="flex-between" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#fbbf24', fontSize: '1rem' }}>
                              {'★'.repeat(rev.overallRating || rev.rating || 5)}
                              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)', marginLeft: '0.25rem' }}>
                                ({rev.overallRating || rev.rating || 5}/5)
                              </span>
                            </div>
                            {rev.isVerifiedBooking && (
                              <Badge variant="success" icon={<ShieldCheck size={12} />}>
                                Verified Traveler
                              </Badge>
                            )}
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rev.date}</span>
                        </div>

                        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.35rem' }}>
                          {rev.tourTitle}
                        </h4>

                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                          "{rev.comment}"
                        </p>

                        {/* Expand / Collapse Action Bar */}
                        <div className="flex-between" style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {rev.guideName && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Guide: <strong>{rev.guideName}</strong>
                              </span>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            icon={isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            onClick={() => toggleReviewExpand(rev.id)}
                            style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, padding: '0.25rem 0.5rem' }}
                          >
                            {isExpanded ? 'See Less' : 'See More'}
                          </Button>
                        </div>

                        {/* Expanded Full Multi-Aspect Breakdown Drawer */}
                        {isExpanded && (
                          <div
                            style={{
                              marginTop: '0.75rem',
                              padding: '0.875rem 1rem',
                              backgroundColor: 'rgba(37, 99, 235, 0.04)',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px dashed rgba(37, 99, 235, 0.25)',
                              fontSize: 'var(--font-size-xs)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem',
                              animation: 'fadeIn 0.2s ease-in-out',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '11px' }}>
                              Detailed Experience Aspect Ratings:
                            </span>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginTop: '0.25rem' }}>
                              <div style={{ padding: '0.4rem 0.6rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>Ranger Guide</span>
                                <strong>★ {rev.guideRating || rev.overallRating || 5}/5 ({rev.guideName || 'Abebe'})</strong>
                              </div>

                              <div style={{ padding: '0.4rem 0.6rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>Transportation</span>
                                <strong>★ {rev.transportRating || 5}/5 (4x4 Expedition Fleet)</strong>
                              </div>

                              <div style={{ padding: '0.4rem 0.6rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>Accommodations & Meals</span>
                                <strong>★ {rev.accommodationRating || 5}/5 (Eco-Lodge)</strong>
                              </div>
                            </div>

                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              Author: <strong>{rev.authorName}</strong> ({rev.authorEmail || 'Verified Traveler'}) · Published {rev.date}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}

                {/* See More Reviews Incremental Pagination */}
                {(myReviews.length > 0 ? myReviews : reviews).length > reviewDisplayCount && (
                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<ChevronDown size={14} />}
                      onClick={() => setReviewDisplayCount((prev) => prev + 3)}
                      style={{ fontWeight: 700, padding: '0.5rem 1.5rem' }}
                    >
                      See More Reviews ({(myReviews.length > 0 ? myReviews : reviews).length - reviewDisplayCount} remaining)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 5: PROFILE & SETTINGS ─── */}
      {activeTab === 'profile' && (
        <Card glass style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            👤 Profile & Traveler Preferences
          </h3>

          {profileSaveMessage && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '1.25rem' }}>
              ✓ Profile settings updated successfully!
            </div>
          )}

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input label="Full Name" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Email Address" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} required />
              <Input label="Mobile / Telebirr Phone" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Nationality / Passport Country" value={profileNationality} onChange={(e) => setProfileNationality(e.target.value)} required />
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  Preferred Display Currency
                </label>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="ETB (Br) / USD ($)">ETB (Br) / USD ($)</option>
                  <option value="USD ($)">USD ($) Only</option>
                  <option value="EUR (€)">EUR (€) Only</option>
                </select>
              </div>
            </div>

            <Input label="Emergency Contact (Name & Phone)" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
            <Input label="Dietary / Medical Accessibility Notes" value={dietaryPref} onChange={(e) => setDietaryPref(e.target.value)} />

            <Button type="submit" variant="primary" size="lg" icon={<CheckCircle2 size={18} />}>
              Save Profile Changes
            </Button>
          </form>
        </Card>
      )}

      {/* Printable E-Ticket Modal Trigger */}
      <ETicketModal
        isOpen={Boolean(selectedETicket)}
        onClose={() => setSelectedETicket(null)}
        booking={selectedETicket}
      />
    </div>
  );
};
