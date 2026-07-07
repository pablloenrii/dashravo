import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: number;
  closable?: boolean;
}

const typeStyles = {
  success: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    color: '#10B981',
    icon: CheckCircle,
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    color: '#EF4444',
    icon: AlertCircle,
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
    color: '#F59E0B',
    icon: AlertCircle,
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    color: '#3B82F6',
    icon: Info,
  },
};

export function Alert({
  type = 'info',
  title,
  message,
  onClose,
  autoClose = 0,
  closable = true,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const styles = typeStyles[type];
  const IconComponent = styles.icon;

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        border: `0.5px solid ${styles.border}`,
        background: styles.bg,
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        animation: 'slideDown 300ms ease-out',
      }}
    >
      <IconComponent size={20} style={{ color: styles.color, flexShrink: 0, marginTop: '2px' }} />

      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#EBEBF0', marginBottom: '4px' }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: '1.5' }}>
          {message}
        </div>
      </div>

      {closable && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: styles.color,
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            flexShrink: 0,
            transition: 'all 200ms ease-out',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <X size={18} />
        </button>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
