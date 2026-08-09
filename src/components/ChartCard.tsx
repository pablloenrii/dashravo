/**
 * RAVO OS — Card de gráfico reutilizável
 * Superfície padrão + título. Substitui o boilerplate inline de card repetido
 * em Dashboard/Finance/Goals/CS. A altura é controlada pelo ResponsiveContainer
 * dentro do children.
 */

import { ReactNode } from 'react';
import { surface, text } from '@/constants/theme';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div
      style={{
        background: surface.card,
        border: `1px solid ${surface.borderStrong}`,
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      <h3 style={{ fontSize: '13px', fontWeight: 600, color: text.primary, margin: '0 0 12px 0' }}>
        {title}
        {subtitle && <span style={{ fontSize: '11px', fontWeight: 400, color: text.secondary, marginLeft: '8px' }}>{subtitle}</span>}
      </h3>
      {children}
    </div>
  );
}
