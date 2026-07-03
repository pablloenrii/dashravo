/**
 * RAVO OS — Alert Component
 * Componente Alert reutilizável
 */

import React, { ReactNode } from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

const typeStyles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: '🔵',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: '✅',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: '⚠️',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '❌',
  },
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ type = 'info', title, children, onClose, className, ...props }, ref) => {
    const styles = typeStyles[type];

    return (
      <div
        ref={ref}
        className={`
          p-4 rounded-lg border
          ${styles.bg} ${styles.border} ${styles.text}
          ${className || ''}
        `}
        {...props}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">{styles.icon}</span>
          <div className="flex-1">
            {title && <h3 className="font-semibold mb-1">{title}</h3>}
            <div className="text-sm">{children}</div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 text-lg hover:opacity-70 transition-opacity"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
