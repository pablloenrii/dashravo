/**
 * RAVO OS — Seletor de métricas (chips toggle)
 * Usado na "Análise mês a mês" para ligar/desligar colunas.
 */

import { text, surface } from '@/constants/theme';

export interface MetricToggleOption {
  key: string;
  label: string;
  color: string;
}

export function MetricToggle({ metrics, selected, onChange }: {
  metrics: MetricToggleOption[];
  selected: string[];
  onChange: (keys: string[]) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }} role="group" aria-label="Selecionar métricas">
      {metrics.map((m) => {
        const active = selected.includes(m.key);
        return (
          <button
            key={m.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? selected.filter((k) => k !== m.key) : [...selected, m.key])}
            style={{
              padding: '5px 11px', borderRadius: '999px', cursor: 'pointer',
              border: `1px solid ${active ? m.color : surface.borderStrong}`,
              background: active ? `${m.color}1a` : 'transparent',
              color: active ? m.color : text.tertiary,
              fontSize: '11.5px', fontWeight: 600, lineHeight: 1,
              transition: 'all .15s ease',
            }}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
