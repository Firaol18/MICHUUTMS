import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { corporateService } from '@tms/shared/services/corporateService';
import type { CorporateBooking } from '@tms/shared/types/corporate';
import {
  CheckCircle2,
  XCircle,
  Plane,
  Hotel,
  User,
  Clock,
  MessageSquare,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const CorporateApprovalsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [pending, setPending] = useState<CorporateBooking[]>([]);
  const [history, setHistory] = useState<CorporateBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  const companyId = user?.companyId || 'comp-1';

  const load = () => {
    corporateService.getCorporateBookings().then((all) => {
      const company = all.filter((b) => b.companyId === companyId);
      setPending(company.filter((b) => b.status === 'PENDING_APPROVAL'));
      setHistory(company.filter((b) => b.status === 'APPROVED' || b.status === 'REJECTED'));
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (booking: CorporateBooking) => {
    setProcessing(booking.id);
    await corporateService.updateCorporateBooking(booking.id, {
      status: 'APPROVED',
      approvedBy: user?.name,
      approvedAt: new Date().toISOString(),
      approvalNote: noteMap[booking.id] || undefined,
    });
    setTimeout(() => { setProcessing(null); load(); }, 300);
  };

  const handleReject = async (booking: CorporateBooking) => {
    setProcessing(booking.id);
    await corporateService.updateCorporateBooking(booking.id, {
      status: 'REJECTED',
      rejectionReason: noteMap[booking.id] || 'Request rejected by approver.',
    });
    setTimeout(() => { setProcessing(null); load(); }, 300);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const BookingRow = ({ b, showActions }: { b: CorporateBooking; showActions: boolean }) => {
    const isExpanded = expandedId === b.id;
    const isProcessing = processing === b.id;

    return (
      <Card
        key={b.id}
        glass
        style={{
          padding: '1.25rem 1.5rem',
          border: showActions ? '1.5px solid rgba(245,158,11,0.25)' : '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '40px', height: '40px', borderRadius: 'var(--radius-full)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: b.type === 'FLIGHT' ? 'rgba(37,99,235,0.1)' : 'rgba(5,150,105,0.1)',
                flexShrink: 0,
              }}
            >
              {b.type === 'FLIGHT'
                ? <Plane size={18} style={{ color: 'var(--brand-primary)' }} />
                : <Hotel size={18} style={{ color: '#059669' }} />}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                {b.reference}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', fontSize: '11px', color: 'var(--text-muted)' }}>
                <User size={11} /> {b.travelerName} · {b.departmentName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                Submitted {new Date(b.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 900, color: 'var(--text-primary)' }}>
              ${b.totalAmount.toLocaleString()}
            </div>
            <Badge variant={showActions ? 'warning' : b.status === 'APPROVED' ? 'success' : 'danger'}>
              {b.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Expand details button */}
        <button
          onClick={() => toggleExpand(b.id)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '11px', fontWeight: 700, color: 'var(--brand-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
        >
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {isExpanded ? 'Hide details' : 'Show booking details'}
        </button>

        {isExpanded && (
          <div
            style={{
              padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
              fontSize: '11px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '0.75rem',
            }}
          >
            {b.flightData && (
              <>
                <div><span style={{ color: 'var(--text-muted)' }}>Airline:</span> <strong>{b.flightData.airline}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Route:</span> <strong>{b.flightData.origin} → {b.flightData.destination}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Cabin:</span> <strong>{b.flightData.cabinClass}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Departure:</span> <strong>{new Date(b.flightData.departureDate).toLocaleDateString()}</strong></div>
              </>
            )}
            {b.hotelData && (
              <>
                <div><span style={{ color: 'var(--text-muted)' }}>Hotel:</span> <strong>{b.hotelData.hotelName}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Room:</span> <strong>{b.hotelData.roomType}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Check-in:</span> <strong>{new Date(b.hotelData.checkIn).toLocaleDateString()}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Nights:</span> <strong>{b.hotelData.nights}</strong></div>
              </>
            )}
            <div><span style={{ color: 'var(--text-muted)' }}>Business Purpose:</span> <strong>{b.businessPurpose}</strong></div>
            {b.policyViolationReason && (
              <div style={{ gridColumn: '1/-1' }}>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>⚠ Policy Violation: </span>
                {b.policyViolationReason}
              </div>
            )}
          </div>
        )}

        {/* Actions for pending bookings */}
        {showActions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Add approval note (optional)..."
                value={noteMap[b.id] || ''}
                onChange={(e) => setNoteMap((prev) => ({ ...prev, [b.id]: e.target.value }))}
                style={{
                  flex: 1, padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '11px', fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle2 size={14} />}
                onClick={() => handleApprove(b)}
                disabled={isProcessing}
                style={{ flex: 1 }}
              >
                Approve Booking
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<XCircle size={14} />}
                onClick={() => handleReject(b)}
                disabled={isProcessing}
                style={{ flex: 1 }}
              >
                Reject
              </Button>
            </div>
          </div>
        )}

        {/* Approval history note */}
        {!showActions && b.approvalNote && (
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Note: "{b.approvalNote}"
          </div>
        )}
        {!showActions && b.rejectionReason && (
          <div style={{ fontSize: '11px', color: '#ef4444', fontStyle: 'italic' }}>
            Rejection reason: "{b.rejectionReason}"
          </div>
        )}
      </Card>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, margin: 0 }}>Approval Queue</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.3rem' }}>
          Review and act on out-of-policy travel requests from your employees
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading requests...</div>
      ) : (
        <>
          {/* Pending */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <ShieldAlert size={18} style={{ color: '#f59e0b' }} />
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Pending Action
              </h2>
              {pending.length > 0 && (
                <span style={{ padding: '0.15rem 0.6rem', borderRadius: 'var(--radius-full)', backgroundColor: '#f59e0b', color: 'white', fontSize: '11px', fontWeight: 900 }}>
                  {pending.length}
                </span>
              )}
            </div>
            {pending.length === 0 ? (
              <Card glass style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={32} style={{ color: '#16a34a', marginBottom: '0.75rem', margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 700 }}>All caught up!</div>
                <div style={{ fontSize: 'var(--font-size-sm)', marginTop: '0.25rem' }}>No pending approval requests at this time.</div>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pending.map((b) => <BookingRow key={b.id} b={b} showActions />)}
              </div>
            )}
          </section>

          {/* History */}
          {history.length > 0 && (
            <section>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                Decision History
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {history.map((b) => <BookingRow key={b.id} b={b} showActions={false} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
