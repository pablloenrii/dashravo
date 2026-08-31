/**
 * RAVO OS — Hooks de dados das páginas (CRM, Finance, Goals, CS)
 *
 * Todos usam useSupabaseQuery: erro real exposto via `error`,
 * mock somente com VITE_USE_MOCK=true, Number() em colunas NUMERIC,
 * proteção contra race conditions e `refetch` para revalidação pós-CRUD.
 */

import { sb as supabase } from '@/services/supabase';
import { useSupabaseQuery, toNumber, QueryResult } from './useSupabaseQuery';
import type { MonthKey } from '@/contexts/PeriodContext';
import { chart } from '@/constants/theme';

const PALETTE = chart.palette;

/**
 * Argumentos das RPCs com âncora de período: inclui `ref_month` (primeiro dia do
 * mês selecionado) apenas quando um mês está ativo. Sem mês selecionado, as RPCs
 * usam o default CURRENT_DATE/NOW() — mesmo comportamento de antes.
 */
function periodArgs(extra: Record<string, unknown>, refMonth?: MonthKey | null): Record<string, unknown> {
  const args = { ...extra };
  if (refMonth) args.ref_month = `${refMonth}-01`;
  return args;
}

// ============================================================================
// CRM
// ============================================================================

export interface ContactData {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone?: string;
  etapa: string;
  valor: number;
  origem?: string;
  motivo?: string;
  data_prevista?: string;
  created_at?: string;
  updated_at?: string;
  /** Tipo de receita (retainer/projeto/hora/licenca) — usado ao marcar "Ganho" para
   *  criar o contrato correspondente no schema de software house. */
  tipo_receita?: string;
  /** Id do contrato já criado no schema de software house, se este deal já foi ganho. */
  contrato_id?: number | null;
}

export interface ContactChartData {
  mes: string;
  novos: number;
  ativos: number;
}

export interface OpportunityData {
  name: string;
  quantidade: number;
  fill: string;
}

interface RawContact {
  id: string;
  nome: string;
  empresa: string | null;
  email: string | null;
  telefone: string | null;
  etapa: string;
  valor: string | number | null;
  origem: string | null;
  motivo: string | null;
  data_prevista: string | null;
  created_at?: string;
  updated_at?: string;
  tipo_receita?: string | null;
  contrato_id?: number | string | null;
}

export function useContactsData(): QueryResult<ContactData[]> {
  return useSupabaseQuery<ContactData[]>({
    queryFn: () =>
      supabase.from('contatos').select('*').order('created_at', { ascending: false }),
    transform: (rows) =>
      ((rows as RawContact[]) ?? []).map((r) => ({
        id: r.id,
        nome: r.nome,
        empresa: r.empresa ?? '',
        email: r.email ?? '',
        telefone: r.telefone ?? '',
        etapa: r.etapa,
        valor: toNumber(r.valor),
        origem: r.origem ?? '',
        motivo: r.motivo ?? '',
        data_prevista: r.data_prevista ?? undefined,
        created_at: r.created_at,
        updated_at: r.updated_at,
        tipo_receita: r.tipo_receita ?? undefined,
        contrato_id: r.contrato_id === null || r.contrato_id === undefined ? null : Number(r.contrato_id),
      })),
    empty: [],
    mockKey: 'MOCK_CONTATOS',
  });
}

// ----------------------------------------------------------------------------
// ATIVIDADES — timeline e follow-up da ficha do lead (CRM nível Pipedrive)
// ----------------------------------------------------------------------------

export type ActivityType = 'nota' | 'ligacao' | 'email' | 'reuniao' | 'tarefa';

export interface ActivityData {
  id: string;
  contato_id: string;
  tipo: ActivityType;
  descricao: string;
  data_prevista?: string;
  concluida: boolean;
  concluida_em?: string;
  criado_em: string;
}

interface RawActivity {
  id: string | number;
  contato_id: string | number;
  tipo: ActivityType;
  descricao: string;
  data_prevista: string | null;
  concluida: boolean;
  concluida_em: string | null;
  criado_em: string;
}

