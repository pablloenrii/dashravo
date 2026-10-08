/**
 * RAVO OS — Hooks da página de Insights (receita recorrente, faturas do mês, cancelados)
 *
 * RPCs em ravo-backend/sql/19_insights.sql. Colunas NUMERIC chegam como string no
 * JSON do PostgREST — toda leitura numérica passa por `toNumber`. Métricas que não
 * se aplicam (ex.: LTV sem nenhum churn, CAC sem gasto comercial) chegam `null` e
 * ficam `null` aqui: a tela mostra "—" em vez de inventar um zero.
 */

import { sb as supabase } from '@/services/supabase';
import { useSupabaseQuery, toNumber, QueryResult } from './useSupabaseQuery';
import type { MonthKey } from '@/contexts/PeriodContext';

const rows = (raw: unknown): Record<string, unknown>[] =>
  Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];

const nullable = (v: unknown): number | null => (v === null || v === undefined ? null : toNumber(v));

/** Último dia do mês 'YYYY-MM' em ISO (YYYY-MM-DD). */
export function lastDayISO(month: MonthKey): string {
  const [y, m] = month.split('-').map(Number);
  return `${month}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`;
}

/* ============================================================================
   MRR / ARR / churn / NRR / LTV / CAC — um registro por mês
   ============================================================================ */

export interface InsightMes {
  mes: string;
  mrr: number;
  arr: number;
  novos_mrr: number;
  expansao_mrr: number;
  contracao_mrr: number;
  churn_mrr: number;
  net_new_mrr: number;
  clientes_ini: number;
  clientes_fim: number;
  clientes_novos: number;
  clientes_churn: number;
  logo_churn_pct: number | null;
  receita_churn_pct: number | null;
  grr_pct: number | null;
  nrr_pct: number | null;
  arpa: number | null;
  ltv: number | null;
  cac: number | null;
  ltv_cac: number | null;
  payback_meses: number | null;
  custo_aquisicao: number;
  receita_total: number;
  receita_paga: number;
  receita_inadimplente: number;
  receita_recorrente: number;
  receita_pontual: number;
}

export function useInsightsMrr(refMonth: MonthKey, monthsBack = 12): QueryResult<InsightMes[]> {
  return useSupabaseQuery<InsightMes[]>({
    queryFn: () => supabase.rpc('rpc_insights_mrr', { months_back: monthsBack, ref_month: `${refMonth}-01` }),
    transform: (raw) => rows(raw).map((r) => ({
      mes: String(r.mes),
      mrr: toNumber(r.mrr),
      arr: toNumber(r.arr),
      novos_mrr: toNumber(r.novos_mrr),
      expansao_mrr: toNumber(r.expansao_mrr),
      contracao_mrr: toNumber(r.contracao_mrr),
      churn_mrr: toNumber(r.churn_mrr),
      net_new_mrr: toNumber(r.net_new_mrr),
      clientes_ini: toNumber(r.clientes_ini),
      clientes_fim: toNumber(r.clientes_fim),
      clientes_novos: toNumber(r.clientes_novos),
      clientes_churn: toNumber(r.clientes_churn),
      logo_churn_pct: nullable(r.logo_churn_pct),
      receita_churn_pct: nullable(r.receita_churn_pct),
      grr_pct: nullable(r.grr_pct),
      nrr_pct: nullable(r.nrr_pct),
      arpa: nullable(r.arpa),
      ltv: nullable(r.ltv),
      cac: nullable(r.cac),
      ltv_cac: nullable(r.ltv_cac),
      payback_meses: nullable(r.payback_meses),
      custo_aquisicao: toNumber(r.custo_aquisicao),
      receita_total: toNumber(r.receita_total),
      receita_paga: toNumber(r.receita_paga),
      receita_inadimplente: toNumber(r.receita_inadimplente),
      receita_recorrente: toNumber(r.receita_recorrente),
      receita_pontual: toNumber(r.receita_pontual),
    })),
    empty: [],
    mockKey: 'mockInsightsMrr',
  }, [refMonth, monthsBack]);
}

/* ============================================================================
   Contratos cancelados
   ============================================================================ */

