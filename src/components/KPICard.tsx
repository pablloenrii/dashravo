import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
    timeframe?: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  description?: string;
  onClick?: () => void;
}

const colorClasses = {
  primary: {
    bg: 'bg-[rgba(255,98,0,0.1)]',
    text: 'text-[#FF6200]',
    icon: 'text-[#FF6200]',
  },
  success: {
    bg: 'bg-[rgba(34,197,94,0.1)]',
    text: 'text-[#22C55E]',
    icon: 'text-[#22C55E]',
  },
  warning: {
    bg: 'bg-[rgba(245,158,11,0.1)]',
    text: 'text-[#F59E0B]',
    icon: 'text-[#F59E0B]',
  },
  danger: {
    bg: 'bg-[rgba(239,68,68,0.1)]',
    text: 'text-[#EF4444]',
    icon: 'text-[#EF4444]',
  },
  info: {
    bg: 'bg-[rgba(59,130,246,0.1)]',
    text: 'text-[#3B82F6]',
    icon: 'text-[#3B82F6]',
  },
};

export function KPICard({
  title,
  value,
  unit,
  icon,
  trend,
  color = 'primary',
  description,
  onClick,
}: KPICardProps) {
  const colors = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className="card p-6 text-left hover:shadow-lg transition-all duration-200 group w-full"
    >
      {/* Header with Icon */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-var(--text-tertiary) text-xs font-semibold uppercase tracking-wider mb-1">
            {title}
          </p>
        </div>
        <div className={`${colors.bg} p-2.5 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <div className={`${colors.icon} w-5 h-5`}>{icon}</div>
        </div>
      </div>

      {/* Value */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-var(--text-primary)">{value}</h3>
          {unit && <span className="text-var(--text-secondary) text-sm font-medium">{unit}</span>}
        </div>
      </div>

      {/* Trend + Description */}
      {(trend || description) && (
        <div className="flex items-center justify-between pt-3 border-t border-var(--border-primary)">
          {trend && (
            <div className="flex items-center gap-1.5">
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4 text-var(--success)" strokeWidth={2} />
              ) : (
                <TrendingDown className="w-4 h-4 text-var(--danger)" strokeWidth={2} />
              )}
              <span
                className={`text-xs font-semibold ${
                  trend.direction === 'up' ? 'text-var(--success)' : 'text-var(--danger)'
                }`}
              >
                {trend.direction === 'up' ? '+' : '-'}
                {trend.percentage}%
              </span>
              {trend.timeframe && (
                <span className="text-xs text-var(--text-tertiary)">
                  vs {trend.timeframe}
                </span>
              )}
            </div>
          )}
          {description && !trend && (
            <p className="text-xs text-var(--text-tertiary)">{description}</p>
          )}
        </div>
      )}
    </button>
  );
}
