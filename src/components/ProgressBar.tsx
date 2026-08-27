
import { useThemeTokens } from '@/hooks/useThemeTokens';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  animated?: boolean;
  showValue?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  color,
  animated = true,
  showValue = true,
}: ProgressBarProps) {
  const { chart, text, surface } = useThemeTokens();
  const resolvedColor = color ?? chart.light;
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div style={{ width: '100%' }}>
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '13px',
          }}
        >
          {label && <span style={{ color: text.secondary, fontWeight: '500' }}>{label}</span>}
          {showValue && (
            <span style={{ color: text.highlight, fontWeight: '600' }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        style={{
          width: '100%',
          height: '8px',
          background: surface.border,
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${resolvedColor}, ${resolvedColor}DD)`,
            borderRadius: '4px',
            transition: animated ? 'width 800ms cubic-bezier(0.4, 0, 0.2, 1)' : 'width 300ms ease-out',
            boxShadow: `0 0 16px ${resolvedColor}40`,
            position: 'relative',
          }}
        >
          {animated && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                animation: 'shimmer 2s infinite',
              }}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
