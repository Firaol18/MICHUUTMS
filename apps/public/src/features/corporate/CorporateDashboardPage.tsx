import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import {
  corporateService,
  type ApiCompany,
  type ApiTravelRequest,
} from '@tms/shared/services/corporateService';
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
  const [company, setCompany] = useState<ApiCompany | null>(null);
  const [requests, setRequests] = useState<ApiTravelRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const rawCompanyId = user?.companyId || 'comp-1';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const compList = await corporateService.getCompanies({ limit: 50 });
        const matched = compList.items.find(
          (c) => c.id === rawCompanyId || (user?.companyName && c.name.toLowerCase() === user.companyName.toLowerCase())
        );
        if (matched && isMounted) {
          setCompany(matched);
          const reqs = await corporateService.getTravelRequests(matched.id, { limit: 100 });
          if (isMounted) setRequests(reqs.items);
        } else if (isMounted && user?.companyName) {
          setCompany({
            id: user.companyId || 'comp-custom',
            name: user.companyName,
            code: 'CORP',
            annualTravelBudget: 250000,
            currency: 'USD',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as any);
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [rawCompanyId, user?.companyName]);

  const companyName = company?.name || user?.companyName || 'Corporate Workspace';
  const creditLimit = Number(company?.annualTravelBudget) || 250000;
  const approvedSpend = requests
    .filter((r) => r.status === 'APPROVED' || r.status === 'COMPLETED')
    .reduce((sum, r) => sum + Number(r.estimatedCost), 0);
  const availableBalance = Math.max(0, creditLimit - approvedSpend);
  const usagePercent = Math.min(100, Math.round((approvedSpend / creditLimit) * 100));

  const pendingApprovals = requests.filter((r) => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING'].includes(r.status));
  const complianceRate = requests.length > 0
    ? `${Math.round(((requests.length - requests.filter((r) => r.policyViolations?.length).length) / requests.length) * 100)}%`
    : '100%';
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
            {companyName} · {user?.role?.replace('_', ' ')} · {user?.departmentName || 'Corporate Division'}
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
                {pendingApprovals.length} Travel Request{pendingApprovals.length > 1 ? 's' : ''} Awaiting Approval
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                Corporate travel requests require your review before confirmation
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/corporate/approvals')}>
            Review Now <ArrowRight size={14} style={{ marginLeft: '0.25rem' }} />
          </Button>
        </div>
      )}

      {/* ── Financial & Metrics Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <Card glass style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Corporate Credit Line
            </span>
            <CreditCard size={18} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--text-primary)' }}>
            ${creditLimit.toLocaleString()}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>Used: ${approvedSpend.toLocaleString()}</span>
              <span>Available: ${availableBalance.toLocaleString()}</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${usagePercent}%`, backgroundColor: usagePercent > 85 ? '#ef4444' : 'var(--brand-primary)', borderRadius: '99px' }} />
            </div>
          </div>
        </Card>

        <Card glass style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Travel Requests
            </span>
            <Plane size={18} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--text-primary)' }}>
            {requests.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Across all enrolled departments
          </div>
        </Card>

        <Card glass style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Pending Approvals
            </span>
            <Clock size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: pendingApprovals.length > 0 ? '#f59e0b' : 'var(--text-primary)' }}>
            {pendingApprovals.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Requiring line manager clearance
          </div>
        </Card>

        <Card glass style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Policy Adherence
            </span>
            <TrendingUp size={18} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#10b981' }}>
            {complianceRate}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            In-policy bookings YTD
          </div>
        </Card>
      </div>

      {/* ── Quick Actions Grid ── */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Quick Corporate Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <Card
            glass
            onClick={() => navigate('/corporate/book-flight')}
            style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.15s ease' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Plane size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>Book Corporate Flight</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Search pre-approved corporate airfares</div>
            </div>
          </Card>

          <Card
            glass
            onClick={() => navigate('/corporate/book-hotel')}
            style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.15s ease' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: 'rgba(5,150,105,0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Hotel size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>Book Corporate Hotel</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hotels matching policy price ceilings</div>
            </div>
          </Card>

          {isManager && (
            <Card
              glass
              onClick={() => navigate('/corporate/employees')}
              style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.15s ease' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>Manage Employees</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Add team members & set roles</div>
              </div>
            </Card>
          )}

          <Card
            glass
            onClick={() => navigate('/corporate/policy')}
            style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.15s ease' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: 'rgba(234,88,12,0.1)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>View Travel Policy</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rules, caps & approval thresholds</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
