/**
 * RAVO OS — Toast Container
 * Renderiza notificações no canto inferior-direito da tela.
 */

import { useToastStore, Toast } from '@/store/toast.store';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { surface, text, semantic, chart } from '@/constants/theme';

const icons: Record<Toast['type'], React.ReactNode> = {
  success: <CheckCircle size={16} color={semantic.success} />,
  error: <XCircle size={16} color={semantic.danger} />,
  warning: <AlertTriangle size={16} color={chart.line} />,
  info: <Info size={16} color={chart.light} />,
};

const border: Record<Toast['type'], string> = {
  success: 'rgba(16, 185, 129, 0.3)',
  error: 'rgba(239, 68, 68, 0.3)',
  warning: 'rgba(245, 158, 11, 0.3)',
  info: 'rgba(59, 130, 246, 0.3)',
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            background: surface.card,
            border: `1px solid ${border[t.type]}`,
            borderLeft: `3px solid ${border[t.type]}`,
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            animation: 'toastIn 300ms ease-out',
            pointerEvents: 'auto',
          }}
        >
          <span style={{ marginTop: '1px', flexShrink: 0 }}>{icons[t.type]}</span>
          <span style={{ flex: 1, fontSize: '13px', color: text.bright, lineHeight: '1.4' }}>
            {t.message}
          </span>
          <button
            onClick={() => removeToast(t.id)}
            aria-label="Fechar notificação"
            style={{
              background: 'transparent',
              border: 'none',
              color: text.dim,
              cursor: 'pointer',
              padding: '2px',
              flexShrink: 0,
              display: 'flex',
              transition: 'color 200ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = text.highlight)}
            onMouseLeave={(e) => (e.currentTarget.style.color = text.dim)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
