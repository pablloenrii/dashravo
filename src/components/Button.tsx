import React from 'react';
import { Loader2 } from 'lucide-react';
import { useThemeTokens } from '@/hooks/useThemeTokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  icon,
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  const { chart, text, surface, semantic } = useThemeTokens();
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 200ms ease-out',
    border: 'none',
    borderRadius: '8px',
    opacity: disabled ? 0.5 : 1,
  };

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? {
          background: chart.light,
          color: surface.app,
          border: '1px solid rgba(255,255,255, 0.5)',
        }
      : variant === 'secondary'
      ? {
          background: 'rgba(255,255,255, 0.08)',
          color: chart.light,
          border: '1px solid rgba(255,255,255, 0.3)',
        }
      : variant === 'danger'
      ? {
          background: 'rgba(239, 68, 68, 0.12)',
          color: semantic.danger,
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }
      : {
          background: 'transparent',
          color: text.secondary,
          border: '1px solid rgba(255,255,255,0.1)',
        };

  const sizeStyle: React.CSSProperties =
    size === 'sm'
      ? { padding: '6px 12px', fontSize: '12px' }
      : size === 'lg'
      ? { padding: '12px 24px', fontSize: '14px' }
      : { padding: '8px 16px', fontSize: '13px' };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        ...baseStyle,
        ...variantStyle,
        ...sizeStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          if (variant === 'primary') {
            e.currentTarget.style.background = text.white;
          } else if (variant === 'secondary') {
            e.currentTarget.style.background = 'rgba(255,255,255, 0.15)';
          } else if (variant === 'danger') {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
          } else {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = text.highlight;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.background = chart.light;
        } else if (variant === 'secondary') {
          e.currentTarget.style.background = 'rgba(255,255,255, 0.08)';
        } else if (variant === 'danger') {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
        } else {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = text.secondary;
        }
      }}
      className={className}
    >
      {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />}
      {icon && !loading && icon}
      {children}
    </button>
  );
}
