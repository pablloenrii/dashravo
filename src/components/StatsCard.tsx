interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  onClick?: () => void;
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20',
  green: 'from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20',
  purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20',
  orange: 'from-orange-500 to-orange-600 bg-orange-50 dark:bg-orange-900/20',
  red: 'from-red-500 to-red-600 bg-red-50 dark:bg-red-900/20',
};

export function StatsCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  onClick,
}: StatsCardProps) {
  const gradientClass = colorClasses[color];

  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700
        p-6 transition-all duration-300 hover-lift
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </h3>
            {trend && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
                <span>{trend.percentage}%</span>
              </div>
            )}
          </div>
        </div>

        <div className={`
          w-16 h-16 rounded-xl bg-gradient-to-br ${gradientClass}
          flex items-center justify-center text-3xl
          shadow-lg
        `}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className={`text-xs font-medium ${
          trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {trend.direction === 'up' ? '↑ Crescimento' : '↓ Redução'} vs período anterior
        </div>
      )}
    </div>
  );
}
