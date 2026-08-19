import React from 'react';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'in-transit';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  children,
  icon,
  className = '',
  style,
}) => {
  return (
    <span className={`tms-badge tms-badge-${variant} ${className}`} style={style}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
