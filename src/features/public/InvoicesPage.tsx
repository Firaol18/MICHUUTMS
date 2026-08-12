import React, { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ETicketModal } from '@/components/common/ETicketModal';
import { tourismService } from '@/services/tourismService';
import type { Booking } from '@/types/booking';
import { Download } from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedETicket, setSelectedETicket] = useState<Booking | null>(null);

  useEffect(() => {
    tourismService.getBookings('all').then((data) => {
      setBookings(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <LoadingSpinner label="Loading invoices..." />;

  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        🧾 Invoices & Receipts
      </h2>

      {bookings.length === 0 ? (
        <Card glass style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No invoices found. Book a tour to generate receipts.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bookings.map((bkg) => (
            <Card
              key={bkg.id}
              glass
              style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
            >
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Official Tax Invoice #{bkg.bookingReference}-INV
                </div>
                <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {bkg.tourTitle}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Date Issued: {bkg.travelDate} • Status:{' '}
                  <strong style={{ color: '#16a34a' }}>PAID FULL</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Amount</div>
                  <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    ${bkg.totalPrice.toLocaleString()} USD
                  </div>
                </div>
                <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={() => setSelectedETicket(bkg)}>
                  Download Tax PDF
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
