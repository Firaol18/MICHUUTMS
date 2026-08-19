import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Card } from '@tms/shared/components/common/Card';
import { Input } from '@tms/shared/components/common/Input';
import { Button } from '@tms/shared/components/common/Button';
import type { Role } from '@tms/shared/types/rbac';
import { Compass, Lock, Mail, User as UserIcon, ArrowRight, Phone } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('eleanor.vance@example.com');
  const [phone, setPhone] = useState('+251 91 123 4567');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLoginSuccess = (userDisplayName: string, userEmail: string, _userPhone: string, isAdminUser: boolean) => {
    const detectedRole: Role = isAdminUser ? 'admin' : 'tourist';

    login(
      {
        id: `usr-${Date.now()}`,
        name: userDisplayName,
        email: userEmail,
        role: detectedRole,
        department: isAdminUser ? 'Tourism Operations' : 'Traveler Member',
        avatarUrl: isAdminUser
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      },
      'jwt-token-tourism-2026'
    );

    if (detectedRole === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.toLowerCase().trim();
      const isAdminUser = cleanEmail.includes('admin') || cleanEmail.includes('operator');
      const userDisplayName = name.trim() || (isAdminUser ? 'Alex Morgan' : 'Eleanor Vance');

      handleLoginSuccess(userDisplayName, cleanEmail, phone, isAdminUser);
      setIsLoading(false);
    }, 500);
  };

  const handleSocialAuth = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      handleLoginSuccess(`Eleanor Vance (${provider})`, `eleanor.${provider.toLowerCase()}@example.com`, '+251 91 999 8888', false);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div
      className="flex-center"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        padding: '1.5rem',
        background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.1), transparent 50%), radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.08), transparent 50%)',
      }}
    >
      <Card
        glass
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {/* Header */}
        <div className="flex-center" style={{ flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div
            className="flex-center text-gradient"
            style={{
              width: 54,
              height: 54,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-primary-light)',
              marginBottom: '0.5rem',
            }}
          >
            <Compass size={32} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            MICHUU <span style={{ color: 'var(--brand-primary)' }}>TMS</span>
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Ethiopia's Premier Tourism & Travel Management System
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--bg-tertiary)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('signin')}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: mode === 'signin' ? 700 : 500,
              backgroundColor: mode === 'signin' ? 'var(--bg-secondary)' : 'transparent',
              color: mode === 'signin' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: mode === 'signup' ? 700 : 500,
              backgroundColor: mode === 'signup' ? 'var(--bg-secondary)' : 'transparent',
              color: mode === 'signup' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Auth Sub-method: Email vs Phone */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            style={{
              fontSize: '11px',
              fontWeight: authMethod === 'email' ? 700 : 500,
              color: authMethod === 'email' ? 'var(--brand-primary)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Mail size={12} /> Email Auth
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>|</span>
          <button
            type="button"
            onClick={() => setAuthMethod('phone')}
            style={{
              fontSize: '11px',
              fontWeight: authMethod === 'phone' ? 700 : 500,
              color: authMethod === 'phone' ? 'var(--brand-primary)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Phone size={12} /> Phone / Telebirr
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'signup' && (
            <Input
              label="Full Name"
              placeholder="e.g. Eleanor Vance"
              icon={<UserIcon size={16} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          {authMethod === 'email' ? (
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. eleanor.vance@example.com"
              icon={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          ) : (
            <Input
              label="Mobile / Telebirr Phone Number"
              type="tel"
              placeholder="e.g. +251 91 123 4567"
              icon={<Phone size={16} />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          )}

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} icon={<ArrowRight size={18} />}>
            {mode === 'signin' ? 'Sign In to Dashboard' : 'Complete Registration'}
          </Button>
        </form>

        {/* Social Login Options */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.75rem' }}>
            Or continue with 1-click Social Login
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => handleSocialAuth('Google')}
              style={{ fontSize: '11px' }}
            >
              🌐 Google
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => handleSocialAuth('Telebirr')}
              style={{ fontSize: '11px', color: '#16a34a', borderColor: 'rgba(22,163,74,0.3)' }}
            >
              📱 Telebirr
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => handleSocialAuth('Apple')}
              style={{ fontSize: '11px' }}
            >
              🍎 Apple
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
