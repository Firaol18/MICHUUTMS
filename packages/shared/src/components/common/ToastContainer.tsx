import React from 'react';
import { useToastStore, type ToastType } from '@tms/shared/store/useToastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />,
  error: <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />,
  warning: <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />,
  info: <Info size={20} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />,
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: 'rgba(16, 185, 129, 0.4)',
  error: 'rgba(239, 68, 68, 0.4)',
  warning: 'rgba(245, 158, 11, 0.4)',
  info: 'rgba(37, 99, 235, 0.4)',
};

const BG_ACCENTS: Record<ToastType, string> = {
  success: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), transparent)',
  error: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), transparent)',
  warning: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), transparent)',
  info: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), transparent)',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '420px',
        width: 'calc(100vw - 40px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            backgroundColor: 'var(--bg-secondary)',
            backgroundImage: BG_ACCENTS[toast.type],
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${BORDER_COLORS[toast.type]}`,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0, 0, 0, 0.08)',
            borderRadius: '14px',
            padding: '0.9rem 1.1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            animation: 'tmsToastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {ICONS[toast.type]}

          <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
            {toast.title && (
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.15rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {toast.title}
              </div>
            )}
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.45,
                wordBreak: 'break-word',
              }}
            >
              {toast.message}
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.1rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            title="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};
