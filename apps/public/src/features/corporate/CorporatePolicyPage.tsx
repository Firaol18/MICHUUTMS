import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { corporateService, type ApiTravelPolicy } from '@tms/shared/services/corporateService';
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
  const [policy, setPolicy] = useState<ApiTravelPolicy | null>(null);
  const [loading, setLoading] = useState(true);

  const rawCompanyId = user?.companyId || 'comp-1';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadPolicy = async () => {
      try {
        let cid = rawCompanyId;
        const compList = await corporateService.getCompanies({ limit: 50 });
        const matched = compList.items.find((c) => c.id === rawCompanyId || c.name === user?.companyName) || compList.items[0];
        if (matched) cid = matched.id;

        if (cid) {
          const res = await corporateService.getPolicies(cid, { isActive: true, limit: 10 });
          const def = res.items.find((p) => p.isDefault) || res.items[0];
          if (isMounted) setPolicy(def || null);
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPolicy();
    return () => { isMounted = false; };
  }, [rawCompanyId, user?.companyName]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading travel policy...</div>;
  }

  if (!policy) {
    return (
      <Card glass style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertTriangle size={32} style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
        <h2 style={{ fontWeight: 800 }}>No Travel Policy Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>Your company does not yet have an active travel policy configured. Please contact your Corporate Admin.</p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, margin: 0 }}>Travel Policy & Compliance Rules</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.3rem' }}>
            {policy.name} · Effective Policy
          </p>
        </div>
        <Badge variant="success" icon={<ShieldCheck size={13} />}>Active Policy</Badge>
      </div>

      {/* Rules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <Card glass style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '8px', backgroundColor: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>Trip Budget Cap</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max expenditure per corporate itinerary</div>
            </div>
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--text-primary)' }}>
            ${policy.maxBudgetPerTrip?.toLocaleString() ?? 'No Limit'}
          </div>
        </Card>

        <Card glass style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '8px', backgroundColor: 'rgba(5,150,105,0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plane size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>Allowed Cabin Classes</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pre-approved flight seat types</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {policy.allowedClasses && policy.allowedClasses.length > 0 ? (
              policy.allowedClasses.map((cls) => (
                <span key={cls} style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'rgba(37,99,235,0.1)', color: '#2563eb', fontWeight: 700, fontSize: '12px' }}>
                  {cls.replace('_', ' ')}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>All classes allowed</span>
            )}
          </div>
        </Card>

        <Card glass style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '8px', backgroundColor: 'rgba(234,88,12,0.1)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>Approval Chain</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Multi-tier clearance workflow</div>
            </div>
          </div>
          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 900, color: 'var(--text-primary)' }}>
            {policy.approvalSteps?.length ? `${policy.approvalSteps.length}-Level Review` : 'Auto-Approved'}
          </div>
        </Card>
      </div>

      {policy.description && (
        <Card glass style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Policy Overview</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {policy.description}
          </p>
        </Card>
      )}
    </div>
  );
};