export function transformActivity(r: RawActivity): ActivityData {
  return {
    id: String(r.id),
    contato_id: String(r.contato_id),
    tipo: r.tipo,
    descricao: r.descricao,
    data_prevista: r.data_prevista ?? undefined,
    concluida: r.concluida,
    concluida_em: r.concluida_em ?? undefined,
    criado_em: r.criado_em,
  };
}

/** Timeline completa de um lead — usada pela ficha do lead (drawer). */
export async function fetchLeadActivities(contatoId: string): Promise<{ data: ActivityData[]; error: string | null }> {
  const { data, error } = await supabase
    .from('atividades')
    .select('*')
    .eq('contato_id', contatoId)
    .order('criado_em', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: ((data as RawActivity[]) ?? []).map(transformActivity), error: null };
}

/** Próximo follow-up pendente por lead, numa query só (sem N+1) — alimenta o
 *  badge "atrasado / hoje / em Nd" nos cards do board e nas linhas da lista. */
export interface NextFollowUp {
  contato_id: string;
  data_prevista: string;
}

interface RawFollowUp {
  contato_id: string | number;
  data_prevista: string;
}

export function useFollowUpsData(): QueryResult<NextFollowUp[]> {
  return useSupabaseQuery<NextFollowUp[]>({
    queryFn: () =>
      supabase
        .from('atividades')
        .select('contato_id, data_prevista')
        .eq('concluida', false)
        .not('data_prevista', 'is', null)
        .order('data_prevista', { ascending: true }),
    transform: (rows) => {
      const seen = new Set<string>();
      const out: NextFollowUp[] = [];
      for (const r of (rows as RawFollowUp[]) ?? []) {
        const id = String(r.contato_id);
        if (seen.has(id)) continue; // já ordenado por data_prevista asc: a 1ª ocorrência é a mais próxima
        seen.add(id);
        out.push({ contato_id: id, data_prevista: r.data_prevista });
      }
      return out;
    },
    empty: [],
    mockKey: 'MOCK_FOLLOWUPS',
  });
}

export function useContactsChartData(refMonth?: MonthKey | null): QueryResult<ContactChartData[]> {
  return useSupabaseQuery<ContactChartData[]>({
    queryFn: () => supabase.rpc('get_contacts_by_month', periodArgs({ months_back: 6 }, refMonth)),
    transform: (rows) =>
      ((rows as { mes: string; novos: number | string; ativos: number | string }[]) ?? []).map(
        (r) => ({ mes: r.mes, novos: toNumber(r.novos), ativos: toNumber(r.ativos) })
      ),
    empty: [],
    mockKey: 'MOCK_CONTACTS_CHART',
  }, [refMonth ?? null]);
}

export function useOpportunitiesData(refMonth?: MonthKey | null): QueryResult<OpportunityData[]> {
  return useSupabaseQuery<OpportunityData[]>({
    queryFn: () => supabase.rpc('get_opportunities_by_stage', periodArgs({}, refMonth)),
    transform: (rows) =>
      ((rows as { estagio: string; quantidade: number | string }[]) ?? []).map((r, i) => ({
        name: r.estagio,
        quantidade: toNumber(r.quantidade),
        fill: PALETTE[i % PALETTE.length],
      })),
    empty: [],
    mockKey: 'MOCK_OPPORTUNITIES',
  }, [refMonth ?? null]);
}

// ============================================================================
// FINANCE
// ============================================================================

export interface FinanceChartData {
  mes: string;
  receita: number;
  despesa: number;
  lucro: number;
}

export interface CashFlowData {
  semana: string;
  entradas: number;
  saidas: number;
}

export interface ExpenseData {
  name: string;
  value: number;
  percentual: number;
  fill: string;
}

