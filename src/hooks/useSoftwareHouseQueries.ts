/**
 * RAVO OS — Hooks de métricas de software house
 *
 * Consomem as RPCs de database/rpcs_softwarehouse.sql. Cada hook responde a
 * uma pergunta de dono, não a um conceito genérico de SaaS.
 *
 * Convenção: colunas NUMERIC do PostgreSQL chegam como string no JSON do
 * PostgREST — toda leitura numérica passa por `toNumber`.
 */

import { sb as supabase } from '@/services/supabase';
import { useSupabaseQuery, toNumber, QueryResult } from './useSupabaseQuery';
import type { MonthKey } from '@/contexts/PeriodContext';

/** Converte a chave de período (YYYY-MM) no primeiro dia do mês. */
function refArg(refMonth?: MonthKey | null): Record<string, unknown> {
  return refMonth ? { ref_month: `${refMonth}-01` } : {};
}

function rows(raw: unknown): Record<string, unknown>[] {
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

/* ==========================================================================
   1. Resumo executivo — o mês fechou no azul?
   ========================================================================== */

export interface ResumoExecutivo {
  receita: number;
  custo_direto: number;
  margem_bruta: number;
  margem_bruta_pct: number;
  despesas: number;
  resultado: number;
  resultado_pct: number;
  runway_meses: number | null;
}

const RESUMO_VAZIO: ResumoExecutivo = {
  receita: 0, custo_direto: 0, margem_bruta: 0, margem_bruta_pct: 0,
  despesas: 0, resultado: 0, resultado_pct: 0, runway_meses: null,
};

export function useResumoExecutivo(refMonth?: MonthKey | null): QueryResult<ResumoExecutivo> {
  return useSupabaseQuery<ResumoExecutivo>({
    queryFn: () => supabase.rpc('rpc_resumo_executivo', refArg(refMonth)),
    transform: (raw) => {
      const r = rows(raw)[0];
      if (!r) return RESUMO_VAZIO;
      return {
        receita: toNumber(r.receita),
        custo_direto: toNumber(r.custo_direto),
        margem_bruta: toNumber(r.margem_bruta),
        margem_bruta_pct: toNumber(r.margem_bruta_pct),
        despesas: toNumber(r.despesas),
        resultado: toNumber(r.resultado),
        resultado_pct: toNumber(r.resultado_pct),
        runway_meses: r.runway_meses === null ? null : toNumber(r.runway_meses),
      };
    },
    empty: RESUMO_VAZIO,
    mockKey: 'mockResumoExecutivo',
  }, [refMonth ?? null]);
}

/* ==========================================================================
   2. Mix de receita — quanto é previsível
   ========================================================================== */

export type TipoReceita = 'retainer' | 'projeto' | 'hora' | 'licenca';

export interface MixReceita {
  tipo: TipoReceita;
  receita: number;
  participacao: number;
  recorrente: boolean;
}

export function useMixReceita(refMonth?: MonthKey | null): QueryResult<MixReceita[]> {
  return useSupabaseQuery<MixReceita[]>({
    queryFn: () => supabase.rpc('rpc_mix_receita', refArg(refMonth)),
    transform: (raw) => rows(raw).map((r) => ({
      tipo: String(r.tipo) as TipoReceita,
      receita: toNumber(r.receita),
      participacao: toNumber(r.participacao),
      recorrente: Boolean(r.recorrente),
    })),
    empty: [],
    mockKey: 'mockMixReceita',
  }, [refMonth ?? null]);
}

/* ==========================================================================
   3. Série mensal de receita por stream
   ========================================================================== */

export interface ReceitaMensal {
  mes: string;
  retainer: number;
  projeto: number;
  hora: number;
  licenca: number;
  total: number;
  recorrente_pct: number;
}

export function useReceitaMensal(
  refMonth?: MonthKey | null,
  monthsBack = 6
): QueryResult<ReceitaMensal[]> {
  return useSupabaseQuery<ReceitaMensal[]>({
    queryFn: () => supabase.rpc('rpc_receita_mensal', { months_back: monthsBack, ...refArg(refMonth) }),
    transform: (raw) => rows(raw).map((r) => ({
      mes: String(r.mes),
      retainer: toNumber(r.retainer),
      projeto: toNumber(r.projeto),
      hora: toNumber(r.hora),
      licenca: toNumber(r.licenca),
      total: toNumber(r.total),
      recorrente_pct: toNumber(r.recorrente_pct),
    })),
    empty: [],
    mockKey: 'mockReceitaMensal',
  }, [refMonth ?? null, monthsBack]);
}

/* ==========================================================================
   4. Utilização faturável — quanto da capacidade paga virou receita
   ========================================================================== */

export interface Utilizacao {
  pessoa: string;
  papel: string;
  horas_faturaveis: number;
  horas_totais: number;
  capacidade: number;
  utilizacao_pct: number;
  realized_rate: number;
}

export function useUtilizacao(refMonth?: MonthKey | null): QueryResult<Utilizacao[]> {
  return useSupabaseQuery<Utilizacao[]>({
    queryFn: () => supabase.rpc('rpc_utilizacao', refArg(refMonth)),
    transform: (raw) => rows(raw).map((r) => ({
      pessoa: String(r.pessoa ?? ''),
      papel: String(r.papel ?? ''),
      horas_faturaveis: toNumber(r.horas_faturaveis),
      horas_totais: toNumber(r.horas_totais),
      capacidade: toNumber(r.capacidade),
      utilizacao_pct: toNumber(r.utilizacao_pct),
      realized_rate: toNumber(r.realized_rate),
    })),
    empty: [],
    mockKey: 'mockUtilizacao',
  }, [refMonth ?? null]);
}

/* ==========================================================================
   5. Margem por projeto — onde a margem está sendo perdida
   ========================================================================== */

export interface MargemProjeto {
  projeto: string;
  cliente: string;
  tipo: TipoReceita;
  status: string;
  receita: number;
  custo: number;
  margem: number;
  margem_pct: number;
  horas_estimadas: number;
  horas_reais: number;
  desvio_escopo_pct: number | null;
}

export function useMargemProjetos(refMonth?: MonthKey | null): QueryResult<MargemProjeto[]> {
  return useSupabaseQuery<MargemProjeto[]>({
    queryFn: () => supabase.rpc('rpc_margem_projetos', refArg(refMonth)),
    transform: (raw) => rows(raw).map((r) => ({
      projeto: String(r.projeto ?? ''),
      cliente: String(r.cliente ?? ''),
      tipo: String(r.tipo) as TipoReceita,
      status: String(r.status ?? ''),
      receita: toNumber(r.receita),
      custo: toNumber(r.custo),
      margem: toNumber(r.margem),
      margem_pct: toNumber(r.margem_pct),
      horas_estimadas: toNumber(r.horas_estimadas),
      horas_reais: toNumber(r.horas_reais),
      desvio_escopo_pct: r.desvio_escopo_pct === null ? null : toNumber(r.desvio_escopo_pct),
    })),
    empty: [],
    mockKey: 'mockMargemProjetos',
  }, [refMonth ?? null]);
}

/* ==========================================================================
   6. Concentração de receita — perder um cliente me quebra?
   ========================================================================== */

export interface ConcentracaoCliente {
  cliente: string;
  receita: number;
  participacao: number;
  acumulado: number;
}

export function useConcentracao(refMonth?: MonthKey | null): QueryResult<ConcentracaoCliente[]> {
  return useSupabaseQuery<ConcentracaoCliente[]>({
    queryFn: () => supabase.rpc('rpc_concentracao_clientes', refArg(refMonth)),
    transform: (raw) => rows(raw).map((r) => ({
      cliente: String(r.cliente ?? ''),
      receita: toNumber(r.receita),
      participacao: toNumber(r.participacao),
      acumulado: toNumber(r.acumulado),
    })),
    empty: [],
    mockKey: 'mockConcentracao',
  }, [refMonth ?? null]);
}

/* ==========================================================================
   7. Backlog contratado
   ========================================================================== */

export interface Backlog {
  backlog_projetos: number;
  backlog_recorrente: number;
  backlog_total: number;
  receita_media_3m: number;
  cobertura_meses: number | null;
}

const BACKLOG_VAZIO: Backlog = {
  backlog_projetos: 0, backlog_recorrente: 0, backlog_total: 0,
  receita_media_3m: 0, cobertura_meses: null,
};

export function useBacklog(refMonth?: MonthKey | null): QueryResult<Backlog> {
  return useSupabaseQuery<Backlog>({
    queryFn: () => supabase.rpc('rpc_backlog', refArg(refMonth)),
    transform: (raw) => {
      const r = rows(raw)[0];
      if (!r) return BACKLOG_VAZIO;
      return {
        backlog_projetos: toNumber(r.backlog_projetos),
        backlog_recorrente: toNumber(r.backlog_recorrente),
        backlog_total: toNumber(r.backlog_total),
        receita_media_3m: toNumber(r.receita_media_3m),
        cobertura_meses: r.cobertura_meses === null ? null : toNumber(r.cobertura_meses),
      };
    },
    empty: BACKLOG_VAZIO,
    mockKey: 'mockBacklog',
  }, [refMonth ?? null]);
}

/* ==========================================================================
   8. Pipeline ponderado
   ========================================================================== */

export interface PipelineEstagio {
  estagio: string;
  quantidade: number;
  valor_total: number;
  valor_ponderado: number;
}

export function usePipeline(): QueryResult<PipelineEstagio[]> {
  return useSupabaseQuery<PipelineEstagio[]>({
    queryFn: () => supabase.rpc('rpc_pipeline'),
    transform: (raw) => rows(raw).map((r) => ({
      estagio: String(r.estagio ?? ''),
      quantidade: toNumber(r.quantidade),
      valor_total: toNumber(r.valor_total),
      valor_ponderado: toNumber(r.valor_ponderado),
    })),
    empty: [],
    mockKey: 'mockPipeline',
  });
}

/* ==========================================================================
   9. Saúde comercial
   ========================================================================== */

export interface SaudeComercial {
  win_rate: number;
  ciclo_dias: number;
  ticket_medio: number;
  ganhos: number;
  perdidos: number;
}

const COMERCIAL_VAZIO: SaudeComercial = {
  win_rate: 0, ciclo_dias: 0, ticket_medio: 0, ganhos: 0, perdidos: 0,
};

export function useSaudeComercial(refMonth?: MonthKey | null): QueryResult<SaudeComercial> {
  return useSupabaseQuery<SaudeComercial>({
    queryFn: () => supabase.rpc('rpc_saude_comercial', { months_back: 6, ...refArg(refMonth) }),
    transform: (raw) => {
      const r = rows(raw)[0];
      if (!r) return COMERCIAL_VAZIO;
      return {
        win_rate: toNumber(r.win_rate),
        ciclo_dias: toNumber(r.ciclo_dias),
        ticket_medio: toNumber(r.ticket_medio),
        ganhos: toNumber(r.ganhos),
        perdidos: toNumber(r.perdidos),
      };
    },
    empty: COMERCIAL_VAZIO,
    mockKey: 'mockSaudeComercial',
  }, [refMonth ?? null]);
}

/* ==========================================================================
   10. Carteira recorrente — MRR/churn/NRR aplicados SÓ ao que é recorrente
   ========================================================================== */

export interface CarteiraRecorrente {
  mes: string;
  mrr: number;
  clientes: number;
  churn_pct: number;
  nrr_pct: number;
}

export function useCarteiraRecorrente(
  refMonth?: MonthKey | null,
  monthsBack = 6
): QueryResult<CarteiraRecorrente[]> {
  return useSupabaseQuery<CarteiraRecorrente[]>({
    queryFn: () => supabase.rpc('rpc_carteira_recorrente', { months_back: monthsBack, ...refArg(refMonth) }),
    transform: (raw) => rows(raw).map((r) => ({
      mes: String(r.mes),
      mrr: toNumber(r.mrr),
      clientes: toNumber(r.clientes),
      churn_pct: toNumber(r.churn_pct),
      nrr_pct: toNumber(r.nrr_pct),
    })),
    empty: [],
    mockKey: 'mockCarteiraRecorrente',
  }, [refMonth ?? null, monthsBack]);
}
