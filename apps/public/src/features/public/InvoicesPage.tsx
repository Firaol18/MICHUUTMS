import React, { useEffect, useState } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Badge } from '@tms/shared/components/common/Badge';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { ETicketModal } from '@tms/shared/components/common/ETicketModal';
import { tourismService } from '@tms/shared/services/tourismService';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import type { Booking } from '@tms/shared/types/booking';
import {
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileText,
  MapPin,
  Calendar,
  Users,
  QrCode,
  Receipt,
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedETicket, setSelectedETicket] = useState<Booking | null>(null);

  // Pagination & Expander state
  const [displayCount, setDisplayCount] = useState(4);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    tourismService.getBookings('all').then((data) => {
      if (user?.email && user.role !== 'admin' && user.role !== 'tour_operator') {
        const userEmail = user.email.toLowerCase();
        setBookings(data.filter((b) => b.traveler?.email?.toLowerCase() === userEmail));
      } else {
        setBookings(data);
      }
      setIsLoading(false);
    }).catch(() => {
      setBookings([]);
      setIsLoading(false);
    });
  }, [user]);

  const formatPaymentMethod = (method?: string) => {
    const m = (method || '').toLowerCase();
    if (m === 'cash' || m === 'cash_on_arrival') return 'Cash on Arrival';
    if (m === 'telebirr') return 'Telebirr SuperApp Pay';
    if (m === 'cbe' || m === 'bank_transfer' || m === 'bank') return 'Commercial Bank of Ethiopia (CBE)';
    if (m === 'card' || m === 'credit_card') return 'International Visa / MasterCard';
    if (m === 'chapa') return 'Chapa Online Gateway';
    return method ? method.toUpperCase() : 'Telebirr Mobile Money';
  };

  const renderPaymentStatus = (paymentStatus: string, status: string) => {
    const ps = (paymentStatus || '').toLowerCase();
    const st = (status || '').toLowerCase();

    if (ps === 'paid') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontWeight: 700 }}>
          <CheckCircle2 size={13} /> PAID FULL
        </span>
      );
    }
    if (ps === 'partial') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontWeight: 700 }}>
          <Clock size={13} /> PARTIALLY PAID
        </span>
      );
    }
    if (ps === 'refunded' || st === 'cancelled') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#dc2626', fontWeight: 700 }}>
          <AlertCircle size={13} /> REFUNDED / VOID
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#ea580c', fontWeight: 700 }}>
        <Clock size={13} /> UNPAID (DUE ON ARRIVAL)
      </span>
    );
  };

  if (isLoading) return <LoadingSpinner label="Loading invoices..." />;

  const visibleBookings = bookings.slice(0, displayCount);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt style={{ color: 'var(--brand-primary)' }} /> Invoices & Official Tax Receipts
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Verified tax receipts, booking vouchers, and payment transaction audit statements
          </p>
        </div>

        <Badge variant="info">
          Total Invoices: {bookings.length}
        </Badge>
      </div>

      {bookings.length === 0 ? (
        <Card glass style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <Receipt size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, margin: '0 0 0.5rem 0' }}>No Invoices Generated Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
            Invoices and official receipts are automatically generated when you book an expedition.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {visibleBookings.map((bkg) => {
            const isExpanded = expandedIds.has(bkg.id);
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
                {/* ── Top Bar ── */}
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

                {/* ── Summary Line ── */}
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
                    <span>Status: {renderPaymentStatus(bkg.paymentStatus, bkg.status)}</span>
                    <span>Method: <strong>{formatPaymentMethod(bkg.paymentMethod)}</strong></span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    onClick={() => toggleExpand(bkg.id)}
                    style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, padding: '0.25rem 0.5rem' }}
                  >
                    {isExpanded ? 'See Less' : 'See More'}
                  </Button>
                </div>

                {/* ── Expanded Full Financial & Invoice Breakdown ── */}
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
                      {/* Column 1: Financial Details */}
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

                      {/* Column 2: Traveler & Party */}
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                          <Users size={14} style={{ color: 'var(--brand-primary)' }} /> Billed Traveler Details
                        </span>
                        <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          <div>Bill To: <strong>{bkg.traveler.name}</strong></div>
                          <div>Email: <strong>{bkg.traveler.email}</strong></div>
                          <div>Phone: <strong>{bkg.traveler.phone || 'N/A'}</strong></div>
                          <div>Nationality: <strong>{bkg.traveler.nationality || 'International'}</strong></div>
                          <div>Group: <strong>{bkg.numberOfAdults || bkg.numberOfTravelers} Adults, {bkg.numberOfChildren || 0} Children</strong></div>
                        </div>
                      </div>

                      {/* Column 3: Logistics & Ranger */}
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

          {/* ── Load More Invoices Button ── */}
          {bookings.length > displayCount && (
            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDisplayCount((prev) => prev + 4)}
                icon={<ChevronDown size={14} />}
                style={{ fontWeight: 700, padding: '0.55rem 2rem' }}
              >
                See More Invoices ({bookings.length - displayCount} remaining)
              </Button>
            </div>
          )}
        </div>
      )}

      <ETicketModal isOpen={Boolean(selectedETicket)} onClose={() => setSelectedETicket(null)} booking={selectedETicket} />
    </div>
  );
};