export function useFinanceChartData(refMonth?: MonthKey | null): QueryResult<FinanceChartData[]> {
  return useSupabaseQuery<FinanceChartData[]>({
    queryFn: () => supabase.rpc('get_revenue_by_month', periodArgs({ months_back: 6 }, refMonth)),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        mes: String(r.mes),
        receita: toNumber(r.receita),
        despesa: toNumber(r.despesa),
        lucro: toNumber(r.lucro),
      })),
    empty: [],
    mockKey: 'MOCK_FINANCE_CHART',
  }, [refMonth ?? null]);
}

export function useCashFlowData(refMonth?: MonthKey | null): QueryResult<CashFlowData[]> {
  return useSupabaseQuery<CashFlowData[]>({
    queryFn: () => supabase.rpc('get_cash_flow_by_week', periodArgs({ weeks_back: 4 }, refMonth)),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        semana: String(r.semana),
        entradas: toNumber(r.entradas),
        saidas: toNumber(r.saidas),
      })),
    empty: [],
    mockKey: 'MOCK_CASH_FLOW',
  }, [refMonth ?? null]);
}

export function useExpensesData(refMonth?: MonthKey | null): QueryResult<ExpenseData[]> {
  return useSupabaseQuery<ExpenseData[]>({
    queryFn: () => supabase.rpc('get_expenses_by_category', periodArgs({}, refMonth)),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r, i) => ({
        name: String(r.categoria),
        value: toNumber(r.valor),
        percentual: toNumber(r.percentual),
        fill: PALETTE[i % PALETTE.length],
      })),
    empty: [],
    mockKey: 'MOCK_EXPENSES',
  }, [refMonth ?? null]);
}

// ============================================================================
// GOALS
// ============================================================================

export interface GoalProgressData {
  semana: string;
  atingido: number;
  meta: number;
}

/** Métricas que podem alimentar o "realizado" de uma meta automaticamente */
export type GoalMetric =
  | 'manual' | 'receita_ganha' | 'deals_ganhos' | 'novos_leads'
  | 'pipeline_aberto' | 'ticket_medio' | 'win_rate';

export type GoalUnit = 'moeda' | 'numero' | 'percentual';

export interface GoalData {
  id: string;
  nome: string;
  meta: number;
  realizado: number;
  percentual: number;
  status: string;
  periodo?: string;
  /** Mês de referência (ISO 'YYYY-MM-DD', sempre dia 1) */
  mes: string;
  metrica: GoalMetric;
  unidade: GoalUnit;
}

export function useGoalProgressData(refMonth?: MonthKey | null): QueryResult<GoalProgressData[]> {
  return useSupabaseQuery<GoalProgressData[]>({
    queryFn: () => supabase.rpc('get_goal_progress_by_week', periodArgs({ weeks_back: 4 }, refMonth)),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        semana: String(r.semana),
        atingido: toNumber(r.atingido),
        meta: toNumber(r.meta),
      })),
    empty: [],
    mockKey: 'MOCK_GOAL_PROGRESS',
  }, [refMonth ?? null]);
}

export function useGoalsData(): QueryResult<GoalData[]> {
  return useSupabaseQuery<GoalData[]>({
    queryFn: () =>
      supabase.from('metas').select('*').order('created_at', { ascending: false }),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => {
        const meta = toNumber(r.meta);
        const realizado = toNumber(r.realizado);
        return {
          id: String(r.id),
          nome: String(r.nome),
          meta,
          realizado,
          percentual: meta > 0 ? Math.round((realizado / meta) * 100) : 0,
          status: String(r.status ?? ''),
          periodo: r.periodo ? String(r.periodo) : undefined,
          mes: String(r.mes ?? ''),
          metrica: (r.metrica ? String(r.metrica) : 'manual') as GoalMetric,
          unidade: (r.unidade ? String(r.unidade) : 'numero') as GoalUnit,
        };
      }),
    empty: [],
    mockKey: 'MOCK_GOALS',
  });
}

// ============================================================================
// CUSTOMER SERVICE — hooks da CSPage
// ============================================================================

export interface TicketData {
  id: string;
  cliente: string;
  assunto: string;
  prioridade: string;
  status: string;
  tempo_resposta?: string;
  contato_id?: string;
}

