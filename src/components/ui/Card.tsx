/**
 * RAVO OS — Card Component
 * Componente Card reutilizável
 */

import React, { ReactNode } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, hoverable = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-lg shadow border border-gray-200
          ${hoverable ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : ''}
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className || ''}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className || ''}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className || ''}`}>
    {children}
  </div>
);
