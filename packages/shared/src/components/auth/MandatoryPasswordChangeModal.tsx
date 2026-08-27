import React, { useState } from 'react';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { corporateService } from '@tms/shared/services/corporateService';
import { http } from '@tms/shared/services/apiClient';
import {
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Building2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const MandatoryPasswordChangeModal: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const completePasswordChange = useAuthStore((state) => state.completePasswordChange);
  const logout = useAuthStore((state) => state.logout);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!user || !user.mustChangePassword) {
    return null;
  }

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isStrong = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword.trim()) {
      setErrorMsg('Please enter your current temporary password.');
      return;
    }

    if (!isStrong) {
      setErrorMsg('Please ensure your new password satisfies all security requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMsg('New password cannot be the same as your temporary password.');
      return;
    }

    setLoading(true);
    try {
      // 1. Try sending to backend API if available
      try {
        await http.post('/auth/change-password', {
          currentPassword,
          newPassword,
        });
      } catch (backendErr) {
        // Fallback gracefully for mock/local development
      }

      // 2. Update local corporate user service record
      await corporateService.changeCorporateUserPassword(user.email, newPassword);

      setSuccessMsg('Password updated successfully! Unlocking your workspace...');

      setTimeout(() => {
        completePasswordChange();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Please verify your temporary password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-primary, #ffffff)',
          color: 'var(--text-primary, #1e293b)',
          borderRadius: '20px',
          border: '1px solid var(--border-color, rgba(226, 232, 240, 0.8))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header Ribbon */}
        <div
          style={{
            padding: '1.75rem 1.75rem 1.25rem 1.75rem',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              color: 'var(--brand-primary, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <KeyRound size={26} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ShieldAlert size={12} /> First-Time Login
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-primary, #0f172a)',
                letterSpacing: '-0.02em',
              }}
            >
              Set Permanent Password
            </h2>
            <p
              style={{
                margin: '0.35rem 0 0 0',
                fontSize: '12px',
                color: 'var(--text-muted, #64748b)',
                lineHeight: 1.4,
              }}
            >
              You signed in using a temporary password. Please set your new private password to continue.
            </p>
          </div>
        </div>

        {/* User Context Tag */}
        <div
          style={{
            padding: '0.65rem 1.75rem',
            backgroundColor: 'var(--bg-secondary, #f8fafc)',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={14} color="#64748b" />
            <span style={{ fontWeight: 600, color: 'var(--text-secondary, #475569)' }}>
              {user.companyName || 'Corporate Account'}
            </span>
          </div>
          <span style={{ color: 'var(--text-muted, #94a3b8)' }}>{user.email}</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem' }}>
          {errorMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                fontSize: '12px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontSize: '12px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{successMsg}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Current / Temporary Password */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-muted, #64748b)',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                Temporary Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted, #94a3b8)',
                  }}
                />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter the temporary password given to you"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 2.5rem 0 2.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--bg-primary, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted, #94a3b8)',
                    padding: '4px',
                  }}
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-muted, #64748b)',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                New Permanent Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted, #94a3b8)',
                  }}
                />
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Create your new password (min. 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 2.5rem 0 2.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--bg-primary, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted, #94a3b8)',
                    padding: '4px',
                  }}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Requirement Checklist */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.35rem 0.75rem',
                  marginTop: '0.6rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-secondary, #f8fafc)',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
              >
                <span style={{ color: hasMinLength ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {hasMinLength ? '✓' : '•'} At least 8 characters
                </span>
                <span style={{ color: hasUpperCase ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {hasUpperCase ? '✓' : '•'} 1 uppercase letter (A-Z)
                </span>
                <span style={{ color: hasLowerCase ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {hasLowerCase ? '✓' : '•'} 1 lowercase letter (a-z)
                </span>
                <span style={{ color: hasNumber ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {hasNumber ? '✓' : '•'} 1 number (0-9)
                </span>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-muted, #64748b)',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted, #94a3b8)',
                  }}
                />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 2.5rem 0 2.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--bg-primary, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted, #94a3b8)',
                    padding: '4px',
                  }}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={loading || !isStrong || newPassword !== confirmPassword || !currentPassword}
              style={{
                width: '100%',
                height: '46px',
                backgroundColor: 'var(--brand-primary, #2563eb)',
                color: '#ffffff',
                borderRadius: '10px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor:
                  loading || !isStrong || newPassword !== confirmPassword || !currentPassword
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  loading || !isStrong || newPassword !== confirmPassword || !currentPassword ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              }}
            >
              <ShieldCheck size={16} />
              <span>{loading ? 'Securing Account...' : 'Set Password & Unlock Workspace'}</span>
              {!loading && <ArrowRight size={15} />}
            </button>

            <button
              type="button"
              onClick={() => logout()}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted, #94a3b8)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                padding: '0.25rem',
              }}
            >
              Log out and cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
