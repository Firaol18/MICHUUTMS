import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, login } = useAuthStore();

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState('+251 91 123 4567');
  const [profileNationality, setProfileNationality] = useState('Ethiopia');
  const [preferredCurrency, setPreferredCurrency] = useState('ETB (Br) / USD ($)');
  const [emergencyContact, setEmergencyContact] = useState('Abebe Vance (+251 911 223344)');
  const [dietaryPref, setDietaryPref] = useState('Vegetarian / Fasting Options');
  const [profileSaveMessage, setProfileSaveMessage] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      login({ ...user, name: profileName, email: profileEmail }, 'updated-jwt-token');
      setProfileSaveMessage(true);
      setTimeout(() => setProfileSaveMessage(false), 3000);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        👤 Profile & Settings
      </h2>

      <Card glass style={{ maxWidth: '700px', padding: '2rem' }}>
        {profileSaveMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(22,163,74,0.1)',
              color: '#16a34a',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={16} /> Profile settings updated successfully!
          </div>
        )}

        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Full Name"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Email Address"
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              required
            />
            <Input
              label="Mobile / Telebirr Phone"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Nationality / Passport Country"
              value={profileNationality}
              onChange={(e) => setProfileNationality(e.target.value)}
              required
            />
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Preferred Display Currency
              </label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="ETB (Br) / USD ($)">ETB (Br) / USD ($)</option>
                <option value="USD ($)">USD ($) Only</option>
                <option value="EUR (€)">EUR (€) Only</option>
              </select>
            </div>
          </div>

          <Input
            label="Emergency Contact (Name & Phone)"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
          />
          <Input
            label="Dietary / Medical Accessibility Notes"
            value={dietaryPref}
            onChange={(e) => setDietaryPref(e.target.value)}
          />

          <Button type="submit" variant="primary" size="lg" icon={<CheckCircle2 size={18} />}>
            Save Profile Changes
          </Button>
        </form>
      </Card>
    </div>
  );
};
