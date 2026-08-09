import { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { chart, text, soft, semantic } from '@/constants/theme';

export interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: number;
  closable?: boolean;
  className?: string;
}

const typeStyles = {
  success: {
    bg: soft.success,
    border: 'rgba(16, 185, 129, 0.3)',
    color: semantic.success,
    icon: CheckCircle,
  },
  error: {
    bg: soft.danger,
    border: 'rgba(239, 68, 68, 0.3)',
    color: semantic.danger,
    icon: AlertCircle,
  },
  warning: {
    bg: soft.warning,
    border: 'rgba(245, 158, 11, 0.3)',
    color: chart.line,
    icon: AlertCircle,
  },
  info: {
    bg: 'rgba(255,255,255, 0.1)',
    border: 'rgba(255,255,255, 0.3)',
    color: text.strong,
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
  className,
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
      className={className}
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
          <div style={{ fontSize: '13px', fontWeight: '600', color: text.highlight, marginBottom: '4px' }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: '13px', color: text.secondary, lineHeight: '1.5' }}>
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
