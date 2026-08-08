/**
 * RAVO OS — Testes do contexto global de período (src/contexts/PeriodContext.tsx)
 *
 * Cobre a leitura/persistência do mês em localStorage, o fallback para "todo o
 * período" e o comportamento do hook dentro/fora do provider.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { PeriodProvider, usePeriod, currentMonthKey } from '@/contexts/PeriodContext';

const STORAGE_KEY = 'ravo:period';

function wrapper({ children }: { children: ReactNode }) {
  return <PeriodProvider>{children}</PeriodProvider>;
}

describe('PeriodProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('inicia em "todo o período" quando não há valor salvo', () => {
    const { result } = renderHook(() => usePeriod(), { wrapper });
    expect(result.current.month).toBeNull();
    expect(result.current.isAllTime).toBe(true);
    expect(result.current.effectiveMonth).toBe(currentMonthKey());
    expect(result.current.label).toBe('Todo o período');
  });

  it('lê o mês salvo no localStorage', () => {
    window.localStorage.setItem(STORAGE_KEY, '2026-07');
    const { result } = renderHook(() => usePeriod(), { wrapper });
    expect(result.current.month).toBe('2026-07');
    expect(result.current.isAllTime).toBe(false);
    expect(result.current.effectiveMonth).toBe('2026-07');
    expect(result.current.label).toBe('Julho de 2026');
    expect(result.current.prevMonth).toBe('2026-06');
  });

  it('ignora valores inválidos no localStorage', () => {
    window.localStorage.setItem(STORAGE_KEY, 'bogus');
    const { result } = renderHook(() => usePeriod(), { wrapper });
    expect(result.current.month).toBeNull();
    expect(result.current.isAllTime).toBe(true);
  });

  it('setMonth persiste no localStorage e atualiza o estado', () => {
    const { result } = renderHook(() => usePeriod(), { wrapper });
    act(() => result.current.setMonth('2026-07'));
    expect(result.current.month).toBe('2026-07');
    expect(result.current.isAllTime).toBe(false);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('2026-07');
  });

  it('setMonth(null) volta para "todo o período"', () => {
    const { result } = renderHook(() => usePeriod(), { wrapper });
    act(() => result.current.setMonth('2026-07'));
    act(() => result.current.setMonth(null));
    expect(result.current.month).toBeNull();
    expect(result.current.isAllTime).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('all');
  });
});
