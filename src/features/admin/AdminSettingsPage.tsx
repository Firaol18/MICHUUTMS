import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ROLE_DEFINITIONS } from '@/utils/permissions';
import { http } from '@/services/http';
import { Save } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [agencyName, setAgencyName] = useState('MICHUU Tourism & Travel Management');
  const [contactEmail, setContactEmail] = useState('concierge@michuutours.et');
  const [currency, setCurrency] = useState('ETB (Br) / USD ($)');
  const [depositPercent, setDepositPercent] = useState(25);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    http.get('/agency-settings')
      .then((res) => {
        if (res.data) {
          if (res.data.agencyName) setAgencyName(res.data.agencyName);
          if (res.data.contactEmail) setContactEmail(res.data.contactEmail);
          if (res.data.currency) setCurrency(res.data.currency);
          if (res.data.depositPercent) setDepositPercent(res.data.depositPercent);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await http.patch('/agency-settings', {
        agencyName,
        contactEmail,
        currency,
        depositPercent,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save settings to backend:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Tourism Agency Settings & RBAC Policy"
        description="Manage business parameter defaults, multi-currency display, reservation deposit rules, and system RBAC."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Navigation / Information Card */}
        <Card glass style={{ height: 'fit-content', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Tourism RBAC Matrix</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
            {Object.values(ROLE_DEFINITIONS).map((def) => (
              <div key={def.role} style={{ padding: '0.625rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{def.label} ({def.role})</div>
                <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>{def.description}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Business Settings Form */}
        <Card glass>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '1.25rem' }}>
            Agency General Parameters
          </h3>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input label="Agency Business Name" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} required />
            <Input label="Concierge Support Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Default Display Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} required />
              <Input label="Reservation Deposit (%)" type="number" value={depositPercent} onChange={(e) => setDepositPercent(Number(e.target.value))} required />
            </div>

            <div className="flex-between" style={{ marginTop: '1rem' }}>
              {isSaved ? (
                <span style={{ color: 'var(--status-success)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                  ✓ Tourism settings saved successfully
                </span>
              ) : <div />}

              <Button type="submit" variant="primary" icon={<Save size={16} />} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Business Parameters'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
