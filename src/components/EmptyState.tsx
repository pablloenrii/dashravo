import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        animation: 'fadeIn 400ms ease-out',
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: '48px',
            marginBottom: '24px',
            opacity: 0.4,
          }}
        >
          {icon}
        </div>
      )}

      <h3
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#EBEBF0',
          margin: '0 0 8px 0',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '14px',
          color: '#9CA3AF',
          margin: '0 0 24px 0',
          maxWidth: '400px',
          lineHeight: '1.6',
        }}
      >
        {description}
      </p>

      {action && (
        <Button
          variant="primary"
          onClick={action.onClick}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          {action.label}
          <ArrowRight size={14} />
        </Button>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
