import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/data-display/MetricCard';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { tourismService } from '@/services/tourismService';
import type { MetricCardData } from '@/types/common';
import type { Booking } from '@/types/booking';
import type { TourGuide } from '@/types/guide';
import { Plus, RefreshCw, ArrowRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCardData[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadAdminDashboard = async () => {
    setIsLoading(true);
    try {
      const [, b, g, t, issues] = await Promise.all([
        tourismService.getMetrics(),
        tourismService.getBookings('all'),
        tourismService.getGuides(),
        tourismService.getTours(),
        tourismService.getIssueTickets(),
      ]);

      // Dynamic calculation from real-time customer data
      const totalRev = b.reduce((sum, item) => sum + (item.paymentStatus === 'paid' ? item.totalPrice : 0), 0);
      const openIssuesCount = issues.filter((i) => i.status !== 'resolved').length;

      const dynamicMetrics: MetricCardData[] = [
        {
          id: '1',
          title: 'Total Booking Revenue',
          value: `$${totalRev.toLocaleString()}`,
          changePercent: 18.4,
          changeType: 'positive',
          description: 'vs last month',
        },
        {
          id: '2',
          title: 'Total Passenger Manifest',
          value: `${b.length} Reservations`,
          changePercent: b.length,
          changeType: 'positive',
          description: 'live bookings',
        },
        {
          id: '3',
          title: 'Active Tour Packages',
          value: `${t.length} Tours`,
          changeType: 'neutral',
          description: 'public portal',
        },
        {
          id: '4',
          title: 'Pending Support Tickets',
          value: `${openIssuesCount} Open`,
          changeType: openIssuesCount > 0 ? 'negative' : 'positive',
          description: 'customer portal',
        },
      ];

      setMetrics(dynamicMetrics);
      setRecentBookings(b.slice(0, 5));
      setGuides(g);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  const bookingColumns: Column<Booking>[] = [
    {
      header: 'Reference #',
      accessorKey: 'bookingReference',
      cell: (row) => <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{row.bookingReference}</span>,
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
      cell: (row) => <Badge variant={row.status === 'confirmed' ? 'success' : 'warning'}>{row.status.toUpperCase()}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tourism Management Control Center"
        description="Monitor booking revenue velocity, active tour expeditions, and ranger guide assignments."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={loadAdminDashboard}>
              Refresh Data
            </Button>
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => navigate('/admin/tours')}>
              Create Tour Package
            </Button>
          </>
        }
      />

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {metrics.map((m) => (
          <MetricCard key={m.id} metric={m} />
        ))}
      </div>

      {/* Main Admin Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Reservations Table */}
        <Card glass style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="flex-between">
            <div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>Recent Tour Reservations</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Latest traveler bookings requiring operator review</p>
            </div>
            <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} onClick={() => navigate('/admin/bookings')}>
              View All Reservations
            </Button>
          </div>

          <DataTable
            columns={bookingColumns}
            data={recentBookings}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            onRowClick={() => navigate('/admin/bookings')}
          />
        </Card>

        {/* Tour Guides Status Roster */}
        <Card glass style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>Active Tour Guides Roster</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Ranger availability & traveler ratings</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {guides.map((g) => (
              <div
                key={g.id}
                className="flex-between"
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-tertiary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={g.avatarUrl}
                    alt={g.name}
                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{g.name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {g.languages.join(', ')}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--status-success)' }}>
                    ★ {g.rating}
                  </span>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {g.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" icon={<Users size={14} />} onClick={() => navigate('/admin/guides')} style={{ marginTop: 'auto' }}>
            Manage Ranger Guides
          </Button>
        </Card>
      </div>
    </div>
  );
};
