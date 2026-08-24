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
import { Calendar, MapPin, Users, CheckCircle2, QrCode, Compass, Clock, AlertCircle } from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedETicket, setSelectedETicket] = useState<Booking | null>(null);

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

  if (isLoading) return <LoadingSpinner label="Fetching your travel reservations..." />;

  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        🎫 My Bookings
      </h2>

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
                  {getStatusBadge(bkg.status)}
                  {getPaymentBadge(bkg.paymentStatus)}
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
                  {bkg.assignedGuideName && (
                    <span style={{ marginLeft: '1rem' }}>Ranger Guide: <strong>{bkg.assignedGuideName}</strong></span>
                  )}
                </div>
                <Button variant="primary" size="sm" icon={<QrCode size={14} />} onClick={() => setSelectedETicket(bkg)}>
                  View QR E-Ticket & Pass
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ETicketModal isOpen={Boolean(selectedETicket)} onClose={() => setSelectedETicket(null)} booking={selectedETicket} />
    </div>
  );
};
