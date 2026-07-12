import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorBoundaryVisualProps {
  error?: Error | string;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function ErrorBoundaryVisual({
  error,
  onRetry,
  title = 'Algo deu errado',
  description = 'Houve um erro ao carregar os dados. Tente novamente.',
}: ErrorBoundaryVisualProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        background: 'rgba(11, 14, 25, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,59,48,0.2)',
        borderRadius: '12px',
        minHeight: '280px',
        animation: 'slideUp 400ms ease-out',
      }}
    >
      {/* Icon */}
      <div
        style={{
          marginBottom: '24px',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        <AlertCircle
          size={48}
          style={{
            color: '#EF4444',
            opacity: 0.8,
          }}
        />
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#EBEBF0',
          margin: '0 0 8px 0',
          textAlign: 'center',
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: '13px',
          color: '#9CA3AF',
          margin: '0 0 24px 0',
          textAlign: 'center',
          maxWidth: '300px',
        }}
      >
        {description}
      </p>

      {/* Error details */}
      {error && (
        <div
          style={{
            background: 'rgba(255,59,48,0.1)',
            border: '1px solid rgba(255,59,48,0.2)',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '24px',
            maxWidth: '100%',
            overflow: 'auto',
          }}
        >
          <code
            style={{
              fontSize: '11px',
              color: '#FCA5A5',
              fontFamily: "'SF Mono', Monaco, monospace",
              wordBreak: 'break-all',
            }}
          >
            {typeof error === 'string' ? error : error.message}
          </code>
        </div>
      )}

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            color: '#EBEBF0',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 200ms ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}
        >
          <RefreshCw size={16} />
          Tentar novamente
        </button>
      )}
    </div>
  );
}
