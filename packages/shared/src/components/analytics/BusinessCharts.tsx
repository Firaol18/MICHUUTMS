import React, { useState } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import {
  TrendingUp, MapPin, Package, Users,
} from 'lucide-react';

// ── Mock Time-Series Analytics Data ──────────────────────────────────────────
export const MONTHLY_REVENUE_DATA = [
  { month: 'Jan', revenue: 14200, expenses: 8100, profit: 6100, bookings: 12, customers: 280 },
  { month: 'Feb', revenue: 16500, expenses: 9200, profit: 7300, bookings: 15, customers: 310 },
  { month: 'Mar', revenue: 19800, expenses: 10400, profit: 9400, bookings: 18, customers: 345 },
  { month: 'Apr', revenue: 17400, expenses: 9800, profit: 7600, bookings: 16, customers: 370 },
  { month: 'May', revenue: 21000, expenses: 11200, profit: 9800, bookings: 21, customers: 395 },
  { month: 'Jun', revenue: 23500, expenses: 12100, profit: 11400, bookings: 22, customers: 412 },
  { month: 'Jul', revenue: 22100, expenses: 11800, profit: 10300, bookings: 20, customers: 425 },
  { month: 'Aug', revenue: 24850, expenses: 13420, profit: 11430, bookings: 24, customers: 436 },
];

export const POPULAR_DESTINATIONS = [
  { name: 'Lalibela Rock Churches', region: 'Amhara', bookings: 68, revenue: 57800, share: 32, color: 'var(--brand-primary)' },
  { name: 'Wenchi Crater Lake', region: 'Oromia', bookings: 54, revenue: 24300, share: 25, color: '#10b981' },
  { name: 'Danakil & Erta Ale', region: 'Afar', bookings: 42, revenue: 52500, share: 20, color: '#f59e0b' },
  { name: 'Simien Mountains Trek', region: 'Amhara', bookings: 31, revenue: 40300, share: 15, color: '#8b5cf6' },
  { name: 'Bale Mountains Eco Park', region: 'Oromia', bookings: 18, revenue: 16200, share: 8, color: '#ec4899' },
];

export const POPULAR_PACKAGES = [
  { title: 'Wenchi Crater Lake Eco-Resort', category: 'Luxury Eco', price: '$450', bookings: 54, revenue: '$24,300', margin: '54%' },
  { title: 'Danakil & Erta Ale Lava Lake Expedition', category: 'Extreme Adventure', price: '$1,250', bookings: 42, revenue: '$52,500', margin: '48%' },
  { title: 'Lalibela World Heritage Pilgrimage', category: 'Cultural Heritage', price: '$850', bookings: 68, revenue: '$57,800', margin: '51%' },
  { title: 'Simien Gelada Baboon & Summit Trek', category: 'Mountain Trekking', price: '$1,300', bookings: 31, revenue: '$40,300', margin: '42%' },
];

export const PROFITABILITY_BY_CATEGORY = [
  { category: 'Luxury Eco & Spa', revenue: 48500, expenses: 22300, margin: 54, color: '#10b981' },
  { category: 'Cultural Heritage', revenue: 72400, expenses: 35400, margin: 51, color: 'var(--brand-primary)' },
  { category: 'Extreme & Desert', revenue: 65000, expenses: 33800, margin: 48, color: '#f59e0b' },
  { category: 'Mountain Trekking', revenue: 51200, expenses: 29700, margin: 42, color: '#8b5cf6' },
];

