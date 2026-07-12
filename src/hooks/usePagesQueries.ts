/**
 * RAVO OS — Hooks de dados das páginas (CRM, Finance, Goals, CS)
 *
 * Todos usam useSupabaseQuery: erro real exposto via `error`,
 * mock somente com VITE_USE_MOCK=true, Number() em colunas NUMERIC,
 * proteção contra race conditions e `refetch` para revalidação pós-CRUD.
 */

import { sb as supabase } from '@/services/supabase';
import { useSupabaseQuery, toNumber, QueryResult } from './useSupabaseQuery';

// Paleta oficial (máx. 3 cores + neutro)
const PALETTE = ['#FF6200', '#10B981', '#F59E0B', '#6B7280'];

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
  created_at?: string;
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
  created_at?: string;
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
        created_at: r.created_at,
      })),
    empty: [],
    mockKey: 'MOCK_CONTATOS',
  });
}

export function useContactsChartData(): QueryResult<ContactChartData[]> {
  return useSupabaseQuery<ContactChartData[]>({
    queryFn: () => supabase.rpc('get_contacts_by_month', { months_back: 6 }),
    transform: (rows) =>
      ((rows as { mes: string; novos: number | string; ativos: number | string }[]) ?? []).map(
        (r) => ({ mes: r.mes, novos: toNumber(r.novos), ativos: toNumber(r.ativos) })
      ),
    empty: [],
    mockKey: 'MOCK_CONTACTS_CHART',
  });
}

export function useOpportunitiesData(): QueryResult<OpportunityData[]> {
  return useSupabaseQuery<OpportunityData[]>({
    queryFn: () => supabase.rpc('get_opportunities_by_stage'),
    transform: (rows) =>
      ((rows as { estago: string; quantidade: number | string }[]) ?? []).map((r, i) => ({
        name: r.estago,
        quantidade: toNumber(r.quantidade),
        fill: PALETTE[i % PALETTE.length],
      })),
    empty: [],
    mockKey: 'MOCK_OPPORTUNITIES',
  });
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

export function useFinanceChartData(): QueryResult<FinanceChartData[]> {
  return useSupabaseQuery<FinanceChartData[]>({
    queryFn: () => supabase.rpc('get_revenue_by_month', { months_back: 6 }),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        mes: String(r.mes),
        receita: toNumber(r.receita),
        despesa: toNumber(r.despesa),
        lucro: toNumber(r.lucro),
      })),
    empty: [],
    mockKey: 'MOCK_FINANCE_CHART',
  });
}

export function useCashFlowData(): QueryResult<CashFlowData[]> {
  return useSupabaseQuery<CashFlowData[]>({
    queryFn: () => supabase.rpc('get_cash_flow_by_week', { weeks_back: 4 }),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        semana: String(r.semana),
        entradas: toNumber(r.entradas),
        saidas: toNumber(r.saidas),
      })),
    empty: [],
    mockKey: 'MOCK_CASH_FLOW',
  });
}

export function useExpensesData(): QueryResult<ExpenseData[]> {
  return useSupabaseQuery<ExpenseData[]>({
    queryFn: () => supabase.rpc('get_expenses_by_category'),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r, i) => ({
        name: String(r.categoria),
        value: toNumber(r.valor),
        percentual: toNumber(r.percentual),
        fill: PALETTE[i % PALETTE.length],
      })),
    empty: [],
    mockKey: 'MOCK_EXPENSES',
  });
}

// ============================================================================
// GOALS
// ============================================================================

export interface GoalProgressData {
  semana: string;
  atingido: number;
  meta: number;
}

export interface GoalData {
  id: string;
  nome: string;
  meta: number;
  realizado: number;
  percentual: number;
  status: string;
  periodo?: string;
}

export function useGoalProgressData(): QueryResult<GoalProgressData[]> {
  return useSupabaseQuery<GoalProgressData[]>({
    queryFn: () => supabase.rpc('get_goal_progress_by_week', { weeks_back: 4 }),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        semana: String(r.semana),
        atingido: toNumber(r.atingido),
        meta: toNumber(r.meta),
      })),
    empty: [],
    mockKey: 'MOCK_GOAL_PROGRESS',
  });
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
        };
      }),
    empty: [],
    mockKey: 'MOCK_GOALS',
  });
}

// ============================================================================
// CUSTOMER SERVICE (módulo removido da navegação; hooks mantidos p/ CSPage)
// ============================================================================

export interface TicketData {
  id: string;
  cliente: string;
  assunto: string;
  prioridade: string;
  status: string;
  tempo_resposta?: string;
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
      })),
    empty: [],
    mockKey: 'MOCK_TICKETS',
  });
}

export function useAttendanceChartData(): QueryResult<AttendanceChartData[]> {
  return useSupabaseQuery<AttendanceChartData[]>({
    queryFn: () => supabase.rpc('get_attendance_by_day', { days_back: 5 }),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        dia: String(r.dia),
        recebidos: toNumber(r.recebidos),
        resolvidos: toNumber(r.resolvidos),
        pendentes: toNumber(r.pendentes),
      })),
    empty: [],
    mockKey: 'MOCK_ATTENDANCE',
  });
}

export function useSatisfactionData(): QueryResult<SatisfactionData[]> {
  return useSupabaseQuery<SatisfactionData[]>({
    queryFn: () => supabase.rpc('get_satisfaction_by_week', { weeks_back: 4 }),
    transform: (rows) =>
      ((rows as Record<string, unknown>[]) ?? []).map((r) => ({
        semana: String(r.semana),
        nps: toNumber(r.nps),
        satisfacao: toNumber(r.satisfacao),
      })),
    empty: [],
    mockKey: 'MOCK_SATISFACTION',
  });
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
