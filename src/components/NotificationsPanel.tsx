import { Link } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import type { NotificationItem } from '@/hooks/useNotifications';
import { chart, text, surface, semantic } from '@/constants/theme';

export function NotificationsPanel({
  items,
  loading,
  onClose,
}: {
  items: NotificationItem[];
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '52px',
        right: 0,
        width: '320px',
        background: surface.card,
        border: `1px solid ${surface.borderStrong}`,
        borderRadius: '10px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        zIndex: 60,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderBottom: `1px solid ${surface.border}`,
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 600, color: text.strong }}>Notificações</span>
        <button
          onClick={onClose}
          aria-label="Fechar notificações"
          style={{ background: 'transparent', border: 'none', color: text.tertiary, cursor: 'pointer', display: 'flex' }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: text.tertiary }}>Carregando…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: text.tertiary }}>
            Tudo em dia — nenhum alerta no momento.
          </div>
        ) : (
          items.map((n) => (
            <Link
              key={n.id}
              to={n.href}
              onClick={onClose}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '12px 14px',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <span style={{ color: n.severity === 'danger' ? semantic.danger : chart.line, flexShrink: 0, marginTop: '1px' }}>
                <AlertTriangle size={15} />
              </span>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: text.strong }}>{n.title}</div>
                <div style={{ fontSize: '11.5px', color: text.secondary, marginTop: '2px' }}>{n.message}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
