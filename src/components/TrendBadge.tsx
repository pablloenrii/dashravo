import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getTrendColor } from '@/styles/color-semantic';

export interface TrendBadgeProps {
  value: number;
  percentage?: number;
  direction?: 'up' | 'down' | 'flat';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export function TrendBadge({
  value,
  percentage,
  direction,
  label,
  size = 'md',
  showValue = true,
}: TrendBadgeProps) {
  // Determine direction from value if not specified
  const dir = direction || (value > 0 ? 'up' : value < 0 ? 'down' : 'flat');
  const color = getTrendColor(dir);

  const sizeStyles = {
    sm: { fontSize: '11px', padding: '4px 8px', iconSize: 12 },
    md: { fontSize: '12px', padding: '6px 12px', iconSize: 14 },
    lg: { fontSize: '13px', padding: '8px 16px', iconSize: 16 },
  };

  const getTrendIcon = () => {
    switch (dir) {
      case 'up':
        return <TrendingUp size={sizeStyles[size].iconSize} />;
      case 'down':
        return <TrendingDown size={sizeStyles[size].iconSize} />;
      case 'flat':
      default:
        return <Minus size={sizeStyles[size].iconSize} />;
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: sizeStyles[size].padding,
        background: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: '6px',
        color: color.text,
        fontSize: sizeStyles[size].fontSize,
        fontWeight: '600',
        whiteSpace: 'nowrap',
        transition: 'all 200ms ease-out',
      }}
    >
      {getTrendIcon()}
      {showValue && (
        <span>
          {percentage !== undefined ? `${percentage}%` : `${value}`}
        </span>
      )}
      {label && <span style={{ fontSize: `${sizeStyles[size].fontSize}px`, opacity: 0.8 }}>{label}</span>}
    </div>
  );
}
