import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const variantStyles = {
  default: {
    background: 'rgba(255,98,0,0.15)',
    color: '#FF6200',
    border: '1px solid rgba(255,98,0,0.3)',
  },
  success: {
    background: 'rgba(52,199,89,0.15)',
    color: '#34C759',
    border: '1px solid rgba(52,199,89,0.3)',
  },
  warning: {
    background: 'rgba(255,149,0,0.15)',
    color: '#FF9500',
    border: '1px solid rgba(255,149,0,0.3)',
  },
  danger: {
    background: 'rgba(255,59,48,0.15)',
    color: '#FF3B30',
    border: '1px solid rgba(255,59,48,0.3)',
  },
  info: {
    background: 'rgba(48,176,192,0.15)',
    color: '#30B0C0',
    border: '1px solid rgba(48,176,192,0.3)',
  },
};

export function Badge({ variant = 'default', children, style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 10px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '600',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
