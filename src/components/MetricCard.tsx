/**
 * RAVO OS — Card de métrica comercial
 * Valor + variação vs período anterior + contexto (meta, sublabel).
 */

import { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  /** Variação percentual vs período anterior. undefined = não exibe. */
  deltaPct?: number;
  /** Em métricas como "deals parados" ou "ciclo", subir é ruim. */
  invertDelta?: boolean;
  sublabel?: string;
  /** 0–100: desenha uma barra fina de progresso (ex.: atingimento de meta) */
  progress?: number;
  loading?: boolean;
  onClick?: () => void;
}

const GOOD = '#3FB950';
const BAD = '#EF4444';
const NEUTRAL = '#6E6E6E';

export function MetricCard({
  label, value, icon, deltaPct, invertDelta = false,
  sublabel, progress, loading = false, onClick,
}: MetricCardProps) {
  const hasDelta = deltaPct !== undefined && Number.isFinite(deltaPct);
  const flat = hasDelta && Math.abs(deltaPct as number) < 0.5;
  const positive = hasDelta && (deltaPct as number) > 0;
  const good = invertDelta ? !positive : positive;
  const deltaColor = !hasDelta || flat ? NEUTRAL : good ? GOOD : BAD;
  const DeltaIcon = flat ? Minus : positive ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      onClick={onClick}
      style={{
        background: '#0F0F0F',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color .15s ease, background .15s ease',
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
      }}
      onMouseLeave={(e) => {
        if (!onClick) return;
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{
          fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.05em',
          textTransform: 'uppercase', color: '#8A8F98',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{label}</span>
        {icon && <span style={{ color: '#5B616E', display: 'flex', flexShrink: 0 }}>{icon}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '23px', fontWeight: 650, letterSpacing: '-0.025em',
          color: loading ? '#3A3A3A' : '#F2F2F3', lineHeight: 1.1,
        }}>
          {loading ? '—' : value}
        </span>
        {!loading && hasDelta && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '2px',
            fontSize: '11.5px', fontWeight: 650, color: deltaColor,
          }}>
            <DeltaIcon size={12} strokeWidth={2.5} />
            {flat ? '0%' : `${Math.abs(deltaPct as number).toFixed(0)}%`}
          </span>
        )}
      </div>

      {progress !== undefined && !loading && (
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.max(0, Math.min(100, progress))}%`, height: '100%',
            background: progress >= 100 ? GOOD : progress >= 70 ? '#EDEDED' : '#6E6E6E',
            borderRadius: '2px', transition: 'width .5s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      )}

      {sublabel && (
        <span style={{ fontSize: '11px', color: '#6E6E6E', lineHeight: 1.3 }}>{sublabel}</span>
      )}
    </div>
  );
}

/** Variação percentual entre dois valores. undefined quando a base é 0. */
export function pctChange(current: number, previous: number): number | undefined {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return undefined;
  return ((current - previous) / Math.abs(previous)) * 100;
}
