/**
 * RAVO OS — Contexto global de período (mês a mês)
 *
 * Um único seletor no header controla o mês de referência de TODAS as telas
 * (Dashboard, CRM, Financeiro, Metas). A escolha persiste em localStorage para
 * sobreviver a reload/navegação.
 */

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

const STORAGE_KEY = 'ravo:period';

/** Chave canônica de mês: 'YYYY-MM' */
export type MonthKey = string;

export function toMonthKey(d: Date): MonthKey {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function currentMonthKey(): MonthKey {
  return toMonthKey(new Date());
}

/** 'YYYY-MM' -> primeiro dia do mês (local, sem timezone shift) */
export function monthStart(key: MonthKey): Date {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1, 0, 0, 0, 0);
}

/** 'YYYY-MM' -> último instante do mês */
export function monthEnd(key: MonthKey): Date {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m, 0, 23, 59, 59, 999);
}

/** Mês anterior a uma chave */
export function prevMonthKey(key: MonthKey): MonthKey {
  const d = monthStart(key);
  d.setMonth(d.getMonth() - 1);
  return toMonthKey(d);
}

/** Data ISO do primeiro dia do mês — formato usado na coluna `mes` das tabelas */
export function monthISO(key: MonthKey): string {
  return `${key}-01`;
}

/** Rótulo curto: 'jul/26' */
export function monthLabel(key: MonthKey): string {
  const d = monthStart(key);
  const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return `${mes}/${String(d.getFullYear()).slice(-2)}`;
}

/** Rótulo longo: 'Julho de 2026' */
export function monthLabelLong(key: MonthKey): string {
  const d = monthStart(key);
  const s = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Um valor ISO/Date cai dentro do mês? */
export function isInMonth(value: string | Date | undefined | null, key: MonthKey): boolean {
  if (!value) return false;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return false;
  return toMonthKey(d) === key;
}

/** Últimos N meses terminando no mês atual (mais antigo primeiro) */
export function recentMonths(count = 12): MonthKey[] {
  const out: MonthKey[] = [];
  const base = new Date();
  base.setDate(1);
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(d.getMonth() - i);
    out.push(toMonthKey(d));
  }
  return out;
}

/** Últimos N meses terminando em `end` (mais antigo primeiro). O último item é `end`. */
export function monthsEndingAt(end: MonthKey, count = 6): MonthKey[] {
  const out: MonthKey[] = [];
  const base = monthStart(end);
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(d.getMonth() - i);
    out.push(toMonthKey(d));
  }
  return out;
}

interface PeriodContextValue {
  /** Mês selecionado ('YYYY-MM'), ou null quando o usuário escolhe "Todo o período" */
  month: MonthKey | null;
  setMonth: (m: MonthKey | null) => void;
  /** Mês efetivo para cálculos — cai no mês atual quando o filtro está desligado */
  effectiveMonth: MonthKey;
  /** true quando nenhum filtro de mês está ativo (visão acumulada) */
  isAllTime: boolean;
  prevMonth: MonthKey;
  label: string;
}

const PeriodContext = createContext<PeriodContextValue | undefined>(undefined);

function readStored(): MonthKey | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === 'all') return null;
    return /^\d{4}-\d{2}$/.test(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [month, setMonthState] = useState<MonthKey | null>(readStored);

  const setMonth = useCallback((m: MonthKey | null) => {
    setMonthState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m ?? 'all');
    } catch {
      /* localStorage indisponível — filtro segue valendo só nesta sessão */
    }
  }, []);

  const value = useMemo<PeriodContextValue>(() => {
    const effectiveMonth = month ?? currentMonthKey();
    return {
      month,
      setMonth,
      effectiveMonth,
      isAllTime: month === null,
      prevMonth: prevMonthKey(effectiveMonth),
      label: month === null ? 'Todo o período' : monthLabelLong(month),
    };
  }, [month, setMonth]);

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

export function usePeriod(): PeriodContextValue {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error('usePeriod deve ser usado dentro de <PeriodProvider>');
  return ctx;
}
