/**
 * RAVO OS — Análise mensal (Dashboard)
 *
 * Consolida as séries por mês (Financeiro, MRR/Churn e CRM) em uma única linha
 * mensal e define o registro de métricas que o usuário pode ligar/desligar na
 * "Análise mês a mês". Lógica pura para ser testável.
 */

import { MonthKey } from '@/contexts/PeriodContext';
import { fmtMoney, pctChange } from '@/utils/format';
import { chart, semantic, text } from '@/constants/theme';

export interface FinanceSlice {
  mes: string;
  receita: number;
  despesa: number;
  lucro: number;
}

export interface MRRSlice {
  mes: string;
  mrr: number;
}

/** Série de MRR com ARR (retornada por useMRRData) */
export interface MrrFullSlice {
  mes: string;
  mrr: number;
  arr: number;
}

export interface ChurnSlice {
  mes: string;
  churn_rate: number;
  nrr: number;
}

export interface ContactSlice {
  mes: string;
  novos: number;
  ativos: number;
}

export type MonthlyMetricKey =
  | 'receita' | 'despesa' | 'lucro' | 'margem'
  | 'mrr' | 'churn' | 'nrr' | 'novos' | 'ativos';

export interface MonthlyRow {
  /** Chave canônica do mês ('YYYY-MM'), quando disponível */
  key?: MonthKey;
  /** Rótulo curto do mês (ex.: 'Jul') */
  mes: string;
  receita?: number;
  despesa?: number;
  lucro?: number;
  margem?: number;
  mrr?: number;
  churn?: number;
  nrr?: number;
  novos?: number;
  ativos?: number;
}

export interface MonthlyMetric {
  label: string;
  color: string;
  /** 'money' | 'percent' | 'count' — define como somar na linha de total */
  kind: 'money' | 'percent' | 'count';
  format: (v: number) => string;
}

export const MONTHLY_METRICS: Record<MonthlyMetricKey, MonthlyMetric> = {
  receita: { label: 'Receita', color: chart.revenue, kind: 'money', format: fmtMoney },
  despesa: { label: 'Investimento', color: chart.line, kind: 'money', format: fmtMoney },
  lucro: { label: 'Lucro', color: text.highlight, kind: 'money', format: fmtMoney },
  margem: {
    label: 'Margem', color: chart.success, kind: 'percent',
    format: (v) => `${v.toFixed(1)}%`,
  },
  mrr: { label: 'MRR', color: chart.light, kind: 'money', format: fmtMoney },
  churn: {
    label: 'Churn', color: semantic.danger, kind: 'percent',
    format: (v) => `${v.toFixed(1)}%`,
  },
  nrr: {
    label: 'NRR', color: semantic.successStrong, kind: 'percent',
    format: (v) => `${v.toFixed(0)}%`,
  },
  novos: { label: 'Novos leads', color: semantic.info, kind: 'count', format: (v) => `${Math.round(v)}` },
  ativos: { label: 'Clientes ativos', color: semantic.purple, kind: 'count', format: (v) => `${Math.round(v)}` },
};

/** Métricas ativas por padrão na análise mês a mês */
export const DEFAULT_SELECTED: MonthlyMetricKey[] = ['receita', 'despesa', 'lucro', 'margem'];

/**
 * Une as séries mensais pela chave `mes`. A margem é derivada de lucro/receita.
 * `keys` opcional anexa a chave canônica de cada mês (alinhada por índice) para
 * permitir destaque e clique na tabela.
 */
export function mergeMonthly(
  finance: FinanceSlice[],
  mrr: MRRSlice[],
  churn: ChurnSlice[],
  contacts: ContactSlice[],
  keys?: MonthKey[]
): MonthlyRow[] {
  const map = new Map<string, MonthlyRow>();
  const order: string[] = [];
  const ensure = (mes: string): MonthlyRow => {
    let row = map.get(mes);
    if (!row) {
      row = { mes };
      map.set(mes, row);
      order.push(mes);
    }
    return row;
  };

  finance.forEach((r) => {
    const row = ensure(r.mes);
    row.receita = r.receita;
    row.despesa = r.despesa;
    row.lucro = r.lucro;
    if (r.receita > 0) row.margem = (r.lucro / r.receita) * 100;
  });

  mrr.forEach((r) => { ensure(r.mes).mrr = r.mrr; });
  churn.forEach((r) => {
    const row = ensure(r.mes);
    row.churn = r.churn_rate;
    row.nrr = r.nrr;
  });
  contacts.forEach((r) => {
    const row = ensure(r.mes);
    row.novos = r.novos;
    row.ativos = r.ativos;
  });

  const rows = order.map((mes) => map.get(mes) as MonthlyRow);
  if (keys) rows.forEach((r, i) => { r.key = keys[i]; });
  return rows;
}

