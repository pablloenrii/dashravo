import React from 'react';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    fill: string;
    dataKey: string;
  }>;
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        background: 'rgba(11, 14, 25, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        minWidth: '180px',
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#9CA3AF',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Color dot */}
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: entry.fill,
                boxShadow: `0 0 8px ${entry.fill}40`,
              }}
            />
            {/* Text */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flex: 1 }}>
              <span style={{ fontSize: '12px', color: '#EBEBF0' }}>{entry.name}</span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: entry.fill,
                  minWidth: '60px',
                  textAlign: 'right',
                }}
              >
                {typeof entry.value === 'number'
                  ? entry.value.toLocaleString('pt-BR')
                  : entry.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