// ── 1. Revenue Over Time (Area Chart) ─────────────────────────────────────────
export const RevenueOverTimeChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = 30000;
  const height = 220;
  const width = 500;
  const padding = 35;

  const points = MONTHLY_REVENUE_DATA.map((d, i) => {
    const x = padding + (i / (MONTHLY_REVENUE_DATA.length - 1)) * (width - 2 * padding);
    const y = height - padding - (d.revenue / maxVal) * (height - 2 * padding);
    return { x, y, data: d };
  });

  const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <Card glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="flex-between">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Revenue Over Time</h3>
            <Badge variant="success" icon={<TrendingUp size={12} />}>+18.4% MoM</Badge>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
            Monthly gross booking revenue in USD ($)
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--brand-primary)' }}>$24,850</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Aug 2026 Peak</span>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 10000, 20000, 30000].map((v) => {
            const y = height - padding - (v / maxVal) * (height - 2 * padding);
            return (
              <g key={v}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border-color)" strokeDasharray="3 3" />
                <text x={padding - 6} y={y + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end">${v / 1000}k</text>
              </g>
            );
          })}

          {/* Fill Area */}
          <path d={areaD} fill="url(#revGrad)" />

          {/* Stroke Line */}
          <path d={pathD} fill="none" stroke="var(--brand-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive Data Points */}
          {points.map((p, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: 'pointer' }}>
              <circle
                cx={p.x} cy={p.y} r={hoveredIdx === idx ? 6 : 4}
                fill={hoveredIdx === idx ? 'var(--brand-primary)' : 'var(--bg-primary)'}
                stroke="var(--brand-primary)" strokeWidth="2.5"
                style={{ transition: 'all 0.2s' }}
              />
              <text x={p.x} y={height - 10} fill="var(--text-muted)" fontSize="10" textAnchor="middle" fontWeight={hoveredIdx === idx ? 700 : 400}>
                {p.data.month}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIdx !== null && (
          <div
            style={{
              position: 'absolute',
              top: points[hoveredIdx].y - 45,
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--brand-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.625rem',
              fontSize: 11,
              fontWeight: 700,
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap',
            }}
          >
            {MONTHLY_REVENUE_DATA[hoveredIdx].month}: ${MONTHLY_REVENUE_DATA[hoveredIdx].revenue.toLocaleString()}
          </div>
        )}
      </div>
    </Card>
  );
};

