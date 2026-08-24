import React, { useEffect, useState } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { ETicketModal } from '@tms/shared/components/common/ETicketModal';
import { tourismService } from '@tms/shared/services/tourismService';
import type { Booking, BookingStatus, PaymentStatus } from '@tms/shared/types/booking';
import { Calendar, MapPin, Users, CheckCircle2, QrCode, Compass, XCircle, RotateCcw, AlertTriangle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function statusVariant(s: BookingStatus): 'success' | 'warning' | 'danger' | 'info' {
  if (s === 'confirmed' || s === 'completed') return 'success';
  if (s === 'pending') return 'warning';
  if (s === 'paid') return 'info';
  return 'danger';
}

function paymentVariant(p: PaymentStatus): 'success' | 'warning' | 'danger' | 'info' {
  if (p === 'paid') return 'success';
  if (p === 'partial') return 'warning';
  if (p === 'unpaid') return 'danger';
  return 'info'; // refunded
}

const CANCELLABLE_STATUSES: BookingStatus[] = ['pending', 'confirmed'];

export const CustomerBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedETicket, setSelectedETicket] = useState<Booking | null>(null);
  const navigate = useNavigate();

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [requestRefund, setRequestRefund] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await tourismService.getBookings('all');
      setBookings(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancelSubmit = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await tourismService.cancelBookingWithRefund(cancelTarget.id, cancelReason || 'Cancelled by customer', requestRefund);
      setCancelTarget(null);
      setCancelReason('');
      setRequestRefund(false);
      fetchBookings();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          My Travel <span className="text-gradient">Reservations</span>
        </h1>
        <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          View confirmed tour vouchers, assigned guide contact details, and printable QR e-tickets.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Fetching your travel reservations..." />
      ) : bookings.length === 0 ? (
        <Card glass style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Compass size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
          <h3>No active travel reservations found.</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Ready to explore? Browse our luxury tour packages and book your next expedition.
          </p>
          <Button variant="primary" onClick={() => navigate('/tours')}>Explore Tour Catalog</Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookings.map((bkg) => (
            <Card key={bkg.id} glass className="user-booking-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Header row */}
              <div className="flex-between user-booking-header" style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 700 }}>
                    Ref #{bkg.bookingReference}
                  </div>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginTop: '0.15rem' }}>{bkg.tourTitle}</h3>
                </div>
                <div className="flex-center" style={{ gap: '0.5rem' }}>
                  <Badge variant={statusVariant(bkg.status)} icon={<CheckCircle2 size={13} />}>
                    {bkg.status.toUpperCase()}
                  </Badge>
                  <Badge variant={paymentVariant(bkg.paymentStatus)}>
                    <CreditCard size={11} style={{ marginRight: 3 }} />{bkg.paymentStatus.toUpperCase()}
                  </Badge>
                  {bkg.refundStatus && bkg.refundStatus !== 'none' && (
                    <Badge variant="info">REFUND: {bkg.refundStatus.toUpperCase()}</Badge>
                  )}
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: 'var(--font-size-sm)' }}>
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
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>Group</span>
                  <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.375rem', fontWeight: 600 }}>
                    <Users size={14} style={{ color: 'var(--brand-primary)' }} />
                    {bkg.numberOfTravelers} Guests
                    {(bkg.numberOfAdults !== undefined) && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                        ({bkg.numberOfAdults}A/{bkg.numberOfChildren ?? 0}C)
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>Total Paid</span>
                  <span style={{ fontWeight: 700, color: 'var(--status-success)' }}>${bkg.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Special requests */}
              {bkg.traveler.specialRequests && (
                <div style={{ padding: '0.625rem 0.875rem', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)' }}>
                  <span style={{ fontWeight: 700, color: '#b45309' }}><AlertTriangle size={12} style={{ marginRight: 4 }} />Special Request: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{bkg.traveler.specialRequests}</span>
                </div>
              )}

              {/* Cancellation info */}
              {bkg.status === 'cancelled' && bkg.cancellationReason && (
                <div style={{ padding: '0.625rem 0.875rem', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)' }}>
                  <span style={{ fontWeight: 700, color: '#dc2626' }}><XCircle size={12} style={{ marginRight: 4 }} />Cancellation Reason: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{bkg.cancellationReason}</span>
                  {bkg.refundStatus && bkg.refundStatus !== 'none' && (
                    <span style={{ marginLeft: '0.75rem', fontWeight: 700, color: '#3b82f6' }}>
                      · Refund {bkg.refundStatus.toUpperCase()}
                    </span>
                  )}
                </div>
              )}

              {/* Footer actions */}
              <div
                className="flex-between"
                style={{
                  padding: '0.875rem 1rem', backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', flexWrap: 'wrap', gap: '0.75rem',
                }}
              >
                <div>
                  <span>Lead Traveler: <strong>{bkg.traveler.name}</strong> ({bkg.traveler.email})</span>
                  {bkg.assignedGuideName && (
                    <span style={{ marginLeft: '1rem' }}>Ranger Guide: <strong>{bkg.assignedGuideName}</strong></span>
                  )}
                </div>
                <div className="flex-center" style={{ gap: '0.5rem' }}>
                  {/* Self-cancel button */}
                  {CANCELLABLE_STATUSES.includes(bkg.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ color: '#ef4444' }}
                      icon={<XCircle size={14} />}
                      onClick={() => { setCancelTarget(bkg); setCancelReason(''); setRequestRefund(false); }}
                    >
                      Cancel
                    </Button>
                  )}
                  {/* E-Ticket */}
                  {(bkg.status === 'confirmed' || bkg.status === 'paid' || bkg.status === 'completed') && (
                    <Button variant="primary" size="sm" icon={<QrCode size={14} />} onClick={() => setSelectedETicket(bkg)}>
                      View QR E-Ticket & Pass
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* E-Ticket Modal */}
      <ETicketModal isOpen={Boolean(selectedETicket)} onClose={() => setSelectedETicket(null)} booking={selectedETicket} />

      {/* Self-Cancel Modal */}
      {cancelTarget && (
        <Modal
          isOpen={Boolean(cancelTarget)}
          onClose={() => setCancelTarget(null)}
          title="Cancel Booking"
          footer={
            <div className="flex-between" style={{ width: '100%' }}>
              <Button variant="ghost" size="sm" onClick={() => setCancelTarget(null)}>Keep Booking</Button>
              <Button
                variant="primary"
                size="sm"
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                icon={<XCircle size={14} />}
                onClick={handleCancelSubmit}
                isLoading={isCancelling}
              >
                Confirm Cancellation
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: 'var(--font-size-sm)' }}>
            <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700 }}>{cancelTarget.tourTitle}</div>
              <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>Ref #{cancelTarget.bookingReference} · Travel Date: {cancelTarget.travelDate}</div>
            </div>

            <Input
              label="Reason for cancellation *"
              placeholder="e.g. Change of travel plans, Medical emergency..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              required
            />

            {cancelTarget.paymentStatus === 'paid' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <input
                  type="checkbox"
                  checked={requestRefund}
                  onChange={(e) => setRequestRefund(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--brand-primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 700 }}>
                    <RotateCcw size={13} style={{ marginRight: 4 }} />Request a refund for ${cancelTarget.totalPrice.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Refund requests are reviewed within 3–5 business days.
                  </div>
                </div>
              </label>
            )}

            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: '#dc2626', fontWeight: 600 }}>
              ⚠ This action cannot be undone. Your booking will be permanently cancelled.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
