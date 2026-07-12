import { getValueColor } from '@/styles/color-semantic';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface NumberDisplayProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  showTrend?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'text' | 'badge' | 'card';
  showIcon?: boolean;
}

export function NumberDisplay({
  value,
  decimals = 2,
  prefix = '',
  suffix = '',
  size = 'md',
  variant = 'text',
  showIcon = true,
}: NumberDisplayProps) {
  const color = getValueColor(value);
  const formatted = `${prefix}${value.toFixed(decimals)}${suffix}`;

  const sizeStyles = {
    sm: { fontSize: '12px', gap: '4px' },
    md: { fontSize: '14px', gap: '6px' },
    lg: { fontSize: '16px', gap: '8px' },
  };

  const getTrendIcon = () => {
    if (value > 0) {
      return <TrendingUp size={16} style={{ color: color.text }} />;
    } else if (value < 0) {
      return <TrendingDown size={16} style={{ color: color.text }} />;
    }
    return <Minus size={16} style={{ color: color.text }} />;
  };

  if (variant === 'badge') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: sizeStyles[size].gap,
          padding: '6px 12px',
          background: color.bg,
          border: `1px solid ${color.border}`,
          color: color.text,
          borderRadius: '6px',
          fontSize: sizeStyles[size].fontSize,
          fontWeight: '600',
          whiteSpace: 'nowrap',
        }}
      >
        {showIcon && getTrendIcon()}
        {formatted}
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 12px',
          background: color.bg,
          border: `1px solid ${color.border}`,
          borderRadius: '8px',
          color: color.text,
          textAlign: 'center',
        }}
      >
        {showIcon && <div style={{ marginBottom: '8px' }}>{getTrendIcon()}</div>}
        <span
          style={{
            fontSize: sizeStyles[size].fontSize,
            fontWeight: '600',
          }}
        >
          {formatted}
        </span>
      </div>
    );
  }

  // Default: text variant
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sizeStyles[size].gap,
        color: color.text,
        fontSize: sizeStyles[size].fontSize,
        fontWeight: '600',
      }}
    >
      {showIcon && getTrendIcon()}
      {formatted}
    </span>
  );
}
