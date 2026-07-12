import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const colorClasses = {
  primary: 'from-orange-500 to-orange-600 bg-orange-50 dark:bg-orange-950/30',
  success: 'from-green-500 to-green-600 bg-green-50 dark:bg-green-950/30',
  warning: 'from-yellow-500 to-yellow-600 bg-yellow-50 dark:bg-yellow-950/30',
  danger: 'from-red-500 to-red-600 bg-red-50 dark:bg-red-950/30',
  info: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-950/30',
};

export const textColorMap = {
  primary: 'text-orange-600 dark:text-orange-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
};

export function StatsCardPremium({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
}: StatsCardProps) {
  const gradientClass = colorClasses[color];

  return (
    <div className="card p-6 bg-var(--bg-primary) hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-label mb-2">{title}</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-bold">
              {value}
            </h3>
            {trend && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
                <span>{trend.percentage}%</span>
              </div>
            )}
          </div>
        </div>

        <div className={`
          w-12 h-12 rounded-lg bg-gradient-to-br ${gradientClass}
          flex items-center justify-center flex-shrink-0
        `}>
          <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
        </div>
      </div>

      {trend && (
        <p className={`text-xs font-medium ${
          trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.percentage)}% vs mês anterior
        </p>
      )}
    </div>
  );
}