/** Soma uma métrica monetária/de contagem (ou média, para percentuais) na tabela */
export function summarize(rows: MonthlyRow[], metric: MonthlyMetricKey): number | undefined {
  const def = MONTHLY_METRICS[metric];
  const values = rows
    .map((r) => r[metric])
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (values.length === 0) return undefined;
  if (def.kind === 'percent') {
    return values.reduce((s, v) => s + v, 0) / values.length;
  }
  return values.reduce((s, v) => s + v, 0);
}

// ============================================================================
// Snapshot de um mês (painel "Métricas do mês")
// ============================================================================

/** Valores consolidados de um único mês (o mês alvo ou o anterior) */
export interface MonthValues {
  receita: number;
  despesa: number;
  lucro: number;
  margem: number;
  mrr: number;
  arr: number;
  churn: number;
  nrr: number;
  novos: number;
  ativos: number;
}

/** Quais métricas têm delta calculado (todas exceto margem — diferença em pp) */
export type MonthDeltaKey = Exclude<keyof MonthValues, 'margem'>;

export interface MonthSnapshot {
  /** Chave canônica do mês alvo, quando conhecida */
  key?: MonthKey;
  /** Rótulo curto do mês alvo (ex.: 'Jul') */
  mes: string;
  /** Valores do mês alvo — último item das séries (janela terminando nele) */
  current: MonthValues;
  /** Valores do mês anterior, quando a janela tem item de comparação */
  previous?: MonthValues;
  /** Variação % de cada métrica vs mês anterior */
  deltas: Partial<Record<MonthDeltaKey, number>>;
  /** Diferença da margem em pontos percentuais vs mês anterior */
  deltaMargem?: number;
}

const last = <T,>(a: T[]): T | undefined => a[a.length - 1];
const secondLast = <T,>(a: T[]): T | undefined => a[a.length - 2];

function toValues(
  fin?: FinanceSlice,
  mrr?: MrrFullSlice,
  churn?: ChurnSlice,
  contacts?: ContactSlice,
): MonthValues {
  const receita = fin?.receita ?? 0;
  const despesa = fin?.despesa ?? 0;
  const lucro = fin?.lucro ?? receita - despesa;
  return {
    receita,
    despesa,
    lucro,
    margem: receita > 0 ? (lucro / receita) * 100 : 0,
    mrr: mrr?.mrr ?? 0,
    arr: mrr?.arr ?? 0,
    churn: churn?.churn_rate ?? 0,
    nrr: churn?.nrr ?? 0,
    novos: contacts?.novos ?? 0,
    ativos: contacts?.ativos ?? 0,
  };
}

const DELTA_KEYS: MonthDeltaKey[] = [
  'receita', 'despesa', 'lucro', 'mrr', 'arr', 'churn', 'nrr', 'novos', 'ativos',
];

/**
 * Consolida o mês alvo a partir das séries mensais (janela terminando no mês
 * escolhido): o último item é o mês atual, o penúltimo o mês anterior. Margem é
 * derivada de lucro/receita; deltas usam pctChange (margem em pontos percentuais).
 */
export function monthSnapshot(
  finance: FinanceSlice[],
  mrr: MrrFullSlice[],
  churn: ChurnSlice[],
  contacts: ContactSlice[],
  key?: MonthKey,
): MonthSnapshot {
  const curFin = last(finance), curMrr = last(mrr), curChurn = last(churn), curCt = last(contacts);
  const current = toValues(curFin, curMrr, curChurn, curCt);
  const hasPrev =
    finance.length >= 2 || mrr.length >= 2 || churn.length >= 2 || contacts.length >= 2;
  const previous = hasPrev
    ? toValues(secondLast(finance), secondLast(mrr), secondLast(churn), secondLast(contacts))
    : undefined;

  const deltas: Partial<Record<MonthDeltaKey, number>> = {};
  let deltaMargem: number | undefined;
  if (previous) {
    DELTA_KEYS.forEach((k) => {
      const d = pctChange(current[k], previous[k]);
      if (d !== undefined) deltas[k] = d;
    });
    // margem: variação em pontos percentuais (ex.: 50% -> 60% = +10pp).
    // Só é significativa quando há receita em ambos os meses.
    if (current.receita > 0 && previous.receita > 0) {
      deltaMargem = current.margem - previous.margem;
    }
  }

  return {
    key,
    mes: currentMes(finance, mrr, churn, contacts),
    current,
    previous,
    deltas,
    deltaMargem,
  };
}

function currentMes(
  finance: FinanceSlice[], mrr: MrrFullSlice[], churn: ChurnSlice[], contacts: ContactSlice[],
): string {
  return (
    last(finance)?.mes ?? last(mrr)?.mes ?? last(churn)?.mes ?? last(contacts)?.mes ?? ''
  );
}
