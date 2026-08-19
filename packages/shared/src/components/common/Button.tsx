import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClass = size === 'sm' ? 'tms-btn-sm' : size === 'lg' ? 'tms-btn-lg' : '';
  const variantClass = `tms-btn-${variant}`;

  return (
    <button
      className={`tms-btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="tms-btn-spinner" aria-label="Loading...">⏳</span>
      ) : icon ? (
        <span className="tms-btn-icon">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
