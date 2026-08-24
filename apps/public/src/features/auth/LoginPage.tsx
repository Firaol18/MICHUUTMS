import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { http } from '@tms/shared/services/apiClient';
import { Card } from '@tms/shared/components/common/Card';
import { Input } from '@tms/shared/components/common/Input';
import { Button } from '@tms/shared/components/common/Button';
import {
  Compass,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // Sync mode with URL query param
  useEffect(() => {
    const m = searchParams.get('mode');
    if (m === 'signup' || m === 'signin') {
      setMode(m);
    }
  }, [searchParams]);

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    setSearchParams({ mode: newMode });
  };

  const parseBackendError = (err: any): string => {
    if (!err) return 'An unexpected error occurred. Please try again.';
    const data = err.response?.data;
    if (data?.message) {
      if (Array.isArray(data.message)) {
        return data.message.join('. ');
      }
      return String(data.message);
    }
    if (data?.error) return String(data.error);
    if (err.message) return String(err.message);
    return 'Authentication request failed. Please check your network and try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // Client-side validation prior to sending to backend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (mode === 'signup') {
      if (cleanName.length < 2) {
        setErrorMsg('Full name must be at least 2 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Direct backend registration
        const response = await http.post('/auth/register', {
          name: cleanName,
          email: cleanEmail,
          password,
        });

        const { user, access_token } = response.data;
        if (!access_token || !user) {
          throw new Error('Invalid response structure received from authentication server.');
        }

        login(
          {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role || 'tourist',
            department: user.department || 'Traveler Member',
            avatarUrl: user.avatarUrl,
          },
          access_token
        );

        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/user/dashboard');
          }
        }, 500);
      } else {
        // Direct backend login
        const response = await http.post('/auth/login', {
          email: cleanEmail,
          password,
        });

        const { user, access_token } = response.data;
        if (!access_token || !user) {
          throw new Error('Invalid response structure received from authentication server.');
        }

        login(
          {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role || 'tourist',
            department: user.department || (user.role === 'admin' ? 'Tourism Operations' : 'Traveler Member'),
            avatarUrl: user.avatarUrl,
          },
          access_token
        );

        setSuccessMsg(`Welcome back, ${user.name}! Redirecting...`);
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/user/dashboard');
          }
        }, 500);
      }
    } catch (err: any) {
      const message = parseBackendError(err);
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex-center"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        padding: '2rem 1.5rem',
        background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.1), transparent 50%), radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.08), transparent 50%)',
      }}
    >
      <Card
        glass
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div className="flex-center" style={{ flexDirection: 'column', gap: '0.4rem', marginBottom: '1.75rem' }}>
          <div
            className="flex-center text-gradient"
            style={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              backgroundColor: 'var(--brand-primary-light)',
              marginBottom: '0.25rem',
            }}
          >
            <Compass size={30} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            MICHUU <span style={{ color: 'var(--brand-primary)' }}>TMS</span>
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
            {mode === 'signin' ? 'Sign in to access your bookings, tickets & personalized trips' : 'Create an account to begin your Ethiopian journey'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--bg-tertiary)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-full)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => switchMode('signin')}
            style={{
              padding: '0.55rem',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: mode === 'signin' ? 800 : 500,
              backgroundColor: mode === 'signin' ? 'var(--bg-primary)' : 'transparent',
              color: mode === 'signin' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              boxShadow: mode === 'signin' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            style={{
              padding: '0.55rem',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: mode === 'signup' ? 800 : 500,
              backgroundColor: mode === 'signup' ? 'var(--bg-primary)' : 'transparent',
              color: mode === 'signup' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              boxShadow: mode === 'signup' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontSize: 'var(--font-size-xs)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10b981',
              fontSize: 'var(--font-size-xs)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {mode === 'signup' && (
            <Input
              label="Full Name"
              placeholder="e.g. Firaol Desalegn"
              icon={<UserIcon size={16} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. name@example.com"
            icon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div style={{ position: 'relative' }}>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              icon={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '36px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {mode === 'signup' && (
            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              icon={<Lock size={16} />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            icon={<ArrowRight size={18} />}
            style={{ marginTop: '0.5rem', fontWeight: 700 }}
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {/* Switch mode footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          {mode === 'signin' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                style={{ color: 'var(--brand-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Create Account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                style={{ color: 'var(--brand-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};
