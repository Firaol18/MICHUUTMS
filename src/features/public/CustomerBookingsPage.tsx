import React, { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ETicketModal } from '@/components/common/ETicketModal';
import { tourismService } from '@/services/tourismService';
import type { Booking } from '@/types/booking';
import { Calendar, MapPin, Users, CheckCircle2, QrCode, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CustomerBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedETicket, setSelectedETicket] = useState<Booking | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerBookings = async () => {
      setIsLoading(true);
      try {
        const data = await tourismService.getBookings('all');
        setBookings(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomerBookings();
  }, []);

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

      {/* Interactive E-Ticket & Voucher PDF Modal */}
      <ETicketModal
        isOpen={Boolean(selectedETicket)}
        onClose={() => setSelectedETicket(null)}
        booking={selectedETicket}
      />
    </div>
  );
};
