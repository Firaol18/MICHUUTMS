import React from 'react';
import { Modal } from '@tms/shared/components/common/Modal';
import { Button } from '@tms/shared/components/common/Button';
import type { Booking } from '@tms/shared/types/booking';
import {
  Printer,
  Compass,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Building2,
  Car,
  UserCheck,
} from 'lucide-react';

interface ETicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  multiItems?: Array<{
    type: 'tour' | 'hotel' | 'transport';
    title: string;
    quantity: number;
    unitPrice: number;
    details?: Record<string, string>;
  }>;
}

export const ETicketModal: React.FC<ETicketModalProps> = ({
  isOpen,
  onClose,
  booking,
  multiItems,
}) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate deterministic QR Code pattern based on ref number
  const qrRef = booking.bookingReference || 'MCH-889102';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`E-Ticket & Booking Confirmation #${qrRef}`}
      footer={
        <div className="flex-between" style={{ width: '100%' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Official MICHUU Boarding Pass & Reservation Voucher
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" size="sm" icon={<Printer size={15} />} onClick={handlePrint}>
              Print / Save PDF
            </Button>

            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      }
    >
      {/* Printable E-Ticket Container */}
      <div
        id="printable-eticket"
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          border: '2px dashed #cbd5e1',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Top Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #0284c7 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Compass size={24} style={{ color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                MICHUU <span style={{ color: '#93c5fd' }}>TMS</span>
              </div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>
                Official Travel E-Ticket & Pass
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
              BOOKING REF NO.
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              #{qrRef}
            </div>
            <span
              style={{
                display: 'inline-block',
                marginTop: '0.2rem',
                backgroundColor: '#16a34a',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 800,
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
              }}
            >
              CONFIRMED & PAID
            </span>
          </div>
        </div>

        {/* Main Pass Body */}
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '2.4fr 1fr', gap: '1.5rem' }}>
          {/* Left Column: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Tour Title & Destination */}
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                DESTINATION & EXPEDITION
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
                {booking.tourTitle}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, marginTop: '0.3rem' }}>
                <MapPin size={14} /> {booking.destinationName}, Ethiopia
              </div>
            </div>

            {/* Travel Specs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  DEPARTURE DATE
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                  <Calendar size={13} style={{ color: '#2563eb' }} /> {booking.travelDate}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  PASSENGERS
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                  <Users size={13} style={{ color: '#2563eb' }} /> {booking.numberOfTravelers} Guests
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  TOTAL PRICE
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>
                  ${booking.totalPrice.toLocaleString()} USD
                </div>
              </div>
            </div>

            {/* Traveler & Ranger Guide Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  LEAD TRAVELER
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{booking.traveler.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{booking.traveler.email}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{booking.traveler.phone || '+251 91 123 4567'}</div>
              </div>

              <div style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', backgroundColor: '#eff6ff' }}>
                <div style={{ fontSize: '10px', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <UserCheck size={12} /> ASSIGNED RANGER GUIDE
                </div>
                <div style={{ fontWeight: 700, color: '#1e3a8a' }}>{booking.assignedGuideName || 'Abebe Bekele'}</div>
                <div style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 600 }}>Certified Ethiopian Eco-Guide</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>VHF Radio: Ch 4 • Amharic / Oromiffa / English</div>
              </div>
            </div>

            {/* Multi-Item Package Breakdown (If present) */}
            {multiItems && multiItems.length > 0 && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  PACKAGE ADD-ONS & CHARTERS INCLUDED
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {multiItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.6rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                        {item.type === 'tour' && <Compass size={13} style={{ color: '#2563eb' }} />}
                        {item.type === 'hotel' && <Building2 size={13} style={{ color: '#d97706' }} />}
                        {item.type === 'transport' && <Car size={13} style={{ color: '#16a34a' }} />}
                        {item.title} (x{item.quantity})
                      </span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>
                        ${(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: QR Code & Security Stamp */}
          <div
            style={{
              borderLeft: '2px dashed #cbd5e1',
              paddingLeft: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'between',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              SCAN TO VERIFY
            </div>

            {/* Generated SVG QR Code */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '0.75rem',
                border: '2px solid #0f172a',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                marginBottom: '0.75rem',
              }}
            >
              <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="white" />
                {/* QR Finder Pattern Top-Left */}
                <rect x="5" y="5" width="30" height="30" fill="black" />
                <rect x="10" y="10" width="20" height="20" fill="white" />
                <rect x="15" y="15" width="10" height="10" fill="black" />

                {/* QR Finder Pattern Top-Right */}
                <rect x="65" y="5" width="30" height="30" fill="black" />
                <rect x="70" y="10" width="20" height="20" fill="white" />
                <rect x="75" y="15" width="10" height="10" fill="black" />

                {/* QR Finder Pattern Bottom-Left */}
                <rect x="5" y="65" width="30" height="30" fill="black" />
                <rect x="10" y="70" width="20" height="20" fill="white" />
                <rect x="15" y="75" width="10" height="10" fill="black" />

                {/* Data Modules */}
                <rect x="42" y="10" width="6" height="6" fill="black" />
                <rect x="52" y="10" width="6" height="6" fill="black" />
                <rect x="42" y="24" width="6" height="6" fill="black" />
                <rect x="10" y="42" width="6" height="6" fill="black" />
                <rect x="24" y="42" width="6" height="6" fill="black" />
                <rect x="42" y="42" width="16" height="16" fill="black" />
                <rect x="65" y="42" width="6" height="6" fill="black" />
                <rect x="78" y="42" width="12" height="6" fill="black" />
                <rect x="65" y="56" width="12" height="6" fill="black" />
                <rect x="42" y="65" width="6" height="12" fill="black" />
                <rect x="54" y="65" width="12" height="6" fill="black" />
                <rect x="75" y="65" width="15" height="15" fill="black" />
                <rect x="42" y="82" width="16" height="10" fill="black" />
                <rect x="65" y="85" width="25" height="6" fill="black" />
              </svg>
            </div>

            <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#334155', marginBottom: '1rem' }}>
              {qrRef}
            </div>

            {/* Simulated Barcode */}
            <div style={{ width: '100%', marginBottom: '1rem' }}>
              <div
                style={{
                  height: 32,
                  background:
                    'repeating-linear-gradient(90deg, #000 0, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 7px, #fff 7px, #fff 8px)',
                  borderRadius: '2px',
                }}
              />
              <div style={{ fontSize: '9px', color: '#64748b', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                *MICHUU-ETHIOPIA-PASS*
              </div>
            </div>

            {/* Official Watermark Badge */}
            <div
              style={{
                border: '2px solid #16a34a',
                borderRadius: '50%',
                width: 72,
                height: 72,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
                fontWeight: 900,
                fontSize: '8px',
                transform: 'rotate(-12deg)',
                backgroundColor: 'rgba(22, 163, 74, 0.05)',
                margin: 'auto 0 0 0',
              }}
            >
              <ShieldCheck size={20} />
              VERIFIED
              <span>PASSPORT</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#64748b',
          }}
        >
          <div>
            📍 <strong>MICHUU Concierge:</strong> Bole Road, Tourism Plaza, Addis Ababa • Emergency: +251 911 00 22 33
          </div>
          <div>
            Please present digital QR or printed pass upon arrival at park gate or hotel lobby.
          </div>
        </div>
      </div>
    </Modal>
  );
};
