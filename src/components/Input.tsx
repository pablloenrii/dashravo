import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  success?: boolean;
}

export function Input({
  label,
  error,
  icon,
  success,
  ...props
}: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          style={{
            fontSize: '13px',
            fontWeight: '500',
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          {...props}
          style={{
            width: '100%',
            padding: icon ? '10px 12px 10px 36px' : '10px 12px',
            fontSize: '14px',
            borderRadius: '8px',
            border: `0.5px solid ${
              error
                ? 'rgba(239, 68, 68, 0.5)'
                : success
                  ? 'rgba(16, 185, 129, 0.5)'
                  : 'rgba(255,255,255,0.08)'
            }`,
            background: 'rgba(255,255,255,0.02)',
            color: '#EBEBF0',
            transition: 'all 300ms ease-out',
            minHeight: '44px',
            ...props.style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error
              ? 'rgba(239, 68, 68, 0.5)'
              : success
                ? 'rgba(16, 185, 129, 0.5)'
                : 'rgba(255,255,255,0.08)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
          }}
        />

        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              color: '#9CA3AF',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '12px', color: '#EF4444' }}>
          {error}
        </span>
      )}

      {success && (
        <span style={{ fontSize: '12px', color: '#10B981' }}>
          ✓ Válido
        </span>
      )}
    </div>
  );
}
