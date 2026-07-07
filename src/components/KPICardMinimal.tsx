import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardMinimalProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  color?: string;
}

/**
 * RAVO v5.0 - Premium KPI Card
 * Enterprise-grade with refined aesthetics
 */
export function KPICardMinimal({
  title,
  value,
  unit,
  icon,
  trend,
  color = '#EA6A1B',
}: KPICardMinimalProps) {
  return (
    <div
      style={{
        background: 'rgba(11, 14, 25, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        padding: '14px',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(17, 21, 43, 0.8)';
        el.style.borderColor = 'rgba(234, 106, 27, 0.3)';
        el.style.transform = 'translateY(-2px)';
        el.style.boxShadow = 'inset 0 0 0 1px rgba(234, 106, 27, 0.15), 0 0 32px rgba(234, 106, 27, 0.15), 0 8px 32px rgba(0, 0, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(11, 14, 25, 0.7)';
        el.style.borderColor = 'rgba(255,255,255,0.1)';
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0, 0, 0, 0.3)';
      }}
    >
      {/* Subtle top border accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, ${color}00, ${color}40, ${color}00)`,
        }}
      />

      {/* Header: Title + Icon */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: '500',
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            margin: 0,
            lineHeight: '1.4',
          }}
        >
          {title}
        </span>
        {icon && (
          <span
            style={{
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              opacity: 0.8,
            }}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Value Section */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#EBEBF0',
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </span>
          {unit && (
            <span style={{ color: '#6B7280', fontSize: '12px', fontWeight: '400' }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Trend */}
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {trend.direction === 'up' ? (
            <>
              <TrendingUp
                style={{
                  width: '13px',
                  height: '13px',
                  color: '#10B981',
                  strokeWidth: 2.5,
                }}
              />
              <span
                style={{
                  color: '#10B981',
                  fontSize: '12px',
                  fontWeight: '600',
                  lineHeight: '1',
                }}
              >
                +{trend.percentage}%
              </span>
            </>
          ) : (
            <>
              <TrendingDown
                style={{
                  width: '13px',
                  height: '13px',
                  color: '#EF4444',
                  strokeWidth: 2.5,
                }}
              />
              <span
                style={{
                  color: '#EF4444',
                  fontSize: '12px',
                  fontWeight: '600',
                  lineHeight: '1',
                }}
              >
                -{trend.percentage}%
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
