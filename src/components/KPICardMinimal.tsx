import React from 'react';

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
  color = '#FF6200',
  trend,
  loading = false,
}: KPICardMinimalProps) {
  if (loading) {
    return (
      <div style={{
        background: '#0A0E1A',
        border: '1px solid rgba(255,255,255,0.1)',
        borderLeft: `3px solid ${color}`,
        borderRadius: '8px',
        padding: '12px',
        minHeight: '100px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}>
        <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px' }}></div>
        <div style={{ height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '4px' }}></div>
        <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '60%' }}></div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#0A0E1A',
      border: '1px solid rgba(255,255,255,0.1)',
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
      e.currentTarget.style.background = 'rgba(255, 98, 0, 0.04)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
      e.currentTarget.style.background = '#0A0E1A';
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color }}>
        {icon && <span style={{ fontSize: '14px' }}>{icon}</span>}
      </div>
      <div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#F5F5F7', marginBottom: '2px' }}>
          {value}
          {unit && <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '4px', fontWeight: '500' }}>{unit}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '500' }}>{title}</span>
          {trend && <span style={{ fontSize: '10px', color: '#10B981', fontWeight: '600' }}>{trend}</span>}
        </div>
      </div>
    </div>
  );
}
