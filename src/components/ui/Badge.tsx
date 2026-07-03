/**
 * RAVO OS — Badge Component
 * Componente Badge reutilizável
 */

import React, { ReactNode } from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'gray';
  size?: 'sm' | 'md';
  children: ReactNode;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'gray', size = 'md', className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-block rounded-full font-medium
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
