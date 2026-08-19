import React from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { BarChart3, Download, TrendingUp, PieChart } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 style={{ color: '#034ea2' }} /> Tourism Intelligence & Financial Reports
            </h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Analytical reports on monthly revenue, booking conversion rates, popular tour packages, and net profit margins
            </p>
          </div>

          <Button variant="primary" size="sm" icon={<Download size={16} />} style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700 }}>
            Download PDF Analytical Report
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <Card glass style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>NET MONTHLY PROFIT</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#10b981', marginTop: 4 }}>+$11,430 USD</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Revenue ($24,850) - Expenses ($13,420)</div>
        </Card>

        <Card glass style={{ padding: '1.25rem', borderLeft: '4px solid #034ea2' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>BOOKING CONVERSION RATE</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#034ea2', marginTop: 4 }}>84.6%</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>+5.2% vs previous month</div>
        </Card>

        <Card glass style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE TOUR CUSTOMERS</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#f59e0b', marginTop: 4 }}>436 Tourists</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Across 17 confirmed tour groups</div>
        </Card>
      </div>

      {/* Report Tables & Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <Card glass style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: '#10b981' }} /> Popular Destinations Report
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
            <div className="flex-between" style={{ padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <span>1. Lalibela Rock-Hewn Churches</span>
              <strong style={{ color: '#034ea2' }}>142 Bookings (32.5%)</strong>
            </div>
            <div className="flex-between" style={{ padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <span>2. Simien Mountains Trekking</span>
              <strong style={{ color: '#034ea2' }}>118 Bookings (27.0%)</strong>
            </div>
            <div className="flex-between" style={{ padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <span>3. Danakil Depression Volcano</span>
              <strong style={{ color: '#034ea2' }}>94 Bookings (21.5%)</strong>
            </div>
            <div className="flex-between" style={{ padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <span>4. Wenchi Crater Lake Eco-Resort</span>
              <strong style={{ color: '#034ea2' }}>82 Bookings (18.8%)</strong>
            </div>
          </div>
        </Card>

        <Card glass style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} style={{ color: '#034ea2' }} /> Tour Profitability Ledger
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
            <div className="flex-between" style={{ padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <span>Simien 5-Day Expedition</span>
              <span style={{ fontWeight: 800, color: '#10b981' }}>+$4,850 Profit Margin</span>
            </div>
            <div className="flex-between" style={{ padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <span>Historic Route Ethiopia</span>
              <span style={{ fontWeight: 800, color: '#10b981' }}>+$3,920 Profit Margin</span>
            </div>
            <div className="flex-between" style={{ padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <span>Danakil Lava Rim Tour</span>
              <span style={{ fontWeight: 800, color: '#10b981' }}>+$2,660 Profit Margin</span>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};
