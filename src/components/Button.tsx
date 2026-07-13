import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    background: #EDEDED;
    color: #0A0A0A;
    border: 1px solid rgba(255,255,255, 0.5);
    &:hover {
      background: #FFFFFF;
    }
  `,
  secondary: `
    background: rgba(255,255,255, 0.08);
    color: #EDEDED;
    border: 1px solid rgba(255,255,255, 0.3);
    &:hover {
      background: rgba(255,255,255, 0.15);
    }
  `,
  ghost: `
    background: transparent;
    color: #9CA3AF;
    border: 1px solid rgba(255,255,255,0.1);
    &:hover {
      background: rgba(255,255,255,0.04);
      color: #EBEBF0;
    }
  `,
  danger: `
    background: rgba(239, 68, 68, 0.12);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    &:hover {
      background: rgba(239, 68, 68, 0.2);
    }
  `,
};

export const sizeStyles: Record<ButtonSize, string> = {
  sm: 'padding: 6px 12px; font-size: 12px; border-radius: 6px;',
  md: 'padding: 8px 16px; font-size: 13px; border-radius: 8px;',
  lg: 'padding: 12px 24px; font-size: 14px; border-radius: 8px;',
};

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
          background: '#EDEDED',
          color: '#0A0A0A',
          border: '1px solid rgba(255,255,255, 0.5)',
        }
      : variant === 'secondary'
      ? {
          background: 'rgba(255,255,255, 0.08)',
          color: '#EDEDED',
          border: '1px solid rgba(255,255,255, 0.3)',
        }
      : variant === 'danger'
      ? {
          background: 'rgba(239, 68, 68, 0.12)',
          color: '#EF4444',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }
      : {
          background: 'transparent',
          color: '#9CA3AF',
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
            e.currentTarget.style.background = '#FFFFFF';
          } else if (variant === 'secondary') {
            e.currentTarget.style.background = 'rgba(255,255,255, 0.15)';
          } else if (variant === 'danger') {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
          } else {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#EBEBF0';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.background = '#EDEDED';
        } else if (variant === 'secondary') {
          e.currentTarget.style.background = 'rgba(255,255,255, 0.08)';
        } else if (variant === 'danger') {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
        } else {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#9CA3AF';
        }
      }}
      className={className}
    >
      {loading && <span style={{ animation: 'spin 1s linear infinite' }}>⚙️</span>}
      {icon && !loading && icon}
      {children}
    </button>
  );
}
