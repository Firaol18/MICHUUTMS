import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { ETicketModal } from '@tms/shared/components/common/ETicketModal';
import { tourismService } from '@tms/shared/services/tourismService';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import type { Booking } from '@tms/shared/types/booking';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  QrCode,
  Compass,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Phone,
  Globe,
  FileText,
  HelpCircle,
  ShieldCheck,
  Receipt,
  UserCheck,
} from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedETicket, setSelectedETicket] = useState<Booking | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [displayCount, setDisplayCount] = useState<number>(5);

  useEffect(() => {
    tourismService
      .getBookings('all')
      .then((data) => {
        if (user?.email && user.role !== 'admin' && user.role !== 'tour_operator') {
          const userEmail = user.email.toLowerCase();
          setBookings(data.filter((b) => b.traveler?.email?.toLowerCase() === userEmail));
        } else {
          setBookings(data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setBookings([]);
        setIsLoading(false);
      });
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <Badge variant="success" icon={<CheckCircle2 size={13} />}>CONFIRMED</Badge>;
      case 'pending':
        return <Badge variant="warning" icon={<Clock size={13} />}>PENDING</Badge>;
      case 'cancelled':
        return <Badge variant="danger" icon={<AlertCircle size={13} />}>CANCELLED</Badge>;
      case 'completed':
        return <Badge variant="info">COMPLETED</Badge>;
      default:
        return <Badge variant="neutral">{status?.toUpperCase() || 'ACTIVE'}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <Badge variant="info">PAID</Badge>;
      case 'partial':
        return <Badge variant="warning">PARTIAL</Badge>;
      case 'refunded':
        return <Badge variant="danger">REFUNDED</Badge>;
      default:
        return <Badge variant="neutral">UNPAID</Badge>;
    }
  };

  const formatPaymentMethod = (method?: string | null) => {
    switch (method) {
      case 'telebirr':
        return '📱 Telebirr Instant Transfer';
      case 'cbe_birr':
        return '🏦 Commercial Bank of Ethiopia (CBE / *847#)';
      case 'credit_card':
        return '💳 International Card (Visa / Mastercard)';
      case 'bank_transfer':
        return '🏛️ Wire Bank Transfer';
      case 'cash':
        return '💵 Cash on Arrival / Bole Hub';
      case 'free':
        return '🎟️ Free Cultural Pass ($0)';
      default:
        return method ? method.toUpperCase() : 'Electronic Transfer';
    }
  };

  if (isLoading) return <LoadingSpinner label="Fetching your travel reservations..." />;

  const visibleBookings = bookings.slice(0, displayCount);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            🎫 My Bookings
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Manage your expedition reservations, passes, payment receipts, and travel vouchers
          </p>
        </div>

        {bookings.length > 0 && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing {Math.min(displayCount, bookings.length)} of {bookings.length} reservations
          </span>
        )}
      </div>

      {bookings.length === 0 ? (
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
          {visibleBookings.map((bkg) => {
            const isExpanded = expandedIds.has(bkg.id);

            return (
              <Card
                key={bkg.id}
                glass
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  transition: 'box-shadow 0.2s ease',
                  border: isExpanded ? '1px solid rgba(37, 99, 235, 0.4)' : '1px solid var(--border-color)',
                }}
              >
                {/* ── Top Header ── */}
                <div
                  className="flex-between"
                  style={{
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 700 }}>
                      Ref #{bkg.bookingReference}
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginTop: '0.15rem' }}>
                      {bkg.tourTitle}
                    </h3>
                  </div>

                  <div className="flex-center" style={{ gap: '0.5rem' }}>
                    {getStatusBadge(bkg.status)}
                    {getPaymentBadge(bkg.paymentStatus)}
                  </div>
                </div>

                {/* ── Summary Grid ── */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>
                      Destination
                    </span>
                    <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.375rem', fontWeight: 600 }}>
                      <MapPin size={14} style={{ color: 'var(--brand-primary)' }} /> {bkg.destinationName}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>
                      Departure Date
                    </span>
                    <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.375rem', fontWeight: 600 }}>
                      <Calendar size={14} style={{ color: 'var(--brand-primary)' }} /> {bkg.travelDate}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>
                      Travelers & Total
                    </span>
                    <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.375rem', fontWeight: 600 }}>
                      <Users size={14} style={{ color: 'var(--brand-primary)' }} /> {bkg.numberOfTravelers} Guests ($
                      {bkg.totalPrice.toLocaleString()})
                    </span>
                  </div>
                </div>

                {/* ── Lead Traveler & Action Bar ── */}
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
                    <span>
                      Lead Traveler: <strong>{bkg.traveler.name}</strong> ({bkg.traveler.email})
                    </span>
                    {bkg.assignedGuideName && (
                      <span style={{ marginLeft: '1rem' }}>
                        Ranger Guide: <strong>{bkg.assignedGuideName}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex-center" style={{ gap: '0.5rem' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      onClick={() => toggleExpand(bkg.id)}
                      style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}
                    >
                      {isExpanded ? 'See Less' : 'See More'}
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={<QrCode size={14} />}
                      onClick={() => setSelectedETicket(bkg)}
                    >
                      View QR E-Ticket & Pass
                    </Button>
                  </div>
                </div>

                {/* ── Expanded Full Details Drawer ── */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '1.25rem',
                      backgroundColor: 'rgba(37, 99, 235, 0.03)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed rgba(37, 99, 235, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      fontSize: 'var(--font-size-xs)',
                      animation: 'fadeIn 0.2s ease-in-out',
                    }}
                  >
                    {/* Section 1: Detailed Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      {/* Payment Details */}
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                          <CreditCard size={14} style={{ color: 'var(--brand-primary)' }} /> Payment Details
                        </span>
                        <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          <div>Method: <strong>{formatPaymentMethod(bkg.paymentMethod)}</strong></div>
                          {bkg.transactionReference && (
                            <div>Tx Reference: <strong style={{ fontFamily: 'monospace' }}>{bkg.transactionReference}</strong></div>
                          )}
                          <div>Booking Date: <strong>{bkg.bookingDate || '2026-08-26'}</strong></div>
                          <div>
                            Payment Status:{' '}
                            <strong style={{ color: bkg.paymentStatus === 'paid' ? '#16a34a' : '#ea580c' }}>
                              {bkg.paymentStatus === 'paid' ? 'Paid / Settled' : 'Unpaid (Due on Arrival)'}
                            </strong>
                          </div>
                          <div>
                            {bkg.paymentStatus === 'paid' ? 'Total Settled:' : 'Amount Due on Arrival:'}{' '}
                            <strong style={{ color: bkg.paymentStatus === 'paid' ? '#16a34a' : '#dc2626' }}>
                              ${bkg.totalPrice.toLocaleString()}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Traveler Contact Info */}
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                          <Phone size={14} style={{ color: 'var(--brand-primary)' }} /> Contact & Party Info
                        </span>
                        <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          <div>Phone: <strong>{bkg.traveler.phone || '+251 91 123 4567'}</strong></div>
                          <div>Nationality: <strong>{bkg.traveler.nationality || 'Ethiopia'}</strong></div>
                          <div>Party Size: <strong>{bkg.numberOfAdults || bkg.numberOfTravelers} Adult(s), {bkg.numberOfChildren || 0} Child(ren)</strong></div>
                        </div>
                      </div>

                      {/* Guide & Operations */}
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                          <UserCheck size={14} style={{ color: 'var(--brand-primary)' }} /> Ranger Guide & Support
                        </span>
                        <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          <div>Assigned Ranger: <strong>{bkg.assignedGuideName || 'Abebe Bekele (Lead Cultural Ranger)'}</strong></div>
                          <div>Safety Escort: <strong style={{ color: '#16a34a' }}>Active & Insured</strong></div>
                          <div>Emergency Support: <strong>24/7 Concierge (+251 91 000 0000)</strong></div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Special Requests & Notes */}
                    {bkg.traveler.specialRequests && (
                      <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>
                          📝 Special Dietary / Accessibility Requests:
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{bkg.traveler.specialRequests}</span>
                      </div>
                    )}

                    {/* Section 3: Action Shortcuts */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<FileText size={13} />}
                        onClick={() => navigate('/user/invoices')}
                      >
                        Invoices & Receipts
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        icon={<HelpCircle size={13} />}
                        onClick={() => navigate('/user/issues')}
                      >
                        Report Issue / Help
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        icon={<QrCode size={13} />}
                        onClick={() => setSelectedETicket(bkg)}
                      >
                        Open Digital Ticket
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          {/* ── Load More Pagination Button ── */}
          {bookings.length > displayCount && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDisplayCount((prev) => prev + 5)}
                icon={<ChevronDown size={16} />}
                style={{ fontWeight: 700, padding: '0.65rem 2rem' }}
              >
                See More Bookings ({bookings.length - displayCount} remaining)
              </Button>
            </div>
          )}
        </div>
      )}

      <ETicketModal isOpen={Boolean(selectedETicket)} onClose={() => setSelectedETicket(null)} booking={selectedETicket} />
    </div>
  );
};

