import React from 'react';
import { chart, surface } from '@/constants/theme';
import { MetricCard } from '@/components/MetricCard';

interface KPICardMinimalProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: string;
  loading?: boolean;
}

/**
 * Variante compacta do MetricCard (wrapper). Mantém identidade própria
 * (borda de acento + skeleton de loading), mas delega o render ao MetricCard
 * para garantir um único padrão de KPI no app.
 */
export function KPICardMinimal({
  title,
  value,
  unit = '',
  icon,
  color = chart.light,
  trend,
  loading = false,
}: KPICardMinimalProps) {
  if (loading) {
    return (
      <div style={{
        background: surface.card,
        border: `1px solid ${surface.border}`,
        borderRadius: '8px',
        padding: '12px',
        minHeight: '100px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}>
        <div style={{ height: '12px', background: surface.borderStrong, borderRadius: '4px', marginBottom: '8px' }}></div>
        <div style={{ height: '20px', background: surface.borderStrong, borderRadius: '4px', marginBottom: '4px' }}></div>
        <div style={{ height: '12px', background: surface.borderStrong, borderRadius: '4px', width: '60%' }}></div>
      </div>
    );
  }

  return (
    <MetricCard
      label={title}
      value={String(value)}
      unit={unit}
      icon={icon}
      accent={color}
      sublabel={trend}
    />
  );
}