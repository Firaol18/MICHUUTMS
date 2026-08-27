import React, { useState, useEffect } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import { corporateService } from '@tms/shared/services/corporateService';
import type { CorporateBooking, CorporateBookingStatus } from '@tms/shared/types/corporate';
import {
  ListOrdered,
  Search,
  Plane,
  Hotel,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building,
  User,
  Filter,
} from 'lucide-react';

export const AdminCorporateBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<CorporateBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Review Modal State
  const [selectedBooking, setSelectedBooking] = useState<CorporateBooking | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await corporateService.getCorporateBookings();
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenReview = (bkg: CorporateBooking) => {
    setSelectedBooking(bkg);
    setRejectionReason('');
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedBooking) return;
    await corporateService.updateBookingStatus(selectedBooking.id, 'APPROVED', 'UTS Corporate Admin');
    setIsReviewModalOpen(false);
    fetchBookings();
  };

  const handleReject = async () => {
    if (!selectedBooking) return;
    await corporateService.updateBookingStatus(selectedBooking.id, 'REJECTED', 'UTS Corporate Admin', rejectionReason);
    setIsReviewModalOpen(false);
    fetchBookings();
  };

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.travelerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.companyName && b.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: CorporateBookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
      case 'APPROVED':
        return <Badge variant="success">{status}</Badge>;
      case 'PENDING_APPROVAL':
        return <Badge variant="warning">PENDING APPROVAL</Badge>;
      case 'REJECTED':
      case 'CANCELLED':
      case 'FAILED':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Corporate Reservations & Approval Queue"
        description="Monitor flight & hotel reservations across enterprise client accounts, review out-of-policy bookings, and approve corporate travel"
      />

      {/* Metrics Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Card glass style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Pending Manager Review
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#ea580c', marginTop: '0.25rem' }}>
            {bookings.filter((b) => b.status === 'PENDING_APPROVAL').length}
          </div>
        </Card>
        <Card glass style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Confirmed / Approved Trips
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#16a34a', marginTop: '0.25rem' }}>
            {bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'APPROVED').length}
          </div>
        </Card>
        <Card glass style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Corporate Travel Volume
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--brand-primary)', marginTop: '0.25rem' }}>
            ${bookings.reduce((acc, b) => acc + b.totalAmount, 0).toLocaleString()} USD
          </div>
        </Card>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by reference, traveler, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'CONFIRMED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 700,
                border: `1px solid ${statusFilter === st ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                backgroundColor: statusFilter === st ? 'var(--brand-primary-light)' : 'transparent',
                color: statusFilter === st ? 'var(--brand-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <LoadingSpinner label="Loading corporate booking dispatch..." />
      ) : (
        <Card glass style={{ padding: '0.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Reference & Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Company / Client</th>
                <th style={{ padding: '0.75rem 1rem' }}>Traveler & Dept</th>
                <th style={{ padding: '0.75rem 1rem' }}>Total Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}>Policy Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                      {b.type === 'FLIGHT' ? <Plane size={14} /> : <Hotel size={14} />} {b.reference}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600 }}>{b.companyName}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700 }}>{b.travelerName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{b.departmentName || b.travelerEmail}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ${b.totalAmount.toLocaleString()} {b.currency}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {b.policyStatus === 'WITHIN_POLICY' ? (
                      <Badge variant="success" icon={<ShieldCheck size={11} />}>
                        Within Policy
                      </Badge>
                    ) : (
                      <Badge variant="warning" icon={<AlertTriangle size={11} />}>
                        Approval Required
                      </Badge>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {getStatusBadge(b.status)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    {b.status === 'PENDING_APPROVAL' ? (
                      <Button variant="primary" size="sm" onClick={() => handleOpenReview(b)}>
                        Review & Approve
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleOpenReview(b)}>
                        View Details
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && selectedBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <Card
            glass
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '2rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 800 }}>
                  REF #{selectedBooking.reference}
                </span>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: '0.15rem 0 0 0' }}>
                  Corporate Itinerary Review
                </h3>
              </div>
              <button type="button" onClick={() => setIsReviewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: 'var(--font-size-xs)' }}>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div><strong>Client Enterprise:</strong> {selectedBooking.companyName}</div>
                <div><strong>Lead Traveler:</strong> {selectedBooking.travelerName} ({selectedBooking.travelerEmail})</div>
                <div><strong>Department:</strong> {selectedBooking.departmentName}</div>
                <div><strong>Total Billed:</strong> ${selectedBooking.totalAmount.toLocaleString()} {selectedBooking.currency}</div>
                {selectedBooking.notes && <div><strong>Business Justification:</strong> {selectedBooking.notes}</div>}
              </div>

              {selectedBooking.status === 'PENDING_APPROVAL' && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    Rejection Feedback (if declining)
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Specify why the itinerary cannot be authorized under corporate travel budget..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setIsReviewModalOpen(false)}>
                Close
              </Button>
              {selectedBooking.status === 'PENDING_APPROVAL' && (
                <>
                  <Button variant="outline" onClick={handleReject} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                    Reject Request
                  </Button>
                  <Button variant="primary" onClick={handleApprove}>
                    Authorize & Confirm Trip
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
