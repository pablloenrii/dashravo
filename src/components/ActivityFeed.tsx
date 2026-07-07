import { ReactNode } from 'react';

export interface ActivityItem {
  id: string;
  icon: ReactNode;
  title: string;
  description?: string;
  timestamp: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

const colorClasses = {
  primary: 'bg-[rgba(255,98,0,0.1)] text-[#FF6200]',
  success: 'bg-[rgba(34,197,94,0.1)] text-[#22C55E]',
  warning: 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B]',
  danger: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]',
  info: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6]',
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold text-var(--text-primary) mb-6">Atividade em Tempo Real</h3>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-var(--text-tertiary)">Nenhuma atividade recente</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className="flex gap-4">
              {/* Timeline Line */}
              {index !== items.length - 1 && (
                <div className="flex flex-col items-center">
                  <div className={`${colorClasses[item.color || 'primary']} p-2 rounded-lg`}>
                    {item.icon}
                  </div>
                  <div className="w-0.5 h-12 bg-var(--border-primary) mt-2"></div>
                </div>
              )}
              {index === items.length - 1 && (
                <div className={`${colorClasses[item.color || 'primary']} p-2 rounded-lg flex-shrink-0`}>
                  {item.icon}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 pt-1.5">
                <p className="text-sm font-medium text-var(--text-primary)">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-var(--text-tertiary) mt-0.5">
                    {item.description}
                  </p>
                )}
                <p className="text-xs text-var(--text-tertiary) mt-2">
                  {item.timestamp}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
