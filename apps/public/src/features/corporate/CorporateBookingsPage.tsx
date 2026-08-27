import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { corporateService } from '@tms/shared/services/corporateService';
import type { CorporateBooking } from '@tms/shared/types/corporate';
import {
  Plane,
  Hotel,
  Search,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Filter,
} from 'lucide-react';

export const CorporateBookingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<CorporateBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const isManager = user?.role === 'CORPORATE_ADMIN' || user?.role === 'TRAVEL_MANAGER';
  const isApprover = user?.role === 'APPROVER';

  useEffect(() => {
    corporateService.getCorporateBookings().then((all) => {
      // Scope to this company; traveler only sees own bookings
      const companyId = user?.companyId || 'comp-1';
      const filtered = all.filter((b) => {
        if (b.companyId !== companyId) return false;
        // TRAVELER only sees their own bookings
        if (!isManager && !isApprover) return b.travelerId === user?.id;
        return true;
      });
      setBookings(filtered);
      setLoading(false);
    });
  }, [user, isManager, isApprover]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        b.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.travelerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const matchType = typeFilter === 'ALL' || b.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [bookings, searchTerm, statusFilter, typeFilter]);

  const STATUS_OPTIONS = ['ALL', 'CONFIRMED', 'APPROVED', 'PENDING_APPROVAL', 'REJECTED', 'CANCELLED'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, margin: 0 }}>
          {isManager ? 'All Company Bookings' : 'My Travel Bookings'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.3rem' }}>
          {isManager ? 'Complete flight and hotel booking history for all employees' : 'Your personal corporate travel reservations'}
        </p>
      </div>

      {/* Quick book strip */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="primary" size="sm" icon={<Plane size={14} />} onClick={() => navigate('/corporate/book-flight')}>
          Book a Flight
        </Button>
        <Button variant="outline" size="sm" icon={<Hotel size={14} />} onClick={() => navigate('/corporate/book-hotel')}>
          Book a Hotel
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '380px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by reference or traveler..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.9rem 0.6rem 2.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'FLIGHT', 'HOTEL'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 700,
                border: `1px solid ${typeFilter === t ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                backgroundColor: typeFilter === t ? 'var(--brand-primary-light)' : 'transparent',
                color: typeFilter === t ? 'var(--brand-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <Card glass style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No bookings found. Book a flight or hotel above to get started.</p>
        </Card>
      ) : (
        <Card glass style={{ padding: '0.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Reference</th>
                {isManager && <th style={{ padding: '0.75rem 1rem' }}>Traveler</th>}
                <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}>Travel Policy</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                {isManager && <th style={{ padding: '0.75rem 1rem' }}>Approved By</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {b.reference}
                  </td>
                  {isManager && (
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{b.travelerName}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{b.departmentName || b.travelerEmail}</div>
                    </td>
                  )}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {b.type === 'FLIGHT'
                        ? <Plane size={13} style={{ color: 'var(--brand-primary)' }} />
                        : <Hotel size={13} style={{ color: '#059669' }} />}
                      {b.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                    ${b.totalAmount.toLocaleString()} {b.currency}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {b.policyStatus === 'WITHIN_POLICY'
                      ? <Badge variant="success" icon={<ShieldCheck size={11} />}>In Policy</Badge>
                      : <Badge variant="warning" icon={<AlertTriangle size={11} />}>Requires Approval</Badge>}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <Badge
                      variant={
                        b.status === 'CONFIRMED' || b.status === 'APPROVED' ? 'success'
                        : b.status === 'PENDING_APPROVAL' ? 'warning'
                        : b.status === 'REJECTED' || b.status === 'CANCELLED' ? 'danger'
                        : 'neutral'
                      }
                    >
                      {b.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                  {isManager && (
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {b.approvedBy || (b.status === 'PENDING_APPROVAL' ? <span style={{ color: '#f59e0b' }}>Pending...</span> : '—')}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};
