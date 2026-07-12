import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: React.CSSProperties;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: {
    bg: 'rgba(255,255,255,0.1)',
    text: '#9CA3AF',
    border: 'rgba(255,255,255,0.2)',
  },
  primary: {
    bg: 'rgba(59, 130, 246, 0.12)',
    text: '#3B82F6',
    border: 'rgba(59, 130, 246, 0.3)',
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.12)',
    text: '#10B981',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.12)',
    text: '#F59E0B',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.12)',
    text: '#EF4444',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.12)',
    text: '#3B82F6',
    border: 'rgba(59, 130, 246, 0.3)',
  },
};

export function Badge({
  children,
  variant = 'default',
  className = '',
  style = {},
}: BadgeProps) {
  const variantStyle = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: variantStyle.bg,
        color: variantStyle.text,
        border: `1px solid ${variantStyle.border}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
