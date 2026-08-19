import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glass = false, ...props }) => {
  return (
    <div className={`tms-card ${glass ? 'glass-panel' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};
