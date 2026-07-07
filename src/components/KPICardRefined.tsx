import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardRefinedProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
}

/**
 * Refined KPI Card — Professional palette
 * Dark gray background, minimal orange accent
 */
export function KPICardRefined({
  title,
  value,
  unit,
  icon,
  trend,
}: KPICardRefinedProps) {
  return (
    <div
      style={{
        background: '#0F172A',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '24px',
        transition: 'all 300ms ease-out',
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = '#1E293B';
        el.style.borderColor = 'rgba(255,255,255,0.12)';
        el.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = '#0F172A';
        el.style.borderColor = 'rgba(255,255,255,0.08)';
        el.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: '16px',
        }}
      >
        <p
          style={{
            color: '#94A3B8',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}
        >
          {title}
        </p>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(255, 98, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FF6200',
            fontSize: '18px',
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: '700',
              color: '#E2E8F0',
              lineHeight: '1.2',
            }}
          >
            {value}
          </h3>
          {unit && (
            <span style={{ color: '#94A3B8', fontSize: '14px' }}>{unit}</span>
          )}
        </div>
      </div>

      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {trend.direction === 'up' ? (
            <>
              <TrendingUp
                className="w-4 h-4"
                style={{ color: '#10B981' }}
              />
              <span
                style={{
                  color: '#10B981',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                +{trend.percentage}% vs last month
              </span>
            </>
          ) : (
            <>
              <TrendingDown
                className="w-4 h-4"
                style={{ color: '#EF4444' }}
              />
              <span
                style={{
                  color: '#EF4444',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                -{trend.percentage}% vs last month
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
