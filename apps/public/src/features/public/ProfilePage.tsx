import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { userService } from '@tms/shared/services/userService';
import { getUserAvatarUrl } from '@tms/shared/utils/avatar';
import type { LoyaltyTier } from '@tms/shared/types/customer';
import { getLoyaltyTier, getNextTierThreshold, LOYALTY_META } from '@tms/shared/types/customer';
import {
  CheckCircle2,
  User,
  Plane,
  Heart,
  Award,
  Lock,
  Camera,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  avatarUrl: string;
  passportType: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
  ecName: string;
  ecRelationship: string;
  ecPhone: string;
  ecEmail: string;
  dietaryNeeds: string;
  languages: string;
  accessibility: string;
  preferredCurrency: string;
  accommodation: string;
  tourTypes: string[];
  completedTripsCount: number;
}

const TOUR_TYPE_OPTIONS = [
  'Safari & Wildlife',
  'Cultural & Heritage',
  'Mountain Trekking',
  'Beach & Coast',
  'Luxury & Spa',
  'Adventure & Extreme',
  'Historical Sites',
  'Eco & Nature',
];

const TAB_STYLE = (active: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.25rem',
  borderBottom: active ? '2px solid var(--brand-primary)' : '2px solid transparent',
  fontWeight: active ? 700 : 500,
  cursor: 'pointer',
  fontSize: 'var(--font-size-sm)',
  color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
  backgroundColor: 'transparent',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
});

