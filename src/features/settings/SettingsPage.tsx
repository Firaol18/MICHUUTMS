import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { User, Shield, Bell, Save, Moon, Sun } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [email, setEmail] = useState(user?.email || 'alex.m@tmslogistics.com');
  const [department, setDepartment] = useState(user?.department || 'Operations & Logistics');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div>
      <PageHeader
        title="System Settings"
        description="Configure account preferences, operational dispatch parameters, and API credentials."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Navigation Panel */}
        <Card glass style={{ height: 'fit-content', padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--brand-primary-light)',
                color: 'var(--brand-primary)',
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <User size={18} /> Profile & Department
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
              }}
            >
              <Shield size={18} /> Roles & Security
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
              }}
            >
              <Bell size={18} /> Route Alerts
            </div>
          </div>
        </Card>

        {/* Profile Settings Content */}
        <Card glass>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '1.25rem' }}>
            User Account & Department Profile
          </h3>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Official Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Department Division" value={department} onChange={(e) => setDepartment(e.target.value)} />

            {/* Theme Preference Toggle */}
            <div className="flex-between" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Interface Color Theme</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Currently set to {theme.toUpperCase()} mode</div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={toggleTheme} icon={theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}>
                Toggle Theme
              </Button>
            </div>

            <div className="flex-between" style={{ marginTop: '1rem' }}>
              {isSaved ? (
                <span style={{ color: 'var(--status-success)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                  ✓ Settings saved successfully
                </span>
              ) : <div />}

              <Button type="submit" variant="primary" icon={<Save size={16} />}>
                Save Settings
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
