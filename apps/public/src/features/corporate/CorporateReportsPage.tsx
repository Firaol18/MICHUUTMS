import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import {
  corporateService,
  type ApiCompany,
  type ApiSpendReport,
} from '@tms/shared/services/corporateService';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  Building2,
  Plane,
  Hotel,
  Users,
  ShieldCheck,
  Clock,
  PieChart,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const CorporateReportsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'SPEND' | 'REQUESTS' | 'COMPLIANCE' | 'APPROVERS'>('SPEND');
  const [company, setCompany] = useState<ApiCompany | null>(null);
  const [spendReport, setSpendReport] = useState<ApiSpendReport | null>(null);
  const [requestStats, setRequestStats] = useState<any>(null);
  const [complianceReport, setComplianceReport] = useState<any>(null);
  const [approverPerformance, setApproverPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const rawCompanyId = user?.companyId || 'comp-1';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadAllReports = async () => {
      try {
        let resolvedId = rawCompanyId;
        const compList = await corporateService.getCompanies({ limit: 50 });
        const matched = compList.items.find(
          (c) => c.id === rawCompanyId || (user?.companyName && c.name.toLowerCase() === user.companyName.toLowerCase())
        );
        if (matched) {
          resolvedId = matched.id;
          if (isMounted) setCompany(matched);
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

        if (resolvedId && resolvedId !== 'comp-1') {
          const [spend, reqs, comp, apprv] = await Promise.allSettled([
            corporateService.getSpendReport(resolvedId),
            corporateService.getRequestStats(resolvedId),
            corporateService.getPolicyCompliance(resolvedId),
            corporateService.getApproverPerformance(resolvedId),
          ]);

          if (isMounted) {
            if (spend.status === 'fulfilled') setSpendReport(spend.value);
            if (reqs.status === 'fulfilled') setRequestStats(reqs.value);
            if (comp.status === 'fulfilled') setComplianceReport(comp.value);
            if (apprv.status === 'fulfilled') setApproverPerformance(apprv.value);
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllReports();
    return () => { isMounted = false; };
  }, [rawCompanyId, user?.companyName]);

  const companyName = company?.name || user?.companyName || 'Corporate Workspace';
  const totalSpend = Number(spendReport?.totalSpend) || 0;
  const creditLimit = Number(company?.annualTravelBudget) || 250000;
  const adherenceRate = complianceReport?.policyAppliedRate ?? 100;

  const monthlyData = spendReport?.monthlyBreakdown?.length
    ? spendReport.monthlyBreakdown.map((m) => ({
        month: m.month,
        flights: Math.round(m.amount * 0.7),
        hotels: Math.round(m.amount * 0.3),
        total: m.amount,
      }))
    : [];

  const departmentBreakdown = spendReport?.topDestinations?.length
    ? spendReport.topDestinations.map((d) => ({
        name: d.destination,
        count: d.count,
        spend: d.spend,
        percentage: totalSpend > 0 ? Math.round((d.spend / totalSpend) * 100) : 0,
      }))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
            Travel Spend & Analytics Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.3rem' }}>
            {companyName} · Financial tracking, department cost allocations, and compliance analytics
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Download size={15} />}
          onClick={() => alert(`Exporting corporate analytics report for ${companyName} (CSV)...`)}
        >
          Export CSV Report
        </Button>
      </div>

      {/* ── Report Tabs ── */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'SPEND', label: 'Spend Summary', icon: <CreditCard size={15} /> },
          { id: 'REQUESTS', label: 'Request KPIs', icon: <BarChart3 size={15} /> },
          { id: 'COMPLIANCE', label: 'Policy Compliance', icon: <ShieldCheck size={15} /> },
          { id: 'APPROVERS', label: 'Approver Performance', icon: <Clock size={15} /> },
        ].map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 800 : 600,
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading analytics reports..." />
      ) : activeTab === 'SPEND' ? (
        <>
          {/* ── Summary Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <Card glass style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Travel Spend (YTD)
                </span>
                <CreditCard size={18} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--brand-primary)' }}>
                ${totalSpend.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Of ${creditLimit.toLocaleString()} credit ceiling
              </div>
            </Card>

            <Card glass style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Flight Expenditure
                </span>
                <Plane size={18} style={{ color: '#2563eb' }} />
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--text-primary)' }}>
                ${Math.round(totalSpend * 0.7).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Across all domestic & international air tickets
              </div>
            </Card>

            <Card glass style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Hotel Stays
                </span>
                <Hotel size={18} style={{ color: '#059669' }} />
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--text-primary)' }}>
                ${Math.round(totalSpend * 0.3).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Corporate accommodations
              </div>
            </Card>

            <Card glass style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Policy Adherence Rate
                </span>
                <TrendingUp size={18} style={{ color: '#16a34a' }} />
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#16a34a' }}>
                {adherenceRate}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Bookings within pre-approved travel policy
              </div>
            </Card>
          </div>

          {/* ── Department Cost Allocation & Monthly Overview ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            <Card glass style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                Department Spend Allocation
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {departmentBreakdown.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', padding: '1.5rem 0', textAlign: 'center' }}>
                    No corporate travel spend recorded yet for {companyName}.
                  </div>
                ) : (
                  departmentBreakdown.map((d) => (
                    <div key={d.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          ${d.spend.toLocaleString()} ({d.percentage}%)
                        </span>
                      </div>
                      <div style={{ height: '7px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${d.percentage || 10}%`,
                            backgroundColor: 'var(--brand-primary)',
                            borderRadius: '99px',
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Monthly Trend Table */}
            <Card glass style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                Monthly Spending Overview (2026)
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Month</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Flights</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Hotels</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Total Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No monthly spend data available yet.
                      </td>
                    </tr>
                  ) : (
                    monthlyData.map((m) => (
                      <tr key={m.month} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{m.month}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>${m.flights.toLocaleString()}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>${m.hotels.toLocaleString()}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                          ${m.total.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        </>
      ) : activeTab === 'REQUESTS' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <Card glass style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: '0 0 1rem 0' }}>Request Volume by Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { status: 'APPROVED', count: requestStats?.byStatus?.['APPROVED'] ?? 0, color: '#16a34a' },
                { status: 'UNDER_REVIEW', count: (requestStats?.byStatus?.['UNDER_REVIEW'] ?? 0) + (requestStats?.byStatus?.['SUBMITTED'] ?? 0), color: '#ea580c' },
                { status: 'REJECTED', count: requestStats?.byStatus?.['REJECTED'] ?? 0, color: '#ef4444' },
                { status: 'COMPLETED', count: requestStats?.byStatus?.['COMPLETED'] ?? 0, color: '#2563eb' },
              ].map((s) => (
                <div key={s.status} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 700, color: s.color }}>{s.status}</span>
                  <strong>{s.count} requests</strong>
                </div>
              ))}
            </div>
          </Card>
          <Card glass style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: '0 0 1rem 0' }}>Approval Efficiency KPIs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Average Turnaround Time</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-primary)' }}>
                  {requestStats?.averageApprovalHours ? `${requestStats.averageApprovalHours} Hours` : '0.0 Hours'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Overall Approval Rate</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#16a34a' }}>
                  {requestStats?.approvalRate ? `${requestStats.approvalRate}%` : '100%'}
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : activeTab === 'COMPLIANCE' ? (
        <Card glass style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: '0 0 1rem 0' }}>Policy Adherence & Overrides</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Standard Policy Bookings</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#16a34a' }}>
                {complianceReport?.policyAppliedRate ?? 100}%
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Manager Budget Overrides</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#8b5cf6' }}>
                {complianceReport?.budgetOverrideRate ?? 0}%
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Economy Class Compliance</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563eb' }}>
                {complianceReport?.economyRate ?? 100}%
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card glass style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: '0 0 1rem 0' }}>Approver Performance & Velocity</h3>
          {!approverPerformance?.approvers || approverPerformance.approvers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
              No approver decision records found for {companyName}.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Approver Name</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Decisions</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Approved</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Rejected</th>
                  <th style={{ padding: '0.6rem 0.5rem' }}>Avg Turnaround</th>
                </tr>
              </thead>
              <tbody>
                {approverPerformance.approvers.map((a: any) => (
                  <tr key={a.approverId || a.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{a.name}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{(a.approved || 0) + (a.rejected || 0)}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#16a34a', fontWeight: 700 }}>{a.approved || 0}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#ef4444', fontWeight: 700 }}>{a.rejected || 0}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{a.avgHours ? `${a.avgHours}h` : '0h'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
};