export const ProfilePage: React.FC = () => {
  const { user, login, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'personal' | 'documents' | 'preferences' | 'security' | 'loyalty'>('personal');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nationality: user?.nationality || 'Ethiopia',
    avatarUrl: user?.avatarUrl || '',
    passportType: user?.passportType || 'passport',
    passportNumber: user?.passportNumber || '',
    passportCountry: user?.passportCountry || '',
    passportExpiry: user?.passportExpiry || '',
    ecName: user?.ecName || '',
    ecRelationship: user?.ecRelationship || '',
    ecPhone: user?.ecPhone || '',
    ecEmail: user?.ecEmail || '',
    dietaryNeeds: user?.dietaryNeeds || 'Vegetarian / Fasting Options',
    languages: user?.languages || 'English, Amharic',
    accessibility: user?.accessibility || '',
    preferredCurrency: user?.preferredCurrency || 'USD ($)',
    accommodation: user?.accommodation || 'Luxury Lodge',
    tourTypes: user?.tourTypes || ['Cultural & Heritage'],
    completedTripsCount: user?.completedTripsCount || 0,
  });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ success?: string; error?: string } | null>(null);

  // Fetch live profile from backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile({
          userId: user?.id,
          email: user?.email,
        });
        if (isMounted && data) {
          setProfile({
            name: data.name || user?.name || '',
            email: data.email || user?.email || '',
            phone: data.phone || user?.phone || '',
            nationality: data.nationality || user?.nationality || 'Ethiopia',
            avatarUrl: data.avatarUrl || user?.avatarUrl || '',
            passportType: data.passportType || user?.passportType || 'passport',
            passportNumber: data.passportNumber || user?.passportNumber || '',
            passportCountry: data.passportCountry || user?.passportCountry || '',
            passportExpiry: data.passportExpiry || user?.passportExpiry || '',
            ecName: data.ecName || user?.ecName || '',
            ecRelationship: data.ecRelationship || user?.ecRelationship || '',
            ecPhone: data.ecPhone || user?.ecPhone || '',
            ecEmail: data.ecEmail || user?.ecEmail || '',
            dietaryNeeds: data.dietaryNeeds || user?.dietaryNeeds || 'Vegetarian / Fasting Options',
            languages: data.languages || user?.languages || 'English, Amharic',
            accessibility: data.accessibility || user?.accessibility || '',
            preferredCurrency: data.preferredCurrency || user?.preferredCurrency || 'USD ($)',
            accommodation: data.accommodation || user?.accommodation || 'Luxury Lodge',
            tourTypes: Array.isArray(data.tourTypes) ? data.tourTypes : (data.tourTypes ? String(data.tourTypes).split(',') : (user?.tourTypes || ['Cultural & Heritage'])),
            completedTripsCount: data.completedTripsCount ?? user?.completedTripsCount ?? 0,
          });

          // Sync auth store
          if (user && token) {
            login({ ...user, ...data }, token);
          }
        }
      } catch (err: any) {
        console.warn('Could not fetch backend profile, using local state:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email]);

  const update = (key: keyof ProfileData, value: string | string[]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  // Handle avatar photo selection with automatic compression
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Avatar image size must be less than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          update('avatarUrl', compressedDataUrl);
        } else {
          update('avatarUrl', event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Submit Profile Changes to Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(null);
    setErrorMessage(null);

    try {
      const updatedUser = await userService.updateProfile({
        userId: user?.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        nationality: profile.nationality,
        avatarUrl: profile.avatarUrl,
        passportType: profile.passportType,
        passportNumber: profile.passportNumber,
        passportCountry: profile.passportCountry,
        passportExpiry: profile.passportExpiry,
        ecName: profile.ecName,
        ecRelationship: profile.ecRelationship,
        ecPhone: profile.ecPhone,
        ecEmail: profile.ecEmail,
        dietaryNeeds: profile.dietaryNeeds,
        languages: profile.languages,
        accessibility: profile.accessibility,
        preferredCurrency: profile.preferredCurrency,
        accommodation: profile.accommodation,
        tourTypes: profile.tourTypes,
      });

      if (user && token) {
        login({ ...user, ...updatedUser }, token);
      }

      setSavedMessage('Profile settings saved successfully to your account!');
      setTimeout(() => setSavedMessage(null), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save profile. Please try again.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  // Change Password Submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 6) {
      setPasswordStatus({ error: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ error: 'New password and confirm password do not match.' });
      return;
    }

    try {
      setPasswordLoading(true);
      await userService.changePassword(currentPassword, newPassword, {
        userId: user?.id,
        email: user?.email,
      });
      setPasswordStatus({ success: 'Your password has been updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid current password or update failed.';
      setPasswordStatus({ error: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleTourType = (type: string) => {
    setProfile((p) => ({
      ...p,
      tourTypes: p.tourTypes.includes(type)
        ? p.tourTypes.filter((t) => t !== type)
        : [...p.tourTypes, type],
    }));
  };

  // Derive loyalty from real completed bookings count
  const tripsCount = profile.completedTripsCount;
  const loyaltyTier: LoyaltyTier = getLoyaltyTier(tripsCount);
  const loyaltyMeta = LOYALTY_META[loyaltyTier];
  const nextThreshold = getNextTierThreshold(loyaltyTier);
  const loyaltyPct = Math.min(100, (tripsCount / nextThreshold) * 100);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', gap: '1rem' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Loading your verified traveler profile...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            👤 Profile & Account Settings
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage your personal data, travel passports, expedition preferences, and account security.
          </p>
        </div>

        {/* Quick Loyalty Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: loyaltyMeta.bg,
            border: `1px solid ${loyaltyMeta.color}50`,
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>{loyaltyMeta.emoji}</span>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: loyaltyMeta.color }}>
            {loyaltyMeta.label} ({tripsCount} Trip{tripsCount !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      <Card glass style={{ maxWidth: '820px' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { key: 'personal', label: 'Personal Info', icon: <User size={14} /> },
            { key: 'documents', label: 'Travel Documents', icon: <Plane size={14} /> },
            { key: 'preferences', label: 'Travel Preferences', icon: <Heart size={14} /> },
            { key: 'security', label: 'Security & Password', icon: <Lock size={14} /> },
            { key: 'loyalty', label: 'Loyalty Tier', icon: <Award size={14} /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key as typeof activeTab);
                setSavedMessage(null);
                setErrorMessage(null);
              }}
              style={TAB_STYLE(activeTab === t.key)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Success Banner */}
          {savedMessage && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(22,163,74,0.12)',
                border: '1px solid rgba(22,163,74,0.3)',
                color: '#16a34a',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <CheckCircle2 size={18} />
              {savedMessage}
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#dc2626',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <AlertCircle size={18} />
              {errorMessage}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              FORM FOR PERSONAL / DOCUMENTS / PREFERENCES
          ══════════════════════════════════════════════════ */}
          {activeTab !== 'security' && activeTab !== 'loyalty' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* TAB 1: PERSONAL INFO */}
              {activeTab === 'personal' && (
                <>
                  {/* Avatar Upload */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={getUserAvatarUrl(profile)}
                        alt={profile.name}
                        style={{
                          width: 84,
                          height: 84,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid var(--brand-primary)',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: 'var(--brand-primary)',
                          color: '#fff',
                          border: '2px solid var(--bg-secondary)',
                          borderRadius: '50%',
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        title="Upload Avatar"
                      >
                        <Camera size={14} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                      />
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>
                        {profile.name || 'Traveler'}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        {profile.email}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={<Camera size={14} />}
                        onClick={() => fileInputRef.current?.click()}
                        style={{ marginTop: '0.5rem' }}
                      >
                        Change Photo
                      </Button>
                    </div>
                  </div>

                  <Input
                    label="Full Name *"
                    value={profile.name}
                    onChange={(e) => update('name', e.target.value)}
                    required
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                      label="Email Address *"
                      type="email"
                      value={profile.email}
                      onChange={(e) => update('email', e.target.value)}
                      required
                    />
                    <Input
                      label="Mobile / Phone"
                      value={profile.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="+251 91 123 4567"
                    />
                  </div>

                  <Input
                    label="Nationality / Country of Residence"
                    value={profile.nationality}
                    onChange={(e) => update('nationality', e.target.value)}
                    placeholder="e.g. Ethiopia, United States, Germany"
                  />

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                      🚨 Emergency Contact Information
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Contact Name"
                        value={profile.ecName}
                        onChange={(e) => update('ecName', e.target.value)}
                        placeholder="e.g. Jane Doe"
                      />
                      <Input
                        label="Relationship"
                        value={profile.ecRelationship}
                        onChange={(e) => update('ecRelationship', e.target.value)}
                        placeholder="e.g. Spouse, Parent, Brother"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                      <Input
                        label="Emergency Phone"
                        value={profile.ecPhone}
                        onChange={(e) => update('ecPhone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                      <Input
                        label="Emergency Email (optional)"
                        type="email"
                        value={profile.ecEmail}
                        onChange={(e) => update('ecEmail', e.target.value)}
                        placeholder="emergency@example.com"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: TRAVEL DOCUMENTS */}
              {activeTab === 'documents' && (
                <>
                  <div style={{ padding: '0.875rem 1rem', backgroundColor: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldCheck size={18} />
                    <span>Your document details are securely encrypted and used only for flight, lodge booking, and park permit verification.</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="tms-input-group">
                      <label className="tms-input-label">Document Type</label>
                      <select
                        className="tms-input"
                        value={profile.passportType}
                        onChange={(e) => update('passportType', e.target.value)}
                      >
                        <option value="passport">International Passport</option>
                        <option value="national_id">National ID / Kebele Card</option>
                        <option value="driver_license">Driver's License</option>
                        <option value="other">Other Official Document</option>
                      </select>
                    </div>
                    <Input
                      label="Document Number"
                      value={profile.passportNumber}
                      onChange={(e) => update('passportNumber', e.target.value)}
                      placeholder="e.g. EP12345678"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <Input
                      label="Issuing Country"
                      value={profile.passportCountry}
                      onChange={(e) => update('passportCountry', e.target.value)}
                      placeholder="e.g. Ethiopia"
                    />
                    <Input
                      label="Nationality on Document"
                      value={profile.nationality}
                      onChange={(e) => update('nationality', e.target.value)}
                    />
                    <Input
                      label="Expiry Date"
                      type="date"
                      value={profile.passportExpiry}
                      onChange={(e) => update('passportExpiry', e.target.value)}
                    />
                  </div>

                  {profile.passportExpiry && new Date(profile.passportExpiry) < new Date(Date.now() + 6 * 30 * 24 * 3600 * 1000) && (
                    <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: '#dc2626', fontWeight: 600 }}>
                      ⚠ Warning: Your travel document expires within 6 months. Many destinations and flight operators require at least 6 months validity.
                    </div>
                  )}
                </>
              )}

              {/* TAB 3: PREFERENCES */}
              {activeTab === 'preferences' && (
                <>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.625rem', color: 'var(--text-primary)' }}>
                      Preferred Expedition & Tour Types
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {TOUR_TYPE_OPTIONS.map((type) => {
                        const selected = profile.tourTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleTourType(type)}
                            style={{
                              padding: '0.4rem 0.9rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: `1px solid ${selected ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                              backgroundColor: selected ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                              color: selected ? 'var(--brand-primary)' : 'var(--text-secondary)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                      label="Dietary / Medical Notes"
                      value={profile.dietaryNeeds}
                      onChange={(e) => update('dietaryNeeds', e.target.value)}
                      placeholder="e.g. Halal, Vegan, Fasting (Tsom), Gluten-Free"
                    />
                    <Input
                      label="Languages Spoken"
                      value={profile.languages}
                      onChange={(e) => update('languages', e.target.value)}
                      placeholder="e.g. English, Amharic, Oromo, French"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                      label="Accessibility Requirements"
                      value={profile.accessibility}
                      onChange={(e) => update('accessibility', e.target.value)}
                      placeholder="e.g. Wheelchair ramp, Low step vehicle"
                    />
                    <Input
                      label="Preferred Accommodation Type"
                      value={profile.accommodation}
                      onChange={(e) => update('accommodation', e.target.value)}
                      placeholder="e.g. 5-Star Hotel, Eco-Lodge, Camping Tent"
                    />
                  </div>

                  <div className="tms-input-group">
                    <label className="tms-input-label">Preferred Display Currency</label>
                    <select
                      className="tms-input"
                      value={profile.preferredCurrency}
                      onChange={(e) => update('preferredCurrency', e.target.value)}
                    >
                      <option value="USD ($)">USD ($)</option>
                      <option value="EUR (€)">EUR (€)</option>
                      <option value="GBP (£)">GBP (£)</option>
                      <option value="ETB (Br)">ETB (Ethiopian Birr)</option>
                    </select>
                  </div>
                </>
              )}

              {/* SUBMIT BUTTON */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={saving}
                  icon={<CheckCircle2 size={18} />}
                  style={{ minWidth: '220px' }}
                >
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════
              TAB 4: SECURITY & CHANGE PASSWORD
          ══════════════════════════════════════════════════ */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '520px' }}>
              <div style={{ padding: '0.875rem 1rem', backgroundColor: 'rgba(37,99,235,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37,99,235,0.2)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                🔒 Ensure your account uses a strong password with at least 6 characters to keep your booking vouchers secure.
              </div>

              {passwordStatus?.success && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(22,163,74,0.12)', color: '#16a34a', fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} /> {passwordStatus.success}
                </div>
              )}

              {passwordStatus?.error && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239,68,68,0.12)', color: '#dc2626', fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} /> {passwordStatus.error}
                </div>
              )}

              <Input
                label="Current Password *"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />

              <Input
                label="New Password *"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                required
              />

              <Input
                label="Confirm New Password *"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                required
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={passwordLoading}
                icon={<Lock size={16} />}
                style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
              >
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>
          )}

          {/* ══════════════════════════════════════════════════
              TAB 5: REAL LOYALTY TIER
          ══════════════════════════════════════════════════ */}
          {activeTab === 'loyalty' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  textAlign: 'center',
                  padding: '2.5rem 1.5rem',
                  backgroundColor: loyaltyMeta.bg,
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${loyaltyMeta.color}40`,
                }}
              >
                <div style={{ fontSize: 56, marginBottom: '0.5rem' }}>{loyaltyMeta.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-2xl)', color: loyaltyMeta.color }}>
                  {loyaltyMeta.label}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.375rem' }}>
                  <strong>{tripsCount}</strong> total completed trip{tripsCount !== 1 ? 's' : ''} recorded in database
                </div>
              </div>

              {loyaltyTier !== 'platinum' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <span>Progress to next tier</span>
                    <span style={{ fontWeight: 700 }}>
                      {tripsCount} / {nextThreshold} trips
                    </span>
                  </div>
                  <div style={{ height: 10, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${loyaltyPct}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${loyaltyMeta.color}, ${loyaltyMeta.color}aa)`,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                    {nextThreshold - tripsCount} more trip{nextThreshold - tripsCount !== 1 ? 's' : ''} to reach the next tier!
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '0.875rem', color: 'var(--text-primary)' }}>
                  Your Current Tier Benefits
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {loyaltyMeta.benefits.map((benefit) => (
                    <div
                      key={benefit}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <CheckCircle2 size={16} style={{ color: loyaltyMeta.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '0.875rem', color: 'var(--text-primary)' }}>
                  All Michuu Loyalty Tiers
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                  {(Object.entries(LOYALTY_META) as [LoyaltyTier, typeof LOYALTY_META[LoyaltyTier]][]).map(([tier, meta]) => (
                    <div
                      key={tier}
                      style={{
                        padding: '1rem 0.75rem',
                        backgroundColor: loyaltyTier === tier ? meta.bg : 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${loyaltyTier === tier ? meta.color : 'var(--border-color)'}`,
                        textAlign: 'center',
                        opacity: loyaltyTier === tier ? 1 : 0.6,
                      }}
                    >
                      <div style={{ fontSize: 26 }}>{meta.emoji}</div>
                      <div style={{ fontWeight: 700, fontSize: 12, color: loyaltyTier === tier ? meta.color : 'var(--text-muted)', marginTop: '0.35rem' }}>
                        {tier.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
