import React, { useState } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import type { LoyaltyTier } from '@tms/shared/types/customer';
import { getLoyaltyTier, getNextTierThreshold, LOYALTY_META } from '@tms/shared/types/customer';
import { CheckCircle2, User, Plane, Heart, Award } from 'lucide-react';

const STORAGE_KEY = 'michuu_profile_v2';

interface ProfileData {
  name: string; email: string; phone: string; nationality: string;
  passportType: string; passportNumber: string; passportCountry: string; passportExpiry: string;
  ecName: string; ecRelationship: string; ecPhone: string; ecEmail: string;
  dietaryNeeds: string; languages: string; accessibility: string;
  preferredCurrency: string; accommodation: string;
  tourTypes: string[];
}

const TOUR_TYPE_OPTIONS = ['Safari & Wildlife', 'Cultural & Heritage', 'Mountain Trekking', 'Beach & Coast', 'Luxury & Spa', 'Adventure & Extreme', 'Historical Sites', 'Eco & Nature'];

function loadProfile(user: { name: string; email: string } | null): ProfileData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    name: user?.name || '', email: user?.email || '', phone: '+251 91 123 4567', nationality: 'Ethiopia',
    passportType: 'passport', passportNumber: '', passportCountry: '', passportExpiry: '',
    ecName: '', ecRelationship: '', ecPhone: '', ecEmail: '',
    dietaryNeeds: 'Vegetarian / Fasting Options', languages: 'English, Amharic',
    accessibility: '', preferredCurrency: 'USD ($)', accommodation: 'Luxury Lodge',
    tourTypes: ['Cultural & Heritage'],
  };
}

function saveProfile(data: ProfileData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

const TAB_STYLE = (active: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.75rem 1.25rem', borderBottom: active ? '2px solid var(--brand-primary)' : '2px solid transparent',
  fontWeight: active ? 700 : 500, cursor: 'pointer', fontSize: 'var(--font-size-sm)',
  color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
  backgroundColor: 'transparent', transition: 'all 0.15s', whiteSpace: 'nowrap',
});

