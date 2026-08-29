/**
 * RAVO OS — Primitivos de hierarquia visual
 *
 * Extraído do Dashboard executivo para ser reusado em qualquer tela que
 * precise da mesma linguagem: um rótulo de seção ancora o bloco, um ou dois
 * HeroStats carregam o número que decide, e um Panel neutro abriga o resto
 * (tabela, gráfico, lista). Isso existe para evitar o antipadrão de grades
 * de N cards iguais — "12 KPIs do mesmo tamanho não priorizam nada".
 *
 * Usado por Dashboard.tsx e CRMPage.tsx — qualquer ajuste visual aqui vale
 * para as duas telas ao mesmo tempo.
 */

import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useThemeTokens } from '@/hooks/useThemeTokens';

/** Rótulo de seção — âncora de leitura entre blocos. */
export function SectionLabel({
  icon: Icon, title, hint,
}: { icon: LucideIcon; title: string; hint: string }) {
  const { text, surface } = useThemeTokens();
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: '10px',
      margin: '32px 0 14px', paddingBottom: '10px',
      borderBottom: `1px solid ${surface.divider}`,
    }}>
      <Icon size={14} style={{ color: text.tertiary, alignSelf: 'center' }} />
      <span style={{
        fontSize: '11px', fontWeight: 650, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: text.secondary,
      }}>{title}</span>
      <span style={{ fontSize: '12px', color: text.faint }}>{hint}</span>
    </div>
  );
}

/** Cartão de destaque: o número que carrega a seção. */
export function HeroStat({
  label, value, sub, delta, tone = 'neutral',
}: {
  label: string; value: string; sub?: string;
  delta?: number; tone?: 'positive' | 'negative' | 'warning' | 'neutral';
}) {
  const { text, surface, semantic } = useThemeTokens();
  const toneColor = {
    positive: semantic.success, negative: semantic.danger,
    warning: semantic.warning, neutral: text.primary,
  }[tone];

  return (
    <div style={{
      background: surface.card, border: `1px solid ${surface.border}`,
      borderRadius: '12px', padding: '18px 20px',
    }}>
      <div style={{
        fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em',
        textTransform: 'uppercase', color: text.tertiary, marginBottom: '10px',
      }}>{label}</div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{
          fontSize: '28px', fontWeight: 660, letterSpacing: '-0.025em',
          color: toneColor, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>{value}</span>

        {delta !== undefined && Number.isFinite(delta) && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '2px',
            fontSize: '12px', fontWeight: 600,
            color: delta >= 0 ? semantic.success : semantic.danger,
          }}>
            {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>

      {sub && (
        <div style={{ fontSize: '12px', color: text.muted, marginTop: '8px' }}>{sub}</div>
      )}
    </div>
  );
}

/** Barra de proporção horizontal — usada em mix de receita e concentração de clientes. */
export function ProportionBar({
  segments,
  formatValue,
}: {
  segments: { label: string; value: number; pct: number; color: string }[];
  /** Como formatar o valor de cada segmento à direita (padrão: apenas o %). */
  formatValue?: (value: number) => string;
}) {
  const { text, surface } = useThemeTokens();
  if (segments.length === 0) return null;

  return (
    <div>
      <div style={{
        display: 'flex', height: '10px', borderRadius: '5px',
        overflow: 'hidden', background: surface.elevated, marginBottom: '14px',
      }}>
        {segments.map((s) => (
          <div key={s.label} style={{ width: `${s.pct}%`, background: s.color }} title={s.label} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {segments.map((s) => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '2px',
              background: s.color, flexShrink: 0,
            }} />
            <span style={{ color: text.secondary, flex: 1 }}>{s.label}</span>
            {formatValue && (
              <span style={{ color: text.primary, fontVariantNumeric: 'tabular-nums' }}>
                {formatValue(s.value)}
              </span>
            )}
            <span style={{
              color: text.faint, width: '46px', textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
            }}>{s.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Painel neutro que abriga gráficos, tabelas ou listas. */
export function Panel({
  title, hint, children, span = 1,
}: { title: string; hint?: string; children: React.ReactNode; span?: number }) {
  const { text, surface } = useThemeTokens();
  return (
    <div style={{
      background: surface.card, border: `1px solid ${surface.border}`,
      borderRadius: '12px', padding: '18px 20px',
      gridColumn: `span ${span}`, minWidth: 0,
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 620, color: text.primary }}>{title}</div>
        {hint && (
          <div style={{ fontSize: '12px', color: text.faint, marginTop: '3px' }}>{hint}</div>
        )}
      </div>
      {children}
    </div>
  );
}

/** Grade responsiva padrão para HeroStats e Panels — 1 a 4 colunas conforme a largura. */
export const heroGrid: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px',
};

/** Grade um pouco mais larga, para painéis com gráfico/tabela. */
export const panelGrid: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px',
};
