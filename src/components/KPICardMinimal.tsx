import React from 'react';
import { chart, text, surface, semantic } from '@/constants/theme';

interface KPICardMinimalProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: string;
  loading?: boolean;
}

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
    <div style={{
      background: surface.card,
      border: `1px solid ${surface.border}`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '8px',
      padding: '12px',
      minHeight: '100px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'all 200ms ease-out',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = `${color}`;
      e.currentTarget.style.background = surface.input;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = surface.borderStrong;
      e.currentTarget.style.background = surface.card;
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color }}>
        {icon && <span style={{ fontSize: '14px' }}>{icon}</span>}
      </div>
      <div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: text.bright, marginBottom: '2px' }}>
          {value}
          {unit && <span style={{ fontSize: '12px', color: text.secondary, marginLeft: '4px', fontWeight: '500' }}>{unit}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: text.dim, fontWeight: '500' }}>{title}</span>
          {trend && <span style={{ fontSize: '10px', color: semantic.success, fontWeight: '600' }}>{trend}</span>}
        </div>
      </div>
    </div>
  );
}
