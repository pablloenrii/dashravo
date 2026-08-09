/**
 * RAVO OS — Métricas comerciais do CRM
 *
 * Todo o cálculo de indicadores fica aqui (fora da UI) para poder ser
 * recalculado por mês e comparado entre períodos.
 *
 * Convenção de recorte temporal:
 * - lead criado   → `created_at` (entrada no funil)
 * - ganho/perdido → `updated_at` (momento do desfecho)
 * - pipeline aberto → snapshot: criado até o fim do mês e ainda em aberto
 */

import { ContactData } from '@/hooks/usePagesQueries';
import { MonthKey, monthEnd, toMonthKey } from '@/contexts/PeriodContext';
import { chart, text, semantic } from '@/constants/theme';

export interface Stage {
  key: string;
  prob: number;
  color: string;
}

export const STAGES: Stage[] = [
  { key: 'Novo Lead', prob: 0.10, color: text.faint },
  { key: 'Contato Feito', prob: 0.25, color: chart.line },
  { key: 'Qualificado', prob: 0.50, color: chart.light },
  { key: 'Proposta', prob: 0.65, color: chart.line },
  { key: 'Negociação', prob: 0.80, color: text.tertiary },
  { key: 'Ganho', prob: 1.00, color: chart.revenue },
  { key: 'Perdido', prob: 0.00, color: semantic.danger },
];

export const STAGE_MAP: Record<string, Stage> = Object.fromEntries(
  STAGES.map((s) => [s.key, s] as const)
);

export const OPEN_KEYS = ['Novo Lead', 'Contato Feito', 'Qualificado', 'Proposta', 'Negociação'];
export const isOpen = (etapa: string) => OPEN_KEYS.includes(etapa);
export const ROT_DAYS = 14;

export const daysSince = (iso?: string | null) =>
  iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)) : 0;

/** Diferença em dias entre duas datas ISO (>= 0) */
function daysBetween(startIso?: string, endIso?: string): number {
  if (!startIso || !endIso) return 0;
  const a = new Date(startIso).getTime();
  const b = new Date(endIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.floor((b - a) / 86400000));
}

export interface CrmMetrics {
  /** Deals no recorte do período (para listagens contextuais) */
  novosLeads: ContactData[];
  ganhos: ContactData[];
  perdidos: ContactData[];
  abertos: ContactData[];

  receitaGanha: number;
  pipelineAberto: number;
  forecast: number;
  winRate: number;
  ticketMedio: number;
  cicloMedio: number;
  parados: number;
  novosLeadsCount: number;
  /** Taxa de conversão lead → ganho no período */
  conversao: number;
}

/**
 * Calcula todas as métricas. Quando `month` é null, considera todo o histórico.
 */
export function computeCrmMetrics(all: ContactData[], month: MonthKey | null): CrmMetrics {
  const inMonth = (iso?: string) => {
    if (month === null) return true;
    if (!iso) return false;
    const d = new Date(iso);
    return !Number.isNaN(d.getTime()) && toMonthKey(d) === month;
  };

  const novosLeads = all.filter((c) => inMonth(c.created_at));
  const ganhos = all.filter((c) => c.etapa === 'Ganho' && inMonth(c.updated_at));
  const perdidos = all.filter((c) => c.etapa === 'Perdido' && inMonth(c.updated_at));

  // Pipeline aberto: snapshot do fim do mês (criado até lá e ainda em aberto).
  const limite = month === null ? null : monthEnd(month).getTime();
  const abertos = all.filter((c) => {
    if (!isOpen(c.etapa)) return false;
    if (limite === null) return true;
    const criado = c.created_at ? new Date(c.created_at).getTime() : 0;
    return criado <= limite;
  });

  const receitaGanha = ganhos.reduce((s, c) => s + c.valor, 0);
  const pipelineAberto = abertos.reduce((s, c) => s + c.valor, 0);
  const forecast = abertos.reduce((s, c) => s + c.valor * (STAGE_MAP[c.etapa]?.prob ?? 0), 0);

  const decididos = ganhos.length + perdidos.length;
  const winRate = decididos > 0 ? Math.round((ganhos.length / decididos) * 100) : 0;

  const ticketMedio = ganhos.length > 0
    ? receitaGanha / ganhos.length
    : (abertos.length > 0 ? pipelineAberto / abertos.length : 0);

  const cicloMedio = ganhos.length > 0
    ? Math.round(ganhos.reduce((s, c) => s + daysBetween(c.created_at, c.updated_at), 0) / ganhos.length)
    : 0;

  const parados = abertos.filter((c) => daysSince(c.updated_at) >= ROT_DAYS).length;

  const conversao = novosLeads.length > 0
    ? Math.round((ganhos.length / novosLeads.length) * 100)
    : 0;

  return {
    novosLeads, ganhos, perdidos, abertos,
    receitaGanha, pipelineAberto, forecast, winRate,
    ticketMedio, cicloMedio, parados,
    novosLeadsCount: novosLeads.length,
    conversao,
  };
}

export interface FunnelStep {
  etapa: string;
  quantidade: number;
  valor: number;
  /** % que passou da etapa anterior */
  conversaoEtapa: number;
  color: string;
}

/**
 * Funil por etapa: quantos leads do período alcançaram (ou passaram por) cada fase.
 * Como não há histórico de transições, usamos a posição atual como proxy — um deal
 * em "Proposta" necessariamente já passou por "Novo Lead" e "Qualificado".
 */
export function computeFunnel(deals: ContactData[]): FunnelStep[] {
  const ordem = [...OPEN_KEYS, 'Ganho'];
  const idxDe = (etapa: string) => ordem.indexOf(etapa);

  const steps = ordem.map((etapa) => {
    const alcancaram = deals.filter((c) => {
      const i = idxDe(c.etapa);
      // Perdido não conta como avanço; conta só onde parou.
      if (c.etapa === 'Perdido') return false;
      return i >= idxDe(etapa);
    });
    return {
      etapa,
      quantidade: alcancaram.length,
      valor: alcancaram.reduce((s, c) => s + c.valor, 0),
      conversaoEtapa: 0,
      color: STAGE_MAP[etapa]?.color ?? text.tertiary,
    };
  });

  for (let i = 0; i < steps.length; i++) {
    const anterior = i === 0 ? steps[0].quantidade : steps[i - 1].quantidade;
    steps[i].conversaoEtapa = anterior > 0 ? Math.round((steps[i].quantidade / anterior) * 100) : 0;
  }
  return steps;
}

export interface SourceRow {
  origem: string;
  leads: number;
  ganhos: number;
  receita: number;
  winRate: number;
}

/** Desempenho por canal de origem — onde o dinheiro realmente entra. */
export function computeBySource(deals: ContactData[]): SourceRow[] {
  const mapa = new Map<string, SourceRow>();

  for (const c of deals) {
    const origem = c.origem?.trim() || 'Não informado';
    const row = mapa.get(origem) ?? { origem, leads: 0, ganhos: 0, receita: 0, winRate: 0 };
    row.leads += 1;
    if (c.etapa === 'Ganho') {
      row.ganhos += 1;
      row.receita += c.valor;
    }
    mapa.set(origem, row);
  }

  const rows = [...mapa.values()];
  for (const r of rows) {
    r.winRate = r.leads > 0 ? Math.round((r.ganhos / r.leads) * 100) : 0;
  }
  return rows.sort((a, b) => b.receita - a.receita || b.leads - a.leads);
}
