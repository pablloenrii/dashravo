import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardPremiumProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  color?: string;
}

export function KPICardPremium({
  title,
  value,
  unit,
  icon,
  trend,
  color = '#FF6200',
}: KPICardPremiumProps) {
  return (
    <div
      style={{
        background: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(15,23,42,0.7)';
        el.style.borderColor = `${color}40`;
        el.style.boxShadow = `0 0 30px ${color}20`;
        el.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(15,23,42,0.5)';
        el.style.borderColor = 'rgba(255,255,255,0.1)';
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
      }}
    >
      {/* Glow effect background */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
          <p style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>
            {title}
          </p>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color
            }}
          >
            {icon}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: 'white' }}>
              {value}
            </h3>
            {unit && <span style={{ color: '#94A3B8', fontSize: '14px' }}>{unit}</span>}
          </div>
        </div>

        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {trend.direction === 'up' ? (
              <>
                <TrendingUp className="w-4 h-4" style={{ color: '#22C55E' }} />
                <span style={{ color: '#22C55E', fontSize: '13px', fontWeight: '600' }}>
                  +{trend.percentage}% vs last month
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4" style={{ color: '#EF4444' }} />
                <span style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600' }}>
                  -{trend.percentage}% vs last month
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
