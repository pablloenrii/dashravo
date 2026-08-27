/**
 * RAVO OS — Confirm Dialog
 * Modal de confirmação reutilizável (substitui window.confirm).
 */

import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { AlertTriangle } from 'lucide-react';
import { useThemeTokens } from '@/hooks/useThemeTokens';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
}: ConfirmDialogProps) {
  const { text, semantic } = useThemeTokens();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" closeButton={false}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {danger && (
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={18} color={semantic.danger} />
          </div>
        )}
        <p style={{ margin: 0, fontSize: '13px', color: text.secondary, lineHeight: '1.5' }}>{message}</p>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <Button variant="ghost" onClick={onClose}>{cancelLabel}</Button>
        <Button
          onClick={() => { onConfirm(); onClose(); }}
          style={danger ? { background: semantic.danger, color: '#fff', border: 'none' } : {}}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
