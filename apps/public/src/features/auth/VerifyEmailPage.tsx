import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { http } from '@tms/shared/services/apiClient';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@tms/shared/store/useAuthStore';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, login } = useAuthStore();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing email verification token. Please check your verification link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await http.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data?.message || 'Your email address has been verified successfully!');
        if (user) {
          useAuthStore.setState({
            user: { ...user, emailVerified: true },
          });
        }
      } catch (err: any) {
        setStatus('error');
        const errMsg = err.response?.data?.message || err.message || 'Verification link is invalid or has expired.';
        setMessage(errMsg);
      }
    };

    verify();
  }, [token, user]);

  return (
    <div
      className="flex-center"
      style={{
        minHeight: '80vh',
        padding: '2rem 1.5rem',
      }}
    >
      <Card
        glass
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          {status === 'verifying' && (
            <Loader2 size={48} className="animate-spin" style={{ color: 'var(--brand-primary)', margin: '0 auto' }} />
          )}
          {status === 'success' && (
            <CheckCircle2 size={54} style={{ color: '#10b981', margin: '0 auto' }} />
          )}
          {status === 'error' && (
            <XCircle size={54} style={{ color: '#ef4444', margin: '0 auto' }} />
          )}
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          {status === 'verifying' && 'Verifying Email'}
          {status === 'success' && 'Email Verified! 🎉'}
          {status === 'error' && 'Verification Failed'}
        </h2>

        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
          {message}
        </p>

        {status === 'success' && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/login?verified=1')}
            icon={<ArrowRight size={18} />}
            style={{ width: '100%', fontWeight: 700 }}
          >
            Continue to Sign In
          </Button>
        )}

        {status === 'error' && (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/login')}
            style={{ width: '100%', fontWeight: 700 }}
          >
            Back to Login
          </Button>
        )}
      </Card>
    </div>
  );
};
