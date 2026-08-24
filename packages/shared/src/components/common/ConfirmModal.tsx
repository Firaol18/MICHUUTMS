import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Trash2, Info, CheckCircle2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (promptValue?: string) => Promise<void> | void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: React.ReactNode;
  requirePrompt?: boolean;
  promptLabel?: string;
  promptPlaceholder?: string;
  initialPromptValue?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
  requirePrompt = false,
  promptLabel = 'Reason / Note:',
  promptPlaceholder = 'Please enter reason...',
  initialPromptValue = '',
  isLoading = false,
}) => {
  const [promptValue, setPromptValue] = useState(initialPromptValue);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPromptValue(initialPromptValue);
      setError('');
    }
  }, [isOpen, initialPromptValue]);

  const handleConfirm = async () => {
    if (requirePrompt && !promptValue.trim()) {
      setError('Please provide a reason to continue.');
      return;
    }
    setError('');
    await onConfirm(promptValue);
  };

  const defaultIcon =
    variant === 'danger' ? (
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Trash2 size={22} />
      </div>
    ) : variant === 'warning' ? (
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          color: '#f59e0b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AlertTriangle size={22} />
      </div>
    ) : (
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: 'var(--brand-primary-light)',
          color: 'var(--brand-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Info size={22} />
      </div>
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex-between" style={{ width: '100%', gap: '0.75rem' }}>
          <Button variant="ghost" size="md" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={handleConfirm}
            isLoading={isLoading}
            style={
              variant === 'danger'
                ? { backgroundColor: '#ef4444', borderColor: '#ef4444', color: '#fff' }
                : variant === 'warning'
                ? { backgroundColor: '#f59e0b', borderColor: '#f59e0b', color: '#000' }
                : undefined
            }
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          {icon || defaultIcon}
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {message}
            </div>
          </div>
        </div>

        {requirePrompt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {promptLabel}
            </label>
            <textarea
              className="tms-input"
              rows={3}
              value={promptValue}
              onChange={(e) => {
                setPromptValue(e.target.value);
                if (error) setError('');
              }}
              placeholder={promptPlaceholder}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                border: error ? '1px solid #ef4444' : '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-size-xs)',
                resize: 'vertical',
              }}
              autoFocus
            />
            {error && (
              <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>
                {error}
              </span>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
