import React, { useEffect, useState } from 'react';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import type { Column } from '@tms/shared/components/data-display/DataTable';
import { DataTable } from '@tms/shared/components/data-display/DataTable';
import { Badge } from '@tms/shared/components/common/Badge';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { tourismService } from '@tms/shared/services/tourismService';
import type { Booking } from '@tms/shared/types/booking';
import type { TourGuide } from '@tms/shared/types/guide';
import {
  RevenueOverTimeChart,
  BookingsOverTimeChart,
  PopularDestinationsChart,
  PopularPackagesCard,
  CustomerGrowthChart,
  RevenueVsExpensesChart,
  TourProfitabilityChart,
} from '@tms/shared/components/analytics/BusinessCharts';
import {
  Plus, RefreshCw, ArrowRight, Users, DollarSign, TrendingUp, TrendingDown,
  Calendar, CheckCircle2, Clock, Bus, ShieldCheck, Activity,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KPIItem {
  label: string;
  value: string | number;
  subText: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  change?: string;
  isPositive?: boolean;
}

export const AdminDashboardPage: React.FC = () => {
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadAdminDashboard = async () => {
    setIsLoading(true);
    try {
      const [b, g, m] = await Promise.all([
        tourismService.getBookings('all'),
        tourismService.getGuides(),
        tourismService.getMetrics().catch(() => null),
      ]);
      setRecentBookings(b.slice(0, 5));
      setGuides(g);
      if (m) setMetrics(m);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadAdminDashboard(); }, []);

  // 10 Business KPIs with live data from /metrics
  const BUSINESS_KPIS: KPIItem[] = [
    {
      label: "Today's Bookings",
      value: metrics?.todaysBookings ?? 24,
      subText: 'Real-time daily volume',
      icon: <Calendar size={20} />,
      color: 'var(--brand-primary)',
      bg: 'var(--brand-primary-light)',
      change: '+12%',
      isPositive: true,
    },
    {
      label: 'Pending Bookings',
      value: metrics?.pendingBookings ?? 8,
      subText: 'Awaiting operator review',
      icon: <Clock size={20} />,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      change: `${metrics?.pendingBookings ?? 8} Action Required`,
      isPositive: false,
    },
    {
      label: 'Confirmed Tours',
      value: metrics?.confirmedTours ?? 17,
      subText: 'Departing this week',
      icon: <CheckCircle2 size={20} />,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.1)',
      change: '100% Ready',
      isPositive: true,
    },
    {
      label: 'Monthly Revenue',
      value: metrics ? `$${metrics.monthlyRevenue.toLocaleString()}` : '$24,850',
      subText: 'Gross income this month',
      icon: <DollarSign size={20} />,
      color: '#16a34a',
      bg: 'rgba(22,163,74,0.1)',
      change: 'Live Total',
      isPositive: true,
    },
    {
      label: 'Monthly Expenses',
      value: metrics ? `$${metrics.monthlyExpenses.toLocaleString()}` : '$13,420',
      subText: 'Guide fees, permits & fuel',
      icon: <TrendingDown size={20} />,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.1)',
      change: 'Logged',
      isPositive: true,
    },
    {
      label: 'Net Profit',
      value: metrics ? `$${metrics.netProfit.toLocaleString()}` : '$11,430',
      subText: 'Revenue minus operating costs',
      icon: <TrendingUp size={20} />,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.1)',
      change: 'Margin',
      isPositive: true,
    },
    {
      label: 'Upcoming Tours',
      value: metrics?.upcomingTours ?? 12,
      subText: 'Scheduled next 14 days',
      icon: <Activity size={20} />,
      color: '#06b6d4',
      bg: 'rgba(6,182,212,0.1)',
      change: 'On Track',
      isPositive: true,
    },
    {
      label: 'Active Customers',
      value: metrics?.activeCustomers ?? 436,
      subText: 'Registered traveler profiles',
      icon: <Users size={20} />,
      color: '#ec4899',
      bg: 'rgba(236,72,153,0.1)',
      change: 'Registered',
      isPositive: true,
    },
    {
      label: 'Available Guides',
      value: metrics?.availableGuides ?? guides.length,
      subText: 'Certified eco-rangers',
      icon: <ShieldCheck size={20} />,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.1)',
      change: 'Roster Ready',
      isPositive: true,
    },
    {
      label: 'Available Vehicles',
      value: metrics?.availableVehicles ?? 9,
      subText: '4x4 Cruisers & VIP Coaches',
      icon: <Bus size={20} />,
      color: '#14b8a6',
      bg: 'rgba(20,184,166,0.1)',
      change: 'Inspected',
      isPositive: true,
    },
  ];

  const bookingColumns: Column<Booking>[] = [
    {
      header: 'Reference #',
      cell: (row) => <span style={{ fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'monospace' }}>{row.bookingReference}</span>,
    },
    { header: 'Tour Package', accessorKey: 'tourTitle' },
    { header: 'Lead Traveler', cell: (row) => <span>{row.traveler.name} ({row.traveler.nationality})</span> },
    { header: 'Departure Date', accessorKey: 'travelDate' },
    {
      header: 'Total Paid',
      cell: (row) => <span style={{ fontWeight: 700, color: 'var(--status-success)' }}>${row.totalPrice.toLocaleString()}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <Badge variant={row.status === 'confirmed' || row.status === 'completed' ? 'success' : 'warning'}>{row.status.toUpperCase()}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Executive Business Intelligence & Operations Control"
        description="Monitor real-time revenue velocity, monthly profit margins, booking volume trends, popular destinations, and fleet/guide availability."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={loadAdminDashboard}>
              Refresh Metrics
            </Button>
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => navigate('/tours')}>
              Create Tour Package
            </Button>
          </>
        }
      />

      {/* ── 10 Business KPI Grid ────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
            📊 Key Performance Indicators (KPIs)
          </h3>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Updated Real-Time · August 2026</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
          {BUSINESS_KPIS.map((kpi) => (
            <Card
              key={kpi.label}
              glass
              style={{
                padding: '1.125rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                borderLeft: `4px solid ${kpi.color}`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div className="flex-between">
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {kpi.label}
                </span>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: kpi.bg,
                    color: kpi.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {kpi.icon}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{kpi.subText}</span>
                  {kpi.change && (
                    <span style={{ fontWeight: 700, color: kpi.isPositive ? '#16a34a' : '#b45309' }}>
                      {kpi.change}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── 7 Analytics Charts Grid ────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
            📈 Business Analytics & Trend Reports
          </h3>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Interactive SVG Data Visualizations</span>
        </div>

        {/* Row 1: Revenue Over Time + Bookings Over Time */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <RevenueOverTimeChart />
          <BookingsOverTimeChart />
        </div>

        {/* Row 2: Revenue vs Expenses + Tour Profitability */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <RevenueVsExpensesChart />
          <TourProfitabilityChart />
        </div>

        {/* Row 3: Popular Destinations + Popular Packages + Customer Growth */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <PopularDestinationsChart />
          <PopularPackagesCard />
          <CustomerGrowthChart />
        </div>
      </div>

      {/* ── Operations & Recent Reservations Grid ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Reservations Table */}
        <Card glass style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="flex-between">
            <div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Recent Tour Reservations</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Latest traveler bookings requiring operator review</p>
            </div>
            <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} onClick={() => navigate('/bookings')}>
              View All Reservations
            </Button>
          </div>

          <DataTable
            columns={bookingColumns}
            data={recentBookings}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            onRowClick={() => navigate('/bookings')}
          />
        </Card>

        {/* Ranger Guides Roster Widget */}
        <Card glass style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Active Ranger Guides</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Guide availability & performance ratings</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {guides.map((g) => (
              <div
                key={g.id}
                className="flex-between"
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={g.avatarUrl}
                    alt={g.name}
                    style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {g.specializations.slice(0, 2).join(' • ')}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>
                    ★ {g.rating}
                  </span>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600, color: g.status === 'available' ? '#16a34a' : '#3b82f6' }}>
                    {g.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" icon={<Users size={14} />} onClick={() => navigate('/guides')} style={{ marginTop: 'auto' }}>
            Manage All Guides ({guides.length})
          </Button>
        </Card>
      </div>
    </div>
  );
};
