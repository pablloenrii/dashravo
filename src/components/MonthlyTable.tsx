/**
 * RAVO OS — Análise mês a mês
 * Tabela comparativa de métricas por mês com colunas selecionáveis e destaque
 * para o mês selecionado no período global. Clicar numa linha seleciona o mês.
 */

import { MonthKey } from '@/contexts/PeriodContext';
import {
  MONTHLY_METRICS, DEFAULT_SELECTED,
  MonthlyMetricKey, MonthlyRow, summarize,
} from '@/utils/monthlyAnalysis';
import { MetricToggle } from '@/components/MetricToggle';
import { text, surface } from '@/constants/theme';

const ALL_METRICS = (Object.keys(MONTHLY_METRICS) as MonthlyMetricKey[]);

export interface MonthlyTableProps {
  rows: MonthlyRow[];
  /** Métricas ativas. Default: DEFAULT_SELECTED */
  selected?: MonthlyMetricKey[];
  onSelectedChange?: (keys: MonthlyMetricKey[]) => void;
  /** Chave canônica do mês a destacar (null = nenhum) */
  highlightedMonth?: MonthKey | null;
  onSelectMonth?: (m: MonthKey) => void;
  loading?: boolean;
}

export function MonthlyTable({
  rows, selected = DEFAULT_SELECTED, onSelectedChange,
  highlightedMonth = null, onSelectMonth, loading = false,
}: MonthlyTableProps) {
  const keys = selected.filter((k) => k in MONTHLY_METRICS) as MonthlyMetricKey[];
  const defs = keys.map((k) => MONTHLY_METRICS[k]);
  const noData = !loading && rows.length === 0;

  return (
    <div>
      {onSelectedChange && (
        <div style={{ marginBottom: '12px' }}>
          <MetricToggle
            metrics={ALL_METRICS.map((k) => ({ key: k, label: MONTHLY_METRICS[k].label, color: MONTHLY_METRICS[k].color }))}
            selected={keys}
            onChange={(ks) => onSelectedChange(ks as MonthlyMetricKey[])}
          />
        </div>
      )}

      <div style={{
        border: `1px solid ${surface.border}`,
        borderRadius: '12px', overflowX: 'auto', overflowY: 'hidden', background: surface.card,
        WebkitOverflowScrolling: 'touch',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: `1px solid ${surface.borderStrong}` }}>
              <th style={thStyle}>
                <span style={{ color: text.tertiary }}>Mês</span>
              </th>
              {defs.map((d) => (
                <th key={d.label} style={{ ...thStyle, textAlign: 'right', color: d.color }}>
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const highlighted = !!row.key && row.key === highlightedMonth;
              const clickable = !!onSelectMonth && !!row.key;
              return (
                <tr
                  key={row.key ?? row.mes}
                  onClick={clickable ? () => onSelectMonth(row.key as MonthKey) : undefined}
                  style={{
                    borderBottom: `1px solid ${surface.border}`,
                    background: highlighted ? surface.hover : 'transparent',
                    cursor: clickable ? 'pointer' : 'default',
                  }}
                >
                  <td style={tdStyle}>
                    <span style={{
                      color: highlighted ? text.highlight : text.secondary,
                      fontWeight: highlighted ? 650 : 500,
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                    }}>
                      {row.mes}
                      {highlighted && (
                        <span style={{ fontSize: '10px', fontWeight: 650, color: text.label }}>
                          · selecionado
                        </span>
                      )}
                    </span>
                  </td>
                  {defs.map((d, i) => {
                    const v = row[keys[i]] as number | undefined;
                    return (
                      <td key={d.label} style={{ ...tdStyle, textAlign: 'right' }}>
                        {typeof v === 'number' && Number.isFinite(v)
                          ? <span style={{ color: text.primary, fontWeight: 500 }}>{d.format(v)}</span>
                          : <span style={{ color: text.label }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr style={{ background: surface.input }}>
                <td style={{ ...tdStyle, fontWeight: 650, color: text.muted }}>
                  Total / média
                </td>
                {keys.map((k) => {
                  const d = MONTHLY_METRICS[k];
                  const total = summarize(rows, k);
                  return (
                    <td key={d.label} style={{ ...tdStyle, textAlign: 'right' }}>
                      {total !== undefined
                        ? <span style={{ color: d.color, fontWeight: 650 }}>{d.format(total)}</span>
                        : <span style={{ color: text.label }}>—</span>}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>

        {noData && (
          <div style={{ padding: '28px', textAlign: 'center', color: text.tertiary, fontSize: '13px' }}>
            Sem dados para o período selecionado.
          </div>
        )}
        {loading && rows.length === 0 && (
          <div style={{ padding: '28px', textAlign: 'center', color: text.tertiary, fontSize: '13px' }}>
            Carregando análise…
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '9px 14px', fontSize: '11px', fontWeight: 650,
  letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '9px 14px', whiteSpace: 'nowrap',
};