export interface Cancelado {
  contrato_id: number;
  cliente: string;
  contrato: string;
  tipo: string;
  mrr_perdido: number | null;
  data_cancelamento: string;
  meses_ativo: number;
  motivo: string | null;
  cliente_status: string;
}

export function useCancelados(refMonth: MonthKey, monthsBack = 24): QueryResult<Cancelado[]> {
  return useSupabaseQuery<Cancelado[]>({
    queryFn: () => supabase.rpc('rpc_insights_cancelados', { months_back: monthsBack, ref_month: `${refMonth}-01` }),
    transform: (raw) => rows(raw).map((r) => ({
      contrato_id: toNumber(r.contrato_id),
      cliente: String(r.cliente ?? ''),
      contrato: String(r.contrato ?? ''),
      tipo: String(r.tipo ?? ''),
      mrr_perdido: nullable(r.mrr_perdido),
      data_cancelamento: String(r.data_cancelamento ?? ''),
      meses_ativo: toNumber(r.meses_ativo),
      motivo: r.motivo ? String(r.motivo) : null,
      cliente_status: String(r.cliente_status ?? ''),
    })),
    empty: [],
    mockKey: 'mockInsightsCancelados',
  }, [refMonth, monthsBack]);
}

/* ============================================================================
   Faturas do mês (receita editável) e contratos
   ============================================================================ */

export type FaturaStatus = 'prevista' | 'emitida' | 'paga' | 'inadimplente' | 'cancelada';

export interface FaturaMes {
  id: number;
  competencia: string;
  valor: number;
  status: FaturaStatus;
  data_pagamento: string | null;
  contrato_id: number;
  contrato: string;
  tipo: string;
  cliente: string;
}

/** PostgREST devolve o embed de FK many-to-one como objeto; por segurança aceita array. */
const one = <T,>(v: T | T[] | null | undefined): T | undefined => (Array.isArray(v) ? v[0] : v ?? undefined);

export function useFaturasMes(month: MonthKey): QueryResult<FaturaMes[]> {
  return useSupabaseQuery<FaturaMes[]>({
    queryFn: () => supabase
      .from('faturas')
      .select('id,competencia,valor,status,data_pagamento,contratos(id,nome,tipo,clientes(nome))')
      .gte('competencia', `${month}-01`)
      .lte('competencia', lastDayISO(month))
      .order('id'),
    transform: (raw) => rows(raw).map((r) => {
      const ct = one(r.contratos as Record<string, unknown> | Record<string, unknown>[] | null);
      const cl = one(ct?.clientes as Record<string, unknown> | Record<string, unknown>[] | null);
      return {
        id: toNumber(r.id),
        competencia: String(r.competencia),
        valor: toNumber(r.valor),
        status: String(r.status) as FaturaStatus,
        data_pagamento: r.data_pagamento ? String(r.data_pagamento) : null,
        contrato_id: toNumber(ct?.id),
        contrato: String(ct?.nome ?? '—'),
        tipo: String(ct?.tipo ?? ''),
        cliente: String(cl?.nome ?? '—'),
      };
    }),
    empty: [],
    mockKey: 'mockFaturasMes',
  }, [month]);
}

export interface ContratoLista {
  id: number;
  nome: string;
  tipo: string;
  status: string;
  valor_mensal: number | null;
  cliente: string;
}

export function useContratos(): QueryResult<ContratoLista[]> {
  return useSupabaseQuery<ContratoLista[]>({
    queryFn: () => supabase
      .from('contratos')
      .select('id,nome,tipo,status,valor_mensal,clientes(nome)')
      .order('id', { ascending: false }),
    transform: (raw) => rows(raw).map((r) => ({
      id: toNumber(r.id),
      nome: String(r.nome),
      tipo: String(r.tipo),
      status: String(r.status),
      valor_mensal: nullable(r.valor_mensal),
      cliente: String(one(r.clientes as Record<string, unknown> | Record<string, unknown>[] | null)?.nome ?? '—'),
    })),
    empty: [],
    mockKey: 'mockContratosLista',
  }, []);
}
