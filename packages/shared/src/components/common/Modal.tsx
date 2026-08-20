import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
}


export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeMaxWidth =
    size === 'sm' ? '440px' :
    size === 'lg' ? '860px' :
    size === 'xl' ? '1100px' :
    '580px';

  return (
    <div className="tms-modal-overlay" onClick={onClose}>
      <div
        className={`tms-modal-content tms-modal-${size}`}
        style={{ maxWidth: sizeMaxWidth, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-between" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </Button>
        </div>
        <div style={{ padding: '1.25rem', maxHeight: '78vh', overflowY: 'auto' }}>{children}</div>
        {footer && (
          <div
            className="flex-between"
            style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
