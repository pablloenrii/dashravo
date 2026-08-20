import React from 'react';
import { text, soft, surface, semantic } from '@/constants/theme';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: React.CSSProperties;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: {
    bg: surface.hover,
    text: text.secondary,
    border: 'rgba(255,255,255,0.2)',
  },
  primary: {
    bg: 'rgba(255,255,255, 0.12)',
    text: text.strong,
    border: 'rgba(255,255,255, 0.3)',
  },
  success: {
    bg: soft.success,
    text: semantic.success,
    border: 'rgba(16, 185, 129, 0.3)',
  },
  warning: {
    bg: soft.warning,
    text: semantic.warning,
    border: 'rgba(217, 119, 6, 0.35)',
  },
  error: {
    bg: soft.danger,
    text: semantic.danger,
    border: 'rgba(239, 68, 68, 0.3)',
  },
  info: {
    bg: 'rgba(255,255,255, 0.12)',
    text: text.strong,
    border: 'rgba(255,255,255, 0.3)',
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
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
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
