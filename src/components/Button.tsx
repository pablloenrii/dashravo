import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Button({ variant = 'primary', size = 'md', children, onClick, style }: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ...style,
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '10px 16px', fontSize: '13px' },
    lg: { padding: '12px 20px', fontSize: '14px' },
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #FF6200 0%, #FF8533 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(255,98,0,0.3)',
    },
    secondary: {
      background: 'rgba(255,98,0,0.1)',
      color: '#FF6200',
      border: '1px solid rgba(255,98,0,0.2)',
    },
    ghost: {
      background: 'transparent',
      color: '#FF6200',
      border: '1px solid rgba(255,98,0,0.2)',
    },
  };

  return (
    <button
      onClick={onClick}
      style={{
        ...baseStyles,
        ...sizes[size],
        ...variants[variant],
      }}
    >
      {children}
    </button>
  );
}