// ── 2. Bookings Over Time (Bar Chart) ────────────────────────────────────────
export const BookingsOverTimeChart: React.FC = () => {
  const maxBookings = 30;
  const height = 200;

  return (
    <Card glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="flex-between">
        <div>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Bookings Over Time</h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
            Monthly expedition volume trends
          </p>
        </div>
        <Badge variant="info">24 Bookings This Month</Badge>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: height - 40, paddingTop: '1rem', borderBottom: '1px solid var(--border-color)', gap: '0.5rem' }}>
        {MONTHLY_REVENUE_DATA.map((d, idx) => {
          const barHeight = (d.bookings / maxBookings) * (height - 60);
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.35rem' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-primary)' }}>{d.bookings}</span>
              <div
                style={{
                  width: '100%',
                  maxWidth: 28,
                  height: barHeight,
                  backgroundColor: idx === MONTHLY_REVENUE_DATA.length - 1 ? 'var(--brand-primary)' : 'var(--brand-primary-light)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  transition: 'height 0.4s ease',
                  border: idx === MONTHLY_REVENUE_DATA.length - 1 ? '1px solid var(--brand-primary)' : 'none',
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{d.month}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ── 3. Revenue vs Expenses Comparison (Grouped Bar Chart) ──────────────────────
export const RevenueVsExpensesChart: React.FC = () => {
  return (
    <Card glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="flex-between">
        <div>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Revenue vs. Expenses</h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
            Gross Income ($24.8k) vs Operating Costs ($13.4k)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: 11 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, backgroundColor: '#10b981', borderRadius: 2 }} /> Revenue
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, backgroundColor: '#ef4444', borderRadius: 2 }} /> Expenses
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        {MONTHLY_REVENUE_DATA.slice(-4).map((d) => (
          <div key={d.month} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600 }}>
              <span>{d.month} 2026</span>
              <span>Net Profit: <strong style={{ color: '#16a34a' }}>+${d.profit.toLocaleString()}</strong></span>
            </div>
            <div style={{ display: 'flex', gap: 4, height: 14, width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ width: `${(d.revenue / 30000) * 100}%`, height: '100%', backgroundColor: '#10b981', borderRadius: 'var(--radius-full)' }} title={`Revenue: $${d.revenue}`} />
              <div style={{ width: `${(d.expenses / 30000) * 100}%`, height: '100%', backgroundColor: '#ef4444', borderRadius: 'var(--radius-full)' }} title={`Expenses: $${d.expenses}`} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ── 4. Popular Destinations (Horizontal Ranking) ──────────────────────────────
export const PopularDestinationsChart: React.FC = () => {
  return (
    <Card glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="flex-between">
        <div>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Popular Destinations</h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
            Most requested tour locations by volume
          </p>
        </div>
        <MapPin size={18} style={{ color: 'var(--brand-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {POPULAR_DESTINATIONS.map((d, i) => (
          <div key={d.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
              <span style={{ fontWeight: 700 }}>
                #{i + 1} {d.name} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({d.region})</span>
              </span>
              <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
                {d.bookings} tours · ${d.revenue.toLocaleString()}
              </span>
            </div>
            <div style={{ height: 8, width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${d.share * 2.8}%`,
                  height: '100%',
                  backgroundColor: d.color,
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ── 5. Popular Packages Performance Table ─────────────────────────────────────
export const PopularPackagesCard: React.FC = () => {
  return (
    <Card glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="flex-between">
        <div>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Popular Tour Packages</h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
            Top revenue-generating catalog items
          </p>
        </div>
        <Package size={18} style={{ color: 'var(--brand-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {POPULAR_PACKAGES.map((pkg, idx) => (
          <div
            key={pkg.title}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                #{idx + 1} {pkg.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Category: <strong>{pkg.category}</strong> · Unit Price: {pkg.price}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: 'var(--status-success)', fontSize: 'var(--font-size-sm)' }}>
                {pkg.revenue}
              </div>
              <span style={{ fontSize: 11, color: 'var(--brand-primary)', fontWeight: 700 }}>
                {pkg.bookings} bookings ({pkg.margin} margin)
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ── 6. Customer Growth Curve ──────────────────────────────────────────────────
export const CustomerGrowthChart: React.FC = () => {
  return (
    <Card glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="flex-between">
        <div>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Customer Growth</h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
            Active registered traveler accounts
          </p>
        </div>
        <Badge variant="success" icon={<Users size={12} />}>436 Active Users</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
        {MONTHLY_REVENUE_DATA.slice(-5).map((d) => (
          <div key={d.month} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
            <span style={{ width: 35, fontWeight: 700, color: 'var(--text-muted)' }}>{d.month}</span>
            <div style={{ flex: 1, height: 10, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ width: `${(d.customers / 500) * 100}%`, height: '100%', backgroundColor: 'var(--brand-primary)', borderRadius: 'var(--radius-full)' }} />
            </div>
            <span style={{ width: 60, textAlign: 'right', fontWeight: 700 }}>{d.customers} users</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ── 7. Tour Profitability Breakdown ───────────────────────────────────────────
export const TourProfitabilityChart: React.FC = () => {
  return (
    <Card glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="flex-between">
        <div>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Tour Profitability</h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
            Net profit margin % by tour category
          </p>
        </div>
        <Badge variant="info">46% Avg Margin</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {PROFITABILITY_BY_CATEGORY.map((cat) => (
          <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
              <span style={{ fontWeight: 700 }}>{cat.category}</span>
              <span style={{ fontWeight: 800, color: cat.color }}>
                {cat.margin}% Profit Margin (${(cat.revenue - cat.expenses).toLocaleString()} net)
              </span>
            </div>
            <div style={{ height: 10, width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ width: `${cat.margin * 1.5}%`, height: '100%', backgroundColor: cat.color, borderRadius: 'var(--radius-full)' }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
