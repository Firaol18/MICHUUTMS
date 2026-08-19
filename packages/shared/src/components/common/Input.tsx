import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="tms-input-group">
      {label && (
        <label htmlFor={inputId} className="tms-input-label">
          {label}
        </label>
      )}
      <div className="tms-input-wrapper">
        {icon && <span className="tms-input-icon">{icon}</span>}
        <input
          id={inputId}
          className={`tms-input ${icon ? 'tms-input-has-icon' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span style={{ color: 'var(--status-danger)', fontSize: 'var(--font-size-xs)' }}>{error}</span>}
      {!error && helperText && (
        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>{helperText}</span>
      )}
    </div>
  );
};
