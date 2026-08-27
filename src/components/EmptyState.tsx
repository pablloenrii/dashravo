/**
 * RAVO OS — Empty State
 * Componente reutilizável para estados vazios com ícone, título e CTA opcional.
 */

import { Button } from '@/components/Button';
import { text, surface } from '@/constants/theme';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: surface.input, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '16px',
      }}>
        {icon ?? <Inbox size={24} color={text.dim} />}
      </div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: text.bright, margin: '0 0 6px 0' }}>{title}</h3>
      {description && (
        <p style={{ fontSize: '12px', color: text.secondary, margin: '0 0 16px 0', maxWidth: '280px' }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} style={{ fontSize: '12px', padding: '8px 16px' }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
