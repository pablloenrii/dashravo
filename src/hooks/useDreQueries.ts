/**
 * RAVO OS — Hooks da DRE (ravo-backend/sql/20_dre.sql)
 *
 * NUMERIC chega como string no JSON do PostgREST — toda leitura passa por `toNumber`.
 * Percentuais sem base (faturamento líquido = 0) chegam `null` e ficam `null`.
 */

import { sb as supabase } from '@/services/supabase';
import { useSupabaseQuery, toNumber, QueryResult } from './useSupabaseQuery';
import { lastDayISO } from './useInsightsQueries';
import type { MonthKey } from '@/contexts/PeriodContext';

const rows = (raw: unknown): Record<string, unknown>[] =>
  Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
const nullable = (v: unknown): number | null => (v === null || v === undefined ? null : toNumber(v));

export interface DreMes {
  mes: string; // 'YYYY-MM'
  faturamento_bruto: number;
  cancelamentos: number;
  impostos_faturamento: number;
  faturamento_liquido: number;
  custo_horas: number;
  custo_lancado: number;
  custo_entrega: number;
  lucro_bruto: number;
  margem_bruta_pct: number | null;
  despesas_variaveis: number;
  margem_contribuicao: number;
  margem_contribuicao_pct: number | null;
  despesas_fixas: number;
  ebitda: number;
  ebitda_pct: number | null;
  despesas_financeiras: number;
  depreciacao: number;
  lair: number;
  impostos_lucro: number;
  lucro_liquido: number;
  lucro_liquido_pct: number | null;
}

export function useDre(refMonth: MonthKey, monthsBack = 6): QueryResult<DreMes[]> {
  return useSupabaseQuery<DreMes[]>({
    queryFn: () => supabase.rpc('rpc_dre', { months_back: monthsBack, ref_month: `${refMonth}-01` }),
    transform: (raw) => rows(raw).map((r) => ({
      mes: String(r.mes).slice(0, 7),
      faturamento_bruto: toNumber(r.faturamento_bruto),
      cancelamentos: toNumber(r.cancelamentos),
      impostos_faturamento: toNumber(r.impostos_faturamento),
      faturamento_liquido: toNumber(r.faturamento_liquido),
      custo_horas: toNumber(r.custo_horas),
      custo_lancado: toNumber(r.custo_lancado),
      custo_entrega: toNumber(r.custo_entrega),
      lucro_bruto: toNumber(r.lucro_bruto),
      margem_bruta_pct: nullable(r.margem_bruta_pct),
      despesas_variaveis: toNumber(r.despesas_variaveis),
      margem_contribuicao: toNumber(r.margem_contribuicao),
      margem_contribuicao_pct: nullable(r.margem_contribuicao_pct),
      despesas_fixas: toNumber(r.despesas_fixas),
      ebitda: toNumber(r.ebitda),
      ebitda_pct: nullable(r.ebitda_pct),
      despesas_financeiras: toNumber(r.despesas_financeiras),
      depreciacao: toNumber(r.depreciacao),
      lair: toNumber(r.lair),
      impostos_lucro: toNumber(r.impostos_lucro),
      lucro_liquido: toNumber(r.lucro_liquido),
      lucro_liquido_pct: nullable(r.lucro_liquido_pct),
    })),
    empty: [],
    mockKey: 'mockDre',
  }, [refMonth, monthsBack]);
}

export type DespesaClasse = 'custo' | 'variavel' | 'fixa' | 'financeira' | 'depreciacao';

export interface Despesa {
  id: number;
  descricao: string;
  categoria: string;
  valor: number;
  competencia: string;
  recorrente: boolean;
  classe: DespesaClasse;
}

const mapDespesa = (r: Record<string, unknown>): Despesa => ({
  id: toNumber(r.id),
  descricao: String(r.descricao ?? ''),
  categoria: String(r.categoria ?? ''),
  valor: toNumber(r.valor),
  competencia: String(r.competencia),
  recorrente: Boolean(r.recorrente),
  classe: String(r.classe ?? 'fixa') as DespesaClasse,
});

/** Despesas lançadas em um mês (competência). */
export function useDespesasMes(month: MonthKey): QueryResult<Despesa[]> {
  return useSupabaseQuery<Despesa[]>({
    queryFn: () => supabase
      .from('despesas_operacionais')
      .select('id,descricao,categoria,valor,competencia,recorrente,classe')
      .gte('competencia', `${month}-01`)
      .lte('competencia', lastDayISO(month))
      .order('id'),
    transform: (raw) => rows(raw).map(mapDespesa),
    empty: [],
    mockKey: 'mockDespesasMes',
  }, [month]);
}

/** Alíquota efetiva do Simples (%), guardada em `config`. */
export function useAliquotaSimples(): QueryResult<number> {
  return useSupabaseQuery<number>({
    queryFn: () => supabase.from('config').select('valor').eq('chave', 'aliquota_simples'),
    transform: (raw) => (rows(raw)[0] ? toNumber(rows(raw)[0].valor) : 6),
    empty: 6,
    mockKey: 'mockAliquotaSimples',
  }, []);
}
