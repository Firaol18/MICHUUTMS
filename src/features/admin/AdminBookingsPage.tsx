import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { tourismService } from '@/services/tourismService';
import type { Booking, BookingStatus, PaymentStatus } from '@/types/booking';
import { TourManifestModal } from '@/components/common/TourManifestModal';
import {
  RefreshCw, UserCheck, Eye, ChevronRight,
  Users, AlertTriangle, CheckCircle2, XCircle, RotateCcw, FileText,
} from 'lucide-react';

const AVAILABLE_GUIDES = [
  'Abebe Bekele', 'Tigist Assefa', 'Biruk Tadesse', 'Gennet Worku', 'Solomon Haile',
];

const STATUS_FLOW: BookingStatus[] = ['pending', 'confirmed', 'paid', 'completed'];

function statusVariant(s: BookingStatus) {
  if (s === 'confirmed') return 'success';
  if (s === 'pending') return 'warning';
  if (s === 'paid') return 'info';
  if (s === 'completed') return 'success';
  return 'danger';
}

function paymentVariant(p: PaymentStatus) {
  if (p === 'paid') return 'success';
  if (p === 'partial') return 'warning';
  if (p === 'unpaid') return 'danger';
  return 'info'; // refunded
}

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<BookingStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isManifestOpen, setIsManifestOpen] = useState(false);
  const [selectedManifestBooking, setSelectedManifestBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await tourismService.getBookings(activeStatus, searchQuery);
      setBookings(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [activeStatus, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    await tourismService.updateBookingStatus(id, newStatus);
    fetchBookings();
  };

  const handlePaymentChange = async (id: string, newPayment: PaymentStatus) => {
    await tourismService.updatePaymentStatus(id, newPayment);
    fetchBookings();
  };

  const handleGuideAssign = async (id: string, guideName: string) => {
    await tourismService.assignGuideToBooking(id, guideName);
    fetchBookings();
  };

  const openDetail = (booking: Booking) => {
    setDetailBooking(booking);
    setIsDetailOpen(true);
  };

  const columns: Column<Booking>[] = [
    {
      header: 'Reference #',
      minWidth: '130px',
      noWrap: true,
      cell: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'monospace' }}>
          {row.bookingReference}
        </span>
      ),
    },
    {
      header: 'Tour & Traveler',
      minWidth: '240px',
      cell: (row) => (
        <div style={{ minWidth: 220 }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', lineHeight: 1.3 }}>{row.tourTitle}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {row.traveler.name} · {row.traveler.email}
          </div>
        </div>
      ),
    },
    {
      header: 'Departure',
      minWidth: '130px',
      noWrap: true,
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{row.travelDate}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Booked {row.bookingDate}</div>
        </div>
      ),
    },
    {
      header: 'Guests',
      minWidth: '100px',
      noWrap: true,
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Users size={13} style={{ color: 'var(--brand-primary)' }} />
          <div>
            <span style={{ fontWeight: 600 }}>{row.numberOfTravelers}</span>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {row.numberOfAdults ?? row.numberOfTravelers}A / {row.numberOfChildren ?? 0}C
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Total',
      minWidth: '110px',
      noWrap: true,
      cell: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--status-success)' }}>
          ${row.totalPrice.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Payment',
      minWidth: '120px',
      noWrap: true,
      cell: (row) => (
        <PermissionGuard resource="bookings" action="update">
          <select
            value={row.paymentStatus}
            onChange={(e) => handlePaymentChange(row.id, e.target.value as PaymentStatus)}
            style={{
              padding: '0.25rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              color: row.paymentStatus === 'paid' ? '#16a34a'
                : row.paymentStatus === 'refunded' ? '#3b82f6'
                : row.paymentStatus === 'partial' ? '#f59e0b'
                : '#ef4444',
            }}
          >
            <option value="unpaid">UNPAID</option>
            <option value="partial">PARTIAL</option>
            <option value="paid">PAID</option>
            <option value="refunded">REFUNDED</option>
          </select>
        </PermissionGuard>
      ),
    },
    {
      header: 'Guide',
      minWidth: '140px',
      noWrap: true,
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <UserCheck size={13} style={{ color: 'var(--brand-primary)' }} />
          <select
            value={row.assignedGuideName || AVAILABLE_GUIDES[0]}
            onChange={(e) => handleGuideAssign(row.id, e.target.value)}
            style={{
              padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)',
              fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer',
            }}
          >
            {AVAILABLE_GUIDES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      ),
    },
    {
      header: 'Status',
      minWidth: '110px',
      noWrap: true,
      cell: (row) => (
        <Badge variant={statusVariant(row.status)}>{row.status.toUpperCase()}</Badge>
      ),
    },
    {
      header: 'Actions',
      minWidth: '180px',
      noWrap: true,
      align: 'center',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="ghost" size="sm" icon={<Eye size={13} />} onClick={() => openDetail(row)}>
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<FileText size={13} />}
            onClick={() => {
              setSelectedManifestBooking(row);
              setIsManifestOpen(true);
            }}
          >
            Manifest
          </Button>
          <PermissionGuard resource="bookings" action="update">
            {/* Advance status button */}
            {row.status !== 'completed' && row.status !== 'cancelled' && (() => {
              const currentIdx = STATUS_FLOW.indexOf(row.status);
              const nextStatus = STATUS_FLOW[currentIdx + 1];
              if (!nextStatus) return null;
              const labels: Record<string, string> = {
                confirmed: 'Confirm', paid: 'Mark Paid', completed: 'Complete',
              };
              return (
                <Button
                  variant="outline" size="sm"
                  icon={<ChevronRight size={13} />}
                  onClick={() => handleStatusChange(row.id, nextStatus)}
                >
                  {labels[nextStatus] ?? nextStatus}
                </Button>
              );
            })()}
            {/* Cancel button */}
            {row.status !== 'cancelled' && row.status !== 'completed' && (
              <Button
                variant="ghost" size="sm"
                style={{ color: '#ef4444' }}
                icon={<XCircle size={13} />}
                onClick={async () => {
                  const reason = window.prompt('Enter cancellation reason:');
                  if (reason === null) return;
                  await tourismService.cancelBookingWithRefund(row.id, reason || 'Cancelled by admin', false);
                  fetchBookings();
                }}
              >
                Cancel
              </Button>
            )}
          </PermissionGuard>
        </div>
      ),
    },
  ];

  const filterTabs = (['all', 'pending', 'confirmed', 'paid', 'completed', 'cancelled'] as const);

  return (
    <div>
      <PageHeader
        title="Reservations & Passenger Manifest"
        description="Manage traveler reservations — advance booking status through the full lifecycle, update payment status, assign guides, and process cancellations."
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={fetchBookings}>
            Refresh
          </Button>
        }
      />

      {/* Status Filter Tabs & Search */}
      <div className="flex-between" style={{ marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {filterTabs.map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              style={{
                padding: '0.4rem 0.875rem',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: activeStatus === st ? 700 : 500,
                color: activeStatus === st ? 'var(--brand-primary)' : 'var(--text-secondary)',
                backgroundColor: activeStatus === st ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={bookings}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search reference, traveler name, tour title..."
        entityName="bookings"
      />

      {/* Booking Detail Modal */}
      {isDetailOpen && detailBooking && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Booking Detail — ${detailBooking.bookingReference}`}
          footer={
            <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>Close</Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: 'var(--font-size-sm)' }}>

            {/* Status row */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Badge variant={statusVariant(detailBooking.status)}>{detailBooking.status.toUpperCase()}</Badge>
              <Badge variant={paymentVariant(detailBooking.paymentStatus)}>{detailBooking.paymentStatus.toUpperCase()}</Badge>
              {detailBooking.refundStatus && detailBooking.refundStatus !== 'none' && (
                <Badge variant="info">REFUND: {detailBooking.refundStatus.toUpperCase()}</Badge>
              )}
            </div>

            {/* Tour info */}
            <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{detailBooking.tourTitle}</div>
              <div style={{ color: 'var(--text-muted)' }}>{detailBooking.destinationName}</div>
            </div>

            {/* Grid details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Booking Reference</span><strong>{detailBooking.bookingReference}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Booking Date</span><strong>{detailBooking.bookingDate}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Travel Date</span><strong>{detailBooking.travelDate}</strong></div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Group Size</span>
                <strong>
                  {detailBooking.numberOfTravelers} total
                  ({detailBooking.numberOfAdults ?? detailBooking.numberOfTravelers} Adults
                  / {detailBooking.numberOfChildren ?? 0} Children)
                </strong>
              </div>
              <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Total Price</span><strong style={{ color: 'var(--status-success)' }}>${detailBooking.totalPrice.toLocaleString()}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Assigned Guide</span><strong>{detailBooking.assignedGuideName || '—'}</strong></div>
            </div>

            {/* Payment & Receipt Verification Section */}
            <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  💳 Payment Verification & Transfer Slip
                </span>
                <Badge variant={detailBooking.paymentStatus === 'paid' ? 'success' : 'warning'}>
                  {(detailBooking.paymentStatus || 'pending').toUpperCase()}
                </Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', fontSize: 'var(--font-size-xs)', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Payment Method</span>
                  <strong>{(detailBooking.paymentMethod || 'Telebirr').toUpperCase()}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Transaction Ref / TXN ID</span>
                  <strong style={{ color: 'var(--brand-primary)', fontFamily: 'monospace' }}>
                    {detailBooking.transactionReference || 'N/A (Direct Mobile/Cash)'}
                  </strong>
                </div>
              </div>

              {detailBooking.paymentReceiptUrl ? (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    📸 Customer Payment Screenshot Attachment:
                  </span>
                  <a
                    href={detailBooking.paymentReceiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-block' }}
                  >
                    <img
                      src={detailBooking.paymentReceiptUrl}
                      alt="Customer Payment Receipt"
                      style={{
                        maxHeight: 180,
                        maxWidth: '100%',
                        borderRadius: 'var(--radius-sm)',
                        border: '2px solid var(--brand-primary)',
                        objectFit: 'contain',
                        cursor: 'zoom-in',
                      }}
                    />
                  </a>
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                    Click image to open full resolution screenshot
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 }}>
                  No payment screenshot uploaded for this booking.
                </div>
              )}
            </div>

            {/* Traveler info */}
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Users size={14} /> Traveler Information
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Full Name</span>{detailBooking.traveler.name}</div>
                <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Email</span>{detailBooking.traveler.email}</div>
                <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Phone</span>{detailBooking.traveler.phone}</div>
                <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Nationality</span>{detailBooking.traveler.nationality}</div>
              </div>
            </div>

            {/* Special requests */}
            {detailBooking.traveler.specialRequests && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#b45309', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <AlertTriangle size={13} /> SPECIAL REQUESTS
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{detailBooking.traveler.specialRequests}</div>
              </div>
            )}

            {/* Cancellation info */}
            {detailBooking.status === 'cancelled' && detailBooking.cancellationReason && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#dc2626', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <XCircle size={13} /> CANCELLATION REASON
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{detailBooking.cancellationReason}</div>
                {detailBooking.refundStatus && detailBooking.refundStatus !== 'none' && (
                  <div style={{ marginTop: '0.5rem', fontWeight: 600, fontSize: 11, color: '#3b82f6' }}>
                    Refund Status: {detailBooking.refundStatus.toUpperCase()}
                  </div>
                )}
              </div>
            )}

            {/* Admin status actions */}
            <PermissionGuard resource="bookings" action="update">
              {detailBooking.status !== 'cancelled' && detailBooking.status !== 'completed' && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  {STATUS_FLOW.map((s) => {
                    const idx = STATUS_FLOW.indexOf(s);
                    const curIdx = STATUS_FLOW.indexOf(detailBooking.status);
                    if (idx <= curIdx) return null;
                    const nextOnly = idx === curIdx + 1;
                    return (
                      <Button
                        key={s}
                        variant={nextOnly ? 'primary' : 'outline'}
                        size="sm"
                        icon={<CheckCircle2 size={14} />}
                        onClick={async () => {
                          await handleStatusChange(detailBooking.id, s);
                          setDetailBooking((prev) => prev ? { ...prev, status: s } : null);
                        }}
                      >
                        Move to {s.charAt(0).toUpperCase() + s.slice(1)}
                      </Button>
                    );
                  })}
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ color: '#ef4444', marginLeft: 'auto' }}
                    icon={<XCircle size={14} />}
                    onClick={async () => {
                      const reason = window.prompt('Cancellation reason:');
                      if (reason === null) return;
                      await tourismService.cancelBookingWithRefund(detailBooking.id, reason || 'Cancelled by admin', false);
                      fetchBookings();
                      setIsDetailOpen(false);
                    }}
                  >
                    Cancel Booking
                  </Button>
                  {detailBooking.paymentStatus === 'paid' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ color: '#3b82f6' }}
                      icon={<RotateCcw size={14} />}
                      onClick={async () => {
                        const reason = window.prompt('Refund reason:');
                        if (reason === null) return;
                        await tourismService.cancelBookingWithRefund(detailBooking.id, reason || 'Refund requested', true);
                        fetchBookings();
                        setIsDetailOpen(false);
                      }}
                    >
                      Cancel & Refund
                    </Button>
                  )}
                </div>
              )}
            </PermissionGuard>
          </div>
        </Modal>
      )}

      {/* Operational Tour Manifest Modal */}
      <TourManifestModal
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
        tourTitle={selectedManifestBooking?.tourTitle || 'Historic Ethiopia & Wenchi Expedition'}
        dateRange={selectedManifestBooking ? `Aug 20 – 27, 2026 (Departure: ${selectedManifestBooking.travelDate})` : 'Aug 20 – 27, 2026'}
        guideName={selectedManifestBooking?.assignedGuideName || 'Abebe Bekele'}
      />
    </div>
  );
};