export const ProfilePage: React.FC = () => {
  const { user, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'personal' | 'documents' | 'preferences' | 'loyalty'>('personal');
  const [profile, setProfile] = useState<ProfileData>(() => loadProfile(user));
  const [saved, setSaved] = useState(false);

  const update = (key: keyof ProfileData, value: string | string[]) => setProfile((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(profile);
    if (user) login({ ...user, name: profile.name, email: profile.email }, 'updated-token');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleTourType = (type: string) => {
    setProfile((p) => ({
      ...p,
      tourTypes: p.tourTypes.includes(type) ? p.tourTypes.filter((t) => t !== type) : [...p.tourTypes, type],
    }));
  };

  // Derive loyalty from a mock booking count stored in profile data or default to 1
  const mockBookingCount = 4;
  const loyaltyTier: LoyaltyTier = getLoyaltyTier(mockBookingCount);
  const loyaltyMeta = LOYALTY_META[loyaltyTier];
  const nextThreshold = getNextTierThreshold(loyaltyTier);
  const loyaltyPct = Math.min(100, (mockBookingCount / nextThreshold) * 100);

  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        👤 Profile & Settings
      </h2>

      <Card glass style={{ maxWidth: '780px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
          {[
            { key: 'personal', label: 'Personal Info', icon: <User size={14} /> },
            { key: 'documents', label: 'Travel Documents', icon: <Plane size={14} /> },
            { key: 'preferences', label: 'Preferences', icon: <Heart size={14} /> },
            { key: 'loyalty', label: 'Loyalty', icon: <Award size={14} /> },
          ].map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key as typeof activeTab)} style={TAB_STYLE(activeTab === t.key)}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '2rem' }}>
          {saved && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} /> Profile settings saved successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* PERSONAL INFO */}
            {activeTab === 'personal' && (
              <>
                <Input label="Full Name *" value={profile.name} onChange={(e) => update('name', e.target.value)} required />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input label="Email Address *" type="email" value={profile.email} onChange={(e) => update('email', e.target.value)} required />
                  <Input label="Mobile / Phone" value={profile.phone} onChange={(e) => update('phone', e.target.value)} />
                </div>
                <Input label="Nationality / Passport Country" value={profile.nationality} onChange={(e) => update('nationality', e.target.value)} />

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🚨 Emergency Contact
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input label="Contact Name" value={profile.ecName} onChange={(e) => update('ecName', e.target.value)} placeholder="e.g. Jane Doe" />
                    <Input label="Relationship" value={profile.ecRelationship} onChange={(e) => update('ecRelationship', e.target.value)} placeholder="e.g. Spouse, Parent" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <Input label="Phone" value={profile.ecPhone} onChange={(e) => update('ecPhone', e.target.value)} placeholder="+1 (555) 000-0000" />
                    <Input label="Email (optional)" type="email" value={profile.ecEmail} onChange={(e) => update('ecEmail', e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {/* TRAVEL DOCUMENTS */}
            {activeTab === 'documents' && (
              <>
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: '#1d4ed8' }}>
                  🔒 Your document information is stored securely and used only for travel processing purposes.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="tms-input-group">
                    <label className="tms-input-label">Document Type</label>
                    <select className="tms-input" value={profile.passportType} onChange={(e) => update('passportType', e.target.value)}>
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID</option>
                      <option value="other">Other Travel Document</option>
                    </select>
                  </div>
                  <Input label="Document Number" value={profile.passportNumber} onChange={(e) => update('passportNumber', e.target.value)} placeholder="e.g. A12345678" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <Input label="Issuing Country" value={profile.passportCountry} onChange={(e) => update('passportCountry', e.target.value)} placeholder="e.g. Ethiopia" />
                  <Input label="Nationality on Document" value={profile.nationality} onChange={(e) => update('nationality', e.target.value)} />
                  <Input label="Expiry Date" type="date" value={profile.passportExpiry} onChange={(e) => update('passportExpiry', e.target.value)} />
                </div>
                {profile.passportExpiry && new Date(profile.passportExpiry) < new Date(Date.now() + 6 * 30 * 24 * 3600 * 1000) && (
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: '#dc2626', fontWeight: 600 }}>
                    ⚠ Your travel document expires within 6 months. Please renew it before booking international travel.
                  </div>
                )}
              </>
            )}

            {/* PREFERENCES */}
            {activeTab === 'preferences' && (
              <>
                <div>
                  <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.625rem' }}>Preferred Tour Types</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {TOUR_TYPE_OPTIONS.map((type) => {
                      const selected = profile.tourTypes.includes(type);
                      return (
                        <button key={type} type="button" onClick={() => toggleTourType(type)}
                          style={{ padding: '0.35rem 0.875rem', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: 'pointer', border: `1px solid ${selected ? 'var(--brand-primary)' : 'var(--border-color)'}`, backgroundColor: selected ? 'var(--brand-primary-light)' : 'var(--bg-secondary)', color: selected ? 'var(--brand-primary)' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input label="Dietary / Medical Notes" value={profile.dietaryNeeds} onChange={(e) => update('dietaryNeeds', e.target.value)} placeholder="e.g. Vegetarian, Halal, No nuts" />
                  <Input label="Languages Spoken" value={profile.languages} onChange={(e) => update('languages', e.target.value)} placeholder="e.g. English, Amharic, French" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input label="Accessibility Requirements" value={profile.accessibility} onChange={(e) => update('accessibility', e.target.value)} placeholder="e.g. Wheelchair access required" />
                  <Input label="Preferred Accommodation" value={profile.accommodation} onChange={(e) => update('accommodation', e.target.value)} placeholder="e.g. Luxury Lodge, Camping" />
                </div>
                <div className="tms-input-group">
                  <label className="tms-input-label">Preferred Display Currency</label>
                  <select className="tms-input" value={profile.preferredCurrency} onChange={(e) => update('preferredCurrency', e.target.value)}>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="ETB (Br)">ETB (Birr)</option>
                  </select>
                </div>
              </>
            )}

            {/* LOYALTY */}
            {activeTab === 'loyalty' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: loyaltyMeta.bg, borderRadius: 'var(--radius-md)', border: `1px solid ${loyaltyMeta.color}40` }}>
                  <div style={{ fontSize: 52, marginBottom: '0.5rem' }}>{loyaltyMeta.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: 'var(--font-size-2xl)', color: loyaltyMeta.color }}>{loyaltyMeta.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: '0.375rem' }}>
                    {mockBookingCount} trips completed
                  </div>
                </div>

                {loyaltyTier !== 'platinum' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      <span>Progress to next tier</span>
                      <span style={{ fontWeight: 700 }}>{mockBookingCount} / {nextThreshold} trips</span>
                    </div>
                    <div style={{ height: 10, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: `${loyaltyPct}%`, height: '100%', background: `linear-gradient(90deg, ${loyaltyMeta.color}, ${loyaltyMeta.color}aa)`, borderRadius: 'var(--radius-full)', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                      {nextThreshold - mockBookingCount} more trip{nextThreshold - mockBookingCount !== 1 ? 's' : ''} to reach the next tier
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '0.875rem' }}>Your Current Benefits</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {loyaltyMeta.benefits.map((benefit) => (
                      <div key={benefit} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <CheckCircle2 size={16} style={{ color: loyaltyMeta.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 'var(--font-size-sm)' }}>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '0.875rem' }}>All Loyalty Tiers</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem' }}>
                    {(Object.entries(LOYALTY_META) as [LoyaltyTier, typeof LOYALTY_META[LoyaltyTier]][]).map(([tier, meta]) => (
                      <div key={tier} style={{ padding: '0.875rem', backgroundColor: loyaltyTier === tier ? meta.bg : 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: `1px solid ${loyaltyTier === tier ? meta.color : 'var(--border-color)'}`, textAlign: 'center', opacity: loyaltyTier === tier ? 1 : 0.6 }}>
                        <div style={{ fontSize: 24 }}>{meta.emoji}</div>
                        <div style={{ fontWeight: 700, fontSize: 11, color: loyaltyTier === tier ? meta.color : 'var(--text-muted)', marginTop: '0.25rem' }}>{tier.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Save button — not shown on loyalty tab (read-only) */}
            {activeTab !== 'loyalty' && (
              <Button type="submit" variant="primary" size="lg" icon={<CheckCircle2 size={18} />} style={{ marginTop: '0.5rem' }}>
                Save Profile Changes
              </Button>
            )}
          </form>
        </div>
      </Card>
    </div>
  );
};