export interface AttendanceChartData {
  dia: string;
  recebidos: number;
  resolvidos: number;
  pendentes: number;
}

export interface SatisfactionData {
  semana: string;
  nps: number;
  satisfacao: number;
}

export function useTicketsData(): QueryResult<TicketData[]> {
  return useSupabaseQuery<TicketData[]>({
    queryFn: () =>
      supabase
        .from('tickets')
        .select('*')
        .eq('status', 'aberto')
        .order('created_at', { ascending: false }),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        id: String(r.id),
        cliente: String(r.cliente ?? ''),
        assunto: String(r.assunto ?? ''),
        prioridade: String(r.prioridade ?? ''),
        status: String(r.status ?? ''),
        tempo_resposta: r.tempo_resposta ? String(r.tempo_resposta) : undefined,
        contato_id: r.contato_id ? String(r.contato_id) : undefined,
      })),
    empty: [],
    mockKey: 'MOCK_TICKETS',
  });
}

export function useAttendanceChartData(refMonth?: MonthKey | null): QueryResult<AttendanceChartData[]> {
  return useSupabaseQuery<AttendanceChartData[]>({
    queryFn: () => supabase.rpc('get_attendance_by_day', periodArgs({ days_back: 5 }, refMonth)),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        dia: String(r.dia),
        recebidos: toNumber(r.recebidos),
        resolvidos: toNumber(r.resolvidos),
        pendentes: toNumber(r.pendentes),
      })),
    empty: [],
    mockKey: 'MOCK_ATTENDANCE',
  }, [refMonth ?? null]);
}

export function useSatisfactionData(refMonth?: MonthKey | null): QueryResult<SatisfactionData[]> {
  return useSupabaseQuery<SatisfactionData[]>({
    queryFn: () => supabase.rpc('get_satisfaction_by_week', periodArgs({ weeks_back: 4 }, refMonth)),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        semana: String(r.semana),
        nps: toNumber(r.nps),
        satisfacao: toNumber(r.satisfacao),
      })),
    empty: [],
    mockKey: 'MOCK_SATISFACTION',
  }, [refMonth ?? null]);
}

// ============================================================================
// FINANCE — listagens brutas (para CRUD de lançamentos)
// ============================================================================

export interface ReceitaRaw {
  id: string;
  mes: string; // ISO date
  receita: number;
  despesa: number;
  lucro: number;
}

export interface FluxoRaw {
  id: string;
  semana: string; // ISO date
  entradas: number;
  saidas: number;
}

export interface DespesaRaw {
  id: string;
  categoria: string;
  valor: number;
  mes: string; // ISO date
}

export function useReceitasRawData(): QueryResult<ReceitaRaw[]> {
  return useSupabaseQuery<ReceitaRaw[]>({
    queryFn: () => supabase.from('receitas').select('*').order('mes', { ascending: false }),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        id: String(r.id),
        mes: String(r.mes),
        receita: toNumber(r.receita),
        despesa: toNumber(r.despesa),
        lucro: toNumber(r.lucro),
      })),
    empty: [],
    mockKey: 'MOCK_FINANCE_CHART',
  });
}

export function useFluxoRawData(): QueryResult<FluxoRaw[]> {
  return useSupabaseQuery<FluxoRaw[]>({
    queryFn: () => supabase.from('fluxo_caixa').select('*').order('semana', { ascending: false }),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        id: String(r.id),
        semana: String(r.semana),
        entradas: toNumber(r.entradas),
        saidas: toNumber(r.saidas),
      })),
    empty: [],
    mockKey: 'MOCK_CASH_FLOW',
  });
}

export function useDespesasRawData(): QueryResult<DespesaRaw[]> {
  return useSupabaseQuery<DespesaRaw[]>({
    queryFn: () => supabase.from('despesas').select('*').order('mes', { ascending: false }),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        id: String(r.id),
        categoria: String(r.categoria),
        valor: toNumber(r.valor),
        mes: String(r.mes),
      })),
    empty: [],
    mockKey: 'MOCK_EXPENSES',
  });
}
