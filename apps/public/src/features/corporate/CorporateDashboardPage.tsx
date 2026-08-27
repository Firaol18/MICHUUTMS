import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { corporateService, INITIAL_COMPANIES } from '@tms/shared/services/corporateService';
import { INITIAL_CORPORATE_BOOKINGS } from '@tms/shared/services/corporateService';
import {
  Plane,
  Hotel,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  TrendingUp,
  Users,
  ShieldAlert,
  ArrowRight,
  Building2,
  CalendarClock,
} from 'lucide-react';

export const CorporateDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Get company data for this user
  const company = useMemo(() => {
    return INITIAL_COMPANIES.find((c) => c.id === (user?.companyId || 'comp-1')) || INITIAL_COMPANIES[0];
  }, [user]);

  // Company bookings (filter to this company)
  const companyBookings = useMemo(() => {
    return INITIAL_CORPORATE_BOOKINGS.filter(
      (b) => b.companyId === (user?.companyId || 'comp-1')
    );
  }, [user]);

  const pendingApprovals = companyBookings.filter((b) => b.status === 'PENDING_APPROVAL');
  const confirmedBookings = companyBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'APPROVED');
  const totalSpend = companyBookings.reduce((acc, b) => acc + b.totalAmount, 0);
  const usagePercent = Math.round((company.usedAmount / company.creditLimit) * 100);

  const isManager = user?.role === 'CORPORATE_ADMIN' || user?.role === 'TRAVEL_MANAGER';
  const isApprover = user?.role === 'APPROVER';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
            Welcome back, <span style={{ color: 'var(--brand-primary)' }}>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.35rem' }}>
            {company.name} · {user?.role?.replace('_', ' ')} · {user?.departmentName || 'Corporate Division'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '0.4rem 0.8rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            📅 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>


      {/* ── Urgent: Pending Approvals Banner ── */}
      {pendingApprovals.length > 0 && (isManager || isApprover) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            backgroundColor: 'rgba(245,158,11,0.08)',
            border: '1.5px solid rgba(245,158,11,0.3)',
            borderRadius: 'var(--radius-md)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldAlert size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                {pendingApprovals.length} Booking{pendingApprovals.length > 1 ? 's' : ''} Awaiting Your Approval
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                Out-of-policy travel requests need your review before confirmation
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/corporate/approvals')}>
            Review Now <ArrowRight size={14} style={{ marginLeft: '0.25rem' }} />
          </Button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {/* Credit Limit */}
        <Card glass style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Corporate Credit Limit
            </div>
            <CreditCard size={18} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--brand-primary)' }}>
            ${company.creditLimit.toLocaleString()}
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>Used: ${company.usedAmount.toLocaleString()}</span>
              <span>{usagePercent}%</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${usagePercent}%`,
                  borderRadius: '99px',
                  backgroundColor: usagePercent > 80 ? '#ef4444' : usagePercent > 60 ? '#f59e0b' : '#16a34a',
                }}
              />
            </div>
            <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, marginTop: '0.35rem' }}>
              ${company.availableBalance.toLocaleString()} Available
            </div>
          </div>
        </Card>

        {/* Bookings This Month */}
        <Card glass style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Bookings
            </div>
            <TrendingUp size={18} style={{ color: '#16a34a' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--text-primary)' }}>
            {companyBookings.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {confirmedBookings.length} confirmed · {pendingApprovals.length} pending approval
          </div>
        </Card>

        {/* Total Travel Spend */}
        <Card glass style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Travel Spend (YTD)
            </div>
            <TrendingUp size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--text-primary)' }}>
            ${totalSpend.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Across {companyBookings.length} reservations in 2026
          </div>
        </Card>

        {/* Employees (managers only) */}
        {isManager && (
          <Card glass style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Corporate Travelers
              </div>
              <Users size={18} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--text-primary)' }}>
              {company.employeeCount || '—'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Enrolled company employees
            </div>
          </Card>
        )}
      </div>

      {/* ── Recent Bookings ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
            Recent Company Bookings
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/corporate/bookings')}>
            View All <ArrowRight size={13} style={{ marginLeft: '0.25rem' }} />
          </Button>
        </div>

        <Card glass style={{ padding: '0.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Reference</th>
                {isManager && <th style={{ padding: '0.75rem 1rem' }}>Traveler</th>}
                <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}>Policy</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {companyBookings.slice(0, 5).map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {b.reference}
                  </td>
                  {isManager && (
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{b.travelerName}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{b.departmentName}</div>
                    </td>
                  )}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {b.type === 'FLIGHT' ? <Plane size={13} style={{ color: 'var(--brand-primary)' }} /> : <Hotel size={13} style={{ color: '#059669' }} />}
                      {b.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                    ${b.totalAmount.toLocaleString()} {b.currency}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <Badge variant={b.policyStatus === 'WITHIN_POLICY' ? 'success' : 'warning'}>
                      {b.policyStatus === 'WITHIN_POLICY' ? 'In Policy' : 'Approval'}
                    </Badge>
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
                </tr>
              ))}
              {companyBookings.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No bookings yet. Start by booking a flight or hotel above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { icon: <Plane size={22} style={{ color: 'var(--brand-primary)' }} />, label: 'Search Flights', desc: 'Book flights for yourself or employees', to: '/corporate/book-flight' },
            { icon: <Hotel size={22} style={{ color: '#059669' }} />, label: 'Find Hotel Stays', desc: 'Book corporate hotel accommodations', to: '/corporate/book-hotel' },
            ...(isManager || isApprover ? [{ icon: <CheckCircle2 size={22} style={{ color: '#f59e0b' }} />, label: 'Review Approvals', desc: 'Approve or reject out-of-policy trips', to: '/corporate/approvals' }] : []),
            { icon: <CalendarClock size={22} style={{ color: '#8b5cf6' }} />, label: 'View All Bookings', desc: 'See complete travel history', to: '/corporate/bookings' },
          ].map((item) => (
            <Card
              key={item.label}
              glass
              style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'flex-start', transition: 'all 0.15s ease' }}
              onClick={() => navigate(item.to)}
            >
              <div style={{ flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: '0.2rem' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
