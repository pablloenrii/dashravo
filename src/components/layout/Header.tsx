/**
 * RAVO OS — Header Component
 * Componente Header reutilizável
 */

import React, { ReactNode } from 'react';

export interface HeaderProps extends React.HTMLAttributes<HTMLHeaderElement> {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export const Header = React.forwardRef<HTMLHeaderElement, HeaderProps>(
  ({ title, subtitle, actions, children, className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={`
          bg-white border-b border-gray-200 shadow-sm
          ${className || ''}
        `}
        {...props}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {children ? (
            children
          ) : (
            <div className="flex items-center justify-between">
              <div>
                {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
              </div>
              {actions && <div className="flex gap-2">{actions}</div>}
            </div>
          )}
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';
