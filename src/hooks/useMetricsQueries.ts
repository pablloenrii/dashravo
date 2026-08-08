/**
 * RAVO OS — Hooks de métricas do Dashboard
 * Erro real exposto; mock somente via VITE_USE_MOCK=true.
 */

import { sb as supabase } from '@/services/supabase';
import { useSupabaseQuery, toNumber, QueryResult } from './useSupabaseQuery';
import type { MonthKey } from '@/contexts/PeriodContext';

/**
 * Argumentos comuns das RPCs mensais: janela fixa de 6 meses terminando no mês
 * de referência (`refMonth`). Sem `refMonth`, ancoram no mês atual (padrão).
 */
function monthlyArgs(refMonth?: MonthKey | null): Record<string, unknown> {
  const args: Record<string, unknown> = { months_back: 6 };
  if (refMonth) args.ref_month = `${refMonth}-01`;
  return args;
}

export interface MRRData {
  mes: string;
  mrr: number;
  arr: number;
}

export interface ChurnData {
  mes: string;
  churn_rate: number;
  nrr: number;
}

export interface FunnelData {
  estagio: string;
  quantidade: number;
  conversao: number;
}

export function useMRRData(refMonth?: MonthKey | null): QueryResult<MRRData[]> {
  return useSupabaseQuery<MRRData[]>({
    queryFn: () => supabase.rpc('get_mrr_by_month', monthlyArgs(refMonth)),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        mes: String(r.mes),
        mrr: toNumber(r.mrr),
        arr: toNumber(r.arr),
      })),
    empty: [],
    mockKey: 'MOCK_MRR',
  }, [refMonth ?? null]);
}

export function useChurnData(refMonth?: MonthKey | null): QueryResult<ChurnData[]> {
  return useSupabaseQuery<ChurnData[]>({
    queryFn: () => supabase.rpc('get_churn_rate', monthlyArgs(refMonth)),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        mes: String(r.mes),
        churn_rate: toNumber(r.churn_rate),
        nrr: toNumber(r.nrr),
      })),
    empty: [],
    mockKey: 'MOCK_CHURN',
  }, [refMonth ?? null]);
}

export function useFunnelData(): QueryResult<FunnelData[]> {
  return useSupabaseQuery<FunnelData[]>({
    queryFn: () => supabase.rpc('get_sales_funnel'),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        estagio: String(r.estagio),
        quantidade: toNumber(r.quantidade),
        conversao: toNumber(r.conversao),
      })),
    empty: [],
    mockKey: 'MOCK_FUNNEL',
  });
}

export function useCustomerMetrics(refMonth?: MonthKey | null): QueryResult<Record<string, number>> {
  return useSupabaseQuery<Record<string, number>>({
    queryFn: () => supabase.rpc('get_customer_metrics', refMonth ? { ref_month: `${refMonth}-01` } : {}),
    transform: (rows) => {
      const obj: Record<string, number> = {};
      ((rows as { metric_name: string; value: unknown }[]) ?? []).forEach((r) => {
        obj[r.metric_name] = toNumber(r.value);
      });
      return obj;
    },
    empty: {},
    mockKey: 'MOCK_CUSTOMER_METRICS',
  }, [refMonth ?? null]);
}
