import React from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import type { Booking } from '@/types/booking';
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
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ETicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  multiItems?: Array<{
    type: 'tour' | 'hotel' | 'transport' | 'event' | string;
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

  const qrRef = booking.bookingReference || 'MCH-889102';
  const isPaid = booking.paymentStatus === 'paid';
  const isConfirmed = booking.status === 'confirmed' || booking.status === 'completed';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`E-Ticket & Reservation Voucher #${qrRef}`}
      size="lg"
      footer={
        <div className="eticket-modal-footer">
          <div className="eticket-footer-caption">
            Official MICHUU Boarding Pass & Verification Voucher
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
      <style>{`
        .eticket-container {
          background-color: #ffffff;
          color: #0f172a;
          border-radius: 16px;
          border: 2px dashed #cbd5e1;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
          position: relative;
        }

        .eticket-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%);
          color: #ffffff;
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .eticket-body {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 1.5rem;
          padding: 1.5rem;
          align-items: start;
        }

        .eticket-details-col {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .eticket-specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 0.75rem;
          background-color: #f8fafc;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .eticket-traveler-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.75rem;
          font-size: 0.85rem;
        }

        .eticket-stub-col {
          border-left: 2px dashed #cbd5e1;
          padding-left: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 100%;
        }

        .eticket-modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .eticket-footer-caption {
          font-size: 12px;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .eticket-body {
            grid-template-columns: 1fr;
            padding: 1rem;
            gap: 1.25rem;
          }

          .eticket-stub-col {
            border-left: none;
            border-top: 2px dashed #cbd5e1;
            padding-left: 0;
            padding-top: 1.25rem;
            width: 100%;
          }

          .eticket-header {
            padding: 1rem;
          }

          .eticket-specs-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .eticket-specs-grid {
            grid-template-columns: 1fr;
          }

          .eticket-traveler-grid {
            grid-template-columns: 1fr;
          }
        }

        @media print {
          body * {
            visibility: hidden;
          }
          #printable-eticket, #printable-eticket * {
            visibility: visible;
          }
          #printable-eticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
        }
      `}</style>

      {/* Printable E-Ticket Container */}
      <div id="printable-eticket" className="eticket-container">
        {/* Top Header Banner */}
        <div className="eticket-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '10px',
                backgroundColor: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Compass size={24} style={{ color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                MICHUU <span style={{ color: '#93c5fd' }}>TMS</span>
                <span style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PASS</span>
              </div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>
                Official Ethiopian Tourism Boarding Voucher
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
              BOOKING REF NO.
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              #{qrRef}
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <span
                style={{
                  backgroundColor: isPaid ? '#16a34a' : '#d97706',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em',
                }}
              >
                {isPaid ? 'PAID' : (booking.paymentStatus || 'UNPAID').toUpperCase()}
              </span>
              <span
                style={{
                  backgroundColor: isConfirmed ? 'rgba(255,255,255,0.25)' : 'rgba(245,158,11,0.3)',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em',
                }}
              >
                {(booking.status || 'PENDING').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Main Pass Body */}
        <div className="eticket-body">
          {/* Left Column: Details */}
          <div className="eticket-details-col">
            {/* Tour / Festival Title & Destination */}
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em' }}>
                EXPEDITION / FESTIVAL EXPERIENCE
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem', lineHeight: 1.3 }}>
                {booking.tourTitle}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, marginTop: '0.35rem' }}>
                <MapPin size={15} /> {booking.destinationName || 'Ethiopia'}
              </div>
            </div>

            {/* Travel Specs Grid */}
            <div className="eticket-specs-grid">
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  DEPARTURE DATE
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                  <Calendar size={14} style={{ color: '#2563eb' }} /> {booking.travelDate}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  TRAVELERS
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                  <Users size={14} style={{ color: '#2563eb' }} /> {booking.numberOfTravelers} Guests
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  ({booking.numberOfAdults ?? booking.numberOfTravelers} Adults, {booking.numberOfChildren ?? 0} Children)
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  TOTAL AMOUNT
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#16a34a', marginTop: '0.25rem' }}>
                  ${booking.totalPrice.toLocaleString()} USD
                </div>
                <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <CheckCircle2 size={11} /> Settled
                </div>
              </div>
            </div>

            {/* Traveler & Assigned Guide Details */}
            <div className="eticket-traveler-grid">
              <div style={{ padding: '0.875rem', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                  PRIMARY TRAVELER
                </div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{booking.traveler.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>{booking.traveler.email}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{booking.traveler.phone || '+251 91 123 4567'}</div>
                {booking.traveler.nationality && (
                  <div style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, marginTop: '4px' }}>
                    🌍 {booking.traveler.nationality}
                  </div>
                )}
              </div>

              <div style={{ padding: '0.875rem', border: '1px solid #bfdbfe', borderRadius: '10px', backgroundColor: '#eff6ff' }}>
                <div style={{ fontSize: '10px', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <UserCheck size={13} /> ASSIGNED GUIDE / RANGER
                </div>
                <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '0.95rem' }}>
                  {booking.assignedGuideName || 'Pending Assignment'}
                </div>
                <div style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600, marginTop: '2px' }}>
                  {booking.assignedGuideName ? 'Certified Ethiopian Eco-Guide' : 'Local Cultural Guide assigned prior to departure'}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                  VHF Ch 4 • Amharic / Oromiffa / English
                </div>
              </div>
            </div>

            {/* Special Requests or Add-ons */}
            {booking.traveler.specialRequests && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px', fontSize: '0.8rem', color: '#854d0e' }}>
                <strong>Special Inclusions / Requests:</strong> {booking.traveler.specialRequests}
              </div>
            )}

            {/* Multi-Item Package Breakdown (If present) */}
            {multiItems && multiItems.length > 0 && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
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
                        borderRadius: '6px',
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                        {item.type === 'tour' && <Compass size={13} style={{ color: '#2563eb' }} />}
                        {item.type === 'hotel' && <Building2 size={13} style={{ color: '#d97706' }} />}
                        {item.type === 'transport' && <Car size={13} style={{ color: '#16a34a' }} />}
                        {item.type === 'event' && <Sparkles size={13} style={{ color: '#7c3aed' }} />}
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

          {/* Right Column: QR Code & Verification Stub */}
          <div className="eticket-stub-col">
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
              SCAN TO VERIFY PASS
            </div>

            {/* Generated High-Resolution SVG QR Code */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '0.75rem',
                border: '2px solid #0f172a',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                marginBottom: '0.5rem',
                display: 'inline-block',
              }}
            >
              <svg width="124" height="124" viewBox="0 0 100 100" fill="none">
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

            <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 800, color: '#334155', marginBottom: '0.75rem' }}>
              {qrRef}
            </div>

            {/* Simulated Barcode */}
            <div style={{ width: '100%', maxWidth: 200, marginBottom: '0.75rem' }}>
              <div
                style={{
                  height: 28,
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
                width: 68,
                height: 68,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
                fontWeight: 900,
                fontSize: '8px',
                transform: 'rotate(-10deg)',
                backgroundColor: 'rgba(22, 163, 74, 0.05)',
                margin: '0.5rem auto 0 auto',
              }}
            >
              <ShieldCheck size={18} />
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
            padding: '0.75rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#64748b',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div>
            📍 <strong>MICHUU Concierge:</strong> Bole Road, Tourism Plaza, Addis Ababa • 24/7 Helpline: +251 911 00 22 33
          </div>
          <div>
            Present digital QR or printed voucher upon arrival at park gate or hotel check-in.
          </div>
        </div>
      </div>
    </Modal>
  );
};
