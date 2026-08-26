import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { http } from '@tms/shared/services/apiClient';
import { Card } from '@tms/shared/components/common/Card';
import { Input } from '@tms/shared/components/common/Input';
import { Button } from '@tms/shared/components/common/Button';
import {
  Compass, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle,
  CheckCircle2, Eye, EyeOff, KeyRound, ShieldAlert, MailCheck,
} from 'lucide-react';

type PageMode = 'signin' | 'signup' | 'forgot' | 'forgot-sent';

export const LoginPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode: PageMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const [mode, setMode] = useState<PageMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // Handle email verify redirect: ?verified=1
  const justVerified = searchParams.get('verified') === '1';

  useEffect(() => {
    const m = searchParams.get('mode');
    if (m === 'signup' || m === 'signin') setMode(m as PageMode);
  }, [searchParams]);

  const switchMode = (newMode: PageMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    if (newMode === 'signin' || newMode === 'signup') {
      setSearchParams({ mode: newMode });
    }
  };

  const parseBackendError = (err: any): { msg: string; locked: boolean } => {
    if (!err) return { msg: 'An unexpected error occurred. Please try again.', locked: false };
    const data = err.response?.data;
    const status = err.response?.status;
    const msg = Array.isArray(data?.message)
      ? data.message.join('. ')
      : String(data?.message || data?.error || err.message || 'Authentication failed.');
    return { msg, locked: status === 403 };
  };

  // ── Submit handlers ────────────────────────────────────────────────────────

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLocked(false);

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) { setErrorMsg('Please enter a valid email address.'); return; }
    if (password.length < 8) { setErrorMsg('Password must be at least 8 characters.'); return; }
    if (mode === 'signup') {
      if (cleanName.length < 2) { setErrorMsg('Full name must be at least 2 characters.'); return; }
      if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); return; }
    }

    setIsLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/auth/register' : '/auth/login';
      const body = mode === 'signup'
        ? { name: cleanName, email: cleanEmail, password }
        : { email: cleanEmail, password };

      const response = await http.post(endpoint, body);
      // New API returns { user, accessToken } — support both old access_token and new accessToken
      const { user, accessToken, access_token } = response.data;
      const token = accessToken || access_token;
      if (!token || !user) throw new Error('Invalid response from authentication server.');

      login(
        {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role || 'tourist',
          department: user.department || (user.role === 'admin' ? 'Tourism Operations' : 'Traveler Member'),
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerified ?? true,
        },
        token,
      );

      if (mode === 'signup') {
        setSuccessMsg('✅ Account created! A verification email has been sent to your inbox. Redirecting...');
      } else {
        setSuccessMsg(`Welcome back, ${user.name}! Redirecting...`);
      }

      setTimeout(() => {
        if (user.role === 'admin') navigate('/admin/dashboard');
        else navigate('/user/dashboard');
      }, 600);
    } catch (err: any) {
      const { msg, locked } = parseBackendError(err);
      setErrorMsg(msg);
      setIsLocked(locked);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) { setErrorMsg('Please enter your email address.'); return; }
    setIsLoading(true);
    try {
      await http.post('/auth/forgot-password', { email: cleanEmail });
      setMode('forgot-sent');
    } catch (err: any) {
      const { msg } = parseBackendError(err);
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

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
      <Card glass style={{ width: '100%', maxWidth: '460px', padding: '2.5rem 2rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}>

        {/* Header */}
        <div className="flex-center" style={{ flexDirection: 'column', gap: '0.4rem', marginBottom: '1.75rem' }}>
          <div className="flex-center" style={{ width: 52, height: 52, borderRadius: '16px', backgroundColor: 'var(--brand-primary-light)', marginBottom: '0.25rem' }}>
            {mode === 'forgot' || mode === 'forgot-sent'
              ? <KeyRound size={28} style={{ color: 'var(--brand-primary)' }} />
              : <Compass size={30} style={{ color: 'var(--brand-primary)' }} />
            }
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            {mode === 'forgot' ? 'Forgot Password' : mode === 'forgot-sent' ? 'Check Your Email' : <>MICHUU <span style={{ color: 'var(--brand-primary)' }}>TMS</span></>}
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
            {mode === 'signin' && 'Sign in to access your bookings, tickets & personalized trips'}
            {mode === 'signup' && 'Create an account to begin your Ethiopian journey'}
            {mode === 'forgot' && "Enter your email and we'll send a reset link"}
            {mode === 'forgot-sent' && `We've sent a reset link to ${email}`}
          </p>
        </div>

        {/* Email Verified Banner */}
        {justVerified && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontSize: 'var(--font-size-xs)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MailCheck size={16} style={{ flexShrink: 0 }} />
            <span>Email verified successfully! Sign in to continue.</span>
          </div>
        )}

        {/* Tab Switcher (only on signin/signup) */}
        {(mode === 'signin' || mode === 'signup') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: 'var(--radius-full)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
            {(['signin', 'signup'] as const).map((m) => (
              <button key={m} type="button" onClick={() => switchMode(m)} style={{ padding: '0.55rem', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: mode === m ? 800 : 500, backgroundColor: mode === m ? 'var(--bg-primary)' : 'transparent', color: mode === m ? 'var(--brand-primary)' : 'var(--text-secondary)', boxShadow: mode === m ? '0 2px 6px rgba(0,0,0,0.08)' : 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: isLocked ? 'rgba(245,158,11,0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${isLocked ? 'rgba(245,158,11,0.3)' : 'rgba(239, 68, 68, 0.25)'}`, color: isLocked ? '#f59e0b' : '#ef4444', fontSize: 'var(--font-size-xs)', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            {isLocked ? <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 1 }} /> : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />}
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10b981', fontSize: 'var(--font-size-xs)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Sign In / Sign Up Form ── */}
        {(mode === 'signin' || mode === 'signup') && (
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {mode === 'signup' && (
              <Input label="Full Name" placeholder="e.g. Firaol Desalegn" icon={<UserIcon size={16} />} value={name} onChange={(e) => setName(e.target.value)} required />
            )}
            <Input label="Email Address" type="email" placeholder="e.g. name@example.com" icon={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div style={{ position: 'relative' }}>
              <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" icon={<Lock size={16} />} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '36px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {mode === 'signup' && (
              <Input label="Confirm Password" type={showPassword ? 'text' : 'password'} placeholder="Re-enter your password" icon={<Lock size={16} />} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            )}

            {/* Forgot password link */}
            {mode === 'signin' && (
              <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                <button type="button" onClick={() => switchMode('forgot')} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} disabled={isLocked} icon={<ArrowRight size={18} />} style={{ marginTop: '0.25rem', fontWeight: 700 }}>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        )}

        {/* ── Forgot Password Form ── */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <Input label="Email Address" type="email" placeholder="Enter your registered email" icon={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} icon={<KeyRound size={18} />} style={{ fontWeight: 700 }}>
              Send Reset Link
            </Button>
            <Button type="button" variant="ghost" size="md" onClick={() => switchMode('signin')} style={{ fontWeight: 600 }}>
              ← Back to Sign In
            </Button>
          </form>
        )}

        {/* ── Forgot-Sent Confirmation ── */}
        {mode === 'forgot-sent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem' }}>📨</div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              If <strong>{email}</strong> is registered, you'll receive a password reset link shortly. Check your spam folder too.
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>The link expires in <strong>1 hour</strong> and can only be used once.</p>
            <Button type="button" variant="primary" size="lg" onClick={() => switchMode('signin')} icon={<ArrowRight size={18} />} style={{ fontWeight: 700, marginTop: '0.5rem' }}>
              Back to Sign In
            </Button>
          </div>
        )}

        {/* Footer */}
        {(mode === 'signin' || mode === 'signup') && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            {mode === 'signin' ? (
              <span>Don't have an account?{' '}<button type="button" onClick={() => switchMode('signup')} style={{ color: 'var(--brand-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Create Account</button></span>
            ) : (
              <span>Already have an account?{' '}<button type="button" onClick={() => switchMode('signin')} style={{ color: 'var(--brand-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Sign In</button></span>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
