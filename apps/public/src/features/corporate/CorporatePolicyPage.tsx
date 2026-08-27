import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { corporateService } from '@tms/shared/services/corporateService';
import type { TravelPolicy } from '@tms/shared/types/corporate';
import {
  ShieldCheck,
  Plane,
  Hotel,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

export const CorporatePolicyPage: React.FC = () => {
  const { user } = useAuthStore();
  const [policy, setPolicy] = useState<TravelPolicy | null>(null);
  const [loading, setLoading] = useState(true);

  const companyId = user?.companyId || 'comp-1';

  useEffect(() => {
    corporateService.getTravelPolicies().then((all) => {
      const found = all.find((p) => p.companyId === companyId && p.isActive);
      setPolicy(found || null);
      setLoading(false);
    });
  }, [companyId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading travel policy...</div>;
  }

  if (!policy) {
    return (
      <Card glass style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertTriangle size={32} style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
        <h2 style={{ fontWeight: 800 }}>No Travel Policy Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>Your company does not yet have a travel policy configured. Please contact your Corporate Admin or your TMS Account Manager.</p>
      </Card>
    );
  }

  const cabinColors: Record<string, string> = { ECONOMY: '#059669', BUSINESS: '#2563eb', FIRST: '#8b5cf6' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, margin: 0 }}>Travel Policy</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.3rem' }}>
            {policy.name} · Effective {new Date(policy.effectiveDate).toLocaleDateString()}
            {policy.expiryDate && ` – ${new Date(policy.expiryDate).toLocaleDateString()}`}
          </p>
        </div>
        <Badge variant="success" icon={<ShieldCheck size={13} />}>Active Policy</Badge>
      </div>

      {/* Policy overview blurb */}
      {policy.description && (
        <Card glass style={{ padding: '1.25rem 1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0, lineHeight: 1.7 }}>
            {policy.description}
          </p>
        </Card>
      )}

      {/* Flight Policy */}
      <Card glass style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(37,99,235,0.1)' }}>
            <Plane size={18} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>Flight Rules</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {/* Max fare */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Maximum Ticket Fare
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--text-primary)' }}>
              ${policy.maxFlightPrice?.toLocaleString() || 'Unlimited'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Any booking above this requires approval
            </div>
          </div>

          {/* Allowed cabin classes */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Allowed Cabin Classes
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
              {['ECONOMY', 'BUSINESS', 'FIRST'].map((cabin) => {
                const allowed = policy.allowedCabinClasses?.includes(cabin as any);
                return (
                  <span
                    key={cabin}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      backgroundColor: allowed ? `${cabinColors[cabin]}22` : 'var(--bg-secondary)',
                      color: allowed ? cabinColors[cabin] : 'var(--text-muted)',
                      border: `1px solid ${allowed ? cabinColors[cabin] : 'var(--border-color)'}`,
                    }}
                  >
                    {allowed ? <CheckCircle2 size={11} /> : <XCircle size={11} />} {cabin}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Advance booking */}
          {policy.advanceBookingDays !== undefined && (
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Advance Booking Required
              </div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--text-primary)' }}>
                {policy.advanceBookingDays} days
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Must book at least {policy.advanceBookingDays} days in advance
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Hotel Policy */}
      <Card glass style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(5,150,105,0.1)' }}>
            <Hotel size={18} style={{ color: '#059669' }} />
          </div>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>Hotel Rules</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Max Nightly Rate
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--text-primary)' }}>
              ${policy.maxHotelNightlyRate?.toLocaleString() || 'Unlimited'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Per night, per room — above this requires approval
            </div>
          </div>
        </div>
      </Card>

      {/* Approval Settings */}
      <Card glass style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,0.1)' }}>
            <Users size={18} style={{ color: '#f59e0b' }} />
          </div>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>Approval Rules</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Approval Threshold
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--text-primary)' }}>
              ${policy.approvalThreshold?.toLocaleString() || '0'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Bookings above this amount require manager approval
            </div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Approval Required For
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.4rem' }}>
              {[
                { label: 'Out-of-policy fares', value: true },
                { label: 'Business class upgrades', value: policy.allowedCabinClasses?.includes('BUSINESS') === false },
                { label: 'First class', value: policy.allowedCabinClasses?.includes('FIRST') === false },
                { label: 'Hotel rate overrides', value: true },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '11px' }}>
                  {item.value
                    ? <AlertTriangle size={12} style={{ color: '#f59e0b' }} />
                    : <CheckCircle2 size={12} style={{ color: '#16a34a' }} />}
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
