import React, { useMemo } from 'react';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { INITIAL_COMPANIES, INITIAL_CORPORATE_BOOKINGS } from '@tms/shared/services/corporateService';
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
  PieChart,
} from 'lucide-react';

export const CorporateReportsPage: React.FC = () => {
  const { user } = useAuthStore();
  const companyId = user?.companyId || 'comp-1';

  const company = useMemo(() => {
    return INITIAL_COMPANIES.find((c) => c.id === companyId) || INITIAL_COMPANIES[0];
  }, [companyId]);

  const bookings = useMemo(() => {
    return INITIAL_CORPORATE_BOOKINGS.filter((b) => b.companyId === companyId);
  }, [companyId]);

  const totalSpend = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const flightSpend = bookings.filter((b) => b.type === 'FLIGHT').reduce((sum, b) => sum + b.totalAmount, 0);
  const hotelSpend = bookings.filter((b) => b.type === 'HOTEL').reduce((sum, b) => sum + b.totalAmount, 0);

  // Department spend breakdown
  const departmentBreakdown = useMemo(() => {
    const map: Record<string, { count: number; spend: number }> = {};
    bookings.forEach((b) => {
      const dept = b.departmentName || 'General';
      if (!map[dept]) map[dept] = { count: 0, spend: 0 };
      map[dept].count += 1;
      map[dept].spend += b.totalAmount;
    });
    return Object.entries(map).map(([name, stat]) => ({
      name,
      count: stat.count,
      spend: stat.spend,
      percentage: totalSpend > 0 ? Math.round((stat.spend / totalSpend) * 100) : 0,
    }));
  }, [bookings, totalSpend]);

  // Monthly breakdown mock
  const monthlyData = [
    { month: 'May 2026', flights: 8400, hotels: 3200, total: 11600 },
    { month: 'Jun 2026', flights: 12200, hotels: 4800, total: 17000 },
    { month: 'Jul 2026', flights: 14500, hotels: 6100, total: 20600 },
    { month: 'Aug 2026', flights: 13200, hotels: 5200, total: 18400 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
            Travel Spend & Analytics Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.3rem' }}>
            {company.name} · Financial tracking, department cost allocations, and compliance analytics
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Download size={15} />}
          onClick={() => alert('Exporting corporate travel spend report (CSV)...')}
        >
          Export CSV Report
        </Button>
      </div>

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
            ${company.usedAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Of ${company.creditLimit.toLocaleString()} credit ceiling
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
            ${flightSpend.toLocaleString()}
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
            ${hotelSpend.toLocaleString()}
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
            94.2%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Bookings within pre-approved travel policy
          </div>
        </Card>
      </div>

      {/* ── Department Cost Allocation ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        <Card glass style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            Department Spend Allocation
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {departmentBreakdown.map((d) => (
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
            ))}
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
              {monthlyData.map((m) => (
                <tr key={m.month} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{m.month}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>${m.flights.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>${m.hotels.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    ${m.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};
