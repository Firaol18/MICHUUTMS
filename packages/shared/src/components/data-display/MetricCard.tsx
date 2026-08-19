import React from 'react';
import { Card } from '@tms/shared/components/common/Card';
import type { MetricCardData } from '@tms/shared/types/common';
import { Truck, CheckCircle2, MapPin, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Truck: <Truck size={22} />,
  CheckCircle2: <CheckCircle2 size={22} />,
  MapPin: <MapPin size={22} />,
  Clock: <Clock size={22} />,
};

interface MetricCardProps {
  metric: MetricCardData;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const isPositive = metric.changeType === 'positive';
  const icon = metric.iconName ? iconMap[metric.iconName] || <Truck size={22} /> : null;

  return (
    <Card glass style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="flex-between">
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {metric.title}
        </span>
        {icon && (
          <div
            className="flex-center"
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--brand-primary-light)',
              color: 'var(--brand-primary)',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {metric.value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--font-size-xs)' }}>
        {metric.changePercent !== undefined && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontWeight: 600,
              color: isPositive ? 'var(--status-success)' : 'var(--status-danger)',
            }}
          >
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(metric.changePercent)}%
          </span>
        )}
        {metric.description && <span style={{ color: 'var(--text-muted)' }}>{metric.description}</span>}
      </div>
    </Card>
  );
};
