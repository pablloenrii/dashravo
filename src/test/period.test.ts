/**
 * RAVO OS — Testes dos helpers de período (src/contexts/PeriodContext.tsx)
 *
 * Cobre as funções puras de manipulação de mês (chaves 'YYYY-MM', limites de
 * mês, rótulos e filtros) que alimentam o seletor global de período.
 */

import { describe, it, expect } from 'vitest';
import {
  toMonthKey,
  currentMonthKey,
  monthStart,
  monthEnd,
  prevMonthKey,
  monthISO,
  monthLabel,
  monthLabelLong,
  isInMonth,
  recentMonths,
} from '@/contexts/PeriodContext';

describe('chaves de mês (YYYY-MM)', () => {
  it('toMonthKey formata com zero à esquerda', () => {
    expect(toMonthKey(new Date(2026, 0, 15))).toBe('2026-01');
    expect(toMonthKey(new Date(2026, 6, 15))).toBe('2026-07');
    expect(toMonthKey(new Date(2026, 11, 31))).toBe('2026-12');
  });

  it('currentMonthKey reflete a data atual', () => {
    expect(currentMonthKey()).toBe(toMonthKey(new Date()));
  });

  it('prevMonthKey cruza a virada do ano', () => {
    expect(prevMonthKey('2026-07')).toBe('2026-06');
    expect(prevMonthKey('2026-01')).toBe('2025-12');
    expect(prevMonthKey('2025-12')).toBe('2025-11');
  });
});

describe('limites e formato de mês', () => {
  it('monthStart aponta para o dia 1 à meia-noite', () => {
    const d = monthStart('2026-07');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6); // julho
    expect(d.getDate()).toBe(1);
    expect(d.getHours()).toBe(0);
  });

  it('monthEnd cobre o último instante do mês', () => {
    const julho = monthEnd('2026-07');
    expect(julho.getDate()).toBe(31);
    expect(julho.getHours()).toBe(23);
    expect(julho.getMinutes()).toBe(59);

    // Fevereiro de 2026 tem 28 dias
    expect(monthEnd('2026-02').getDate()).toBe(28);
    // Bissexto: fevereiro de 2028 tem 29
    expect(monthEnd('2028-02').getDate()).toBe(29);
  });

  it('monthISO gera o primeiro dia no formato das tabelas', () => {
    expect(monthISO('2026-07')).toBe('2026-07-01');
    expect(monthISO('2026-12')).toBe('2026-12-01');
  });

  it('monthLabel e monthLabelLong em pt-BR', () => {
    expect(monthLabel('2026-07')).toBe('jul/26');
    expect(monthLabel('2026-01')).toBe('jan/26');
    expect(monthLabelLong('2026-07')).toBe('Julho de 2026');
    expect(monthLabelLong('2026-01')).toBe('Janeiro de 2026');
  });
});

describe('isInMonth', () => {
  it('detecta se um valor ISO pertence ao mês', () => {
    expect(isInMonth('2026-07-15T10:00:00', '2026-07')).toBe(true);
    expect(isInMonth('2026-07-01T00:00:00', '2026-07')).toBe(true);
    expect(isInMonth('2026-06-30T23:59:59', '2026-07')).toBe(false);
  });

  it('lida com valores inválidos e vazios', () => {
    expect(isInMonth(null, '2026-07')).toBe(false);
    expect(isInMonth(undefined, '2026-07')).toBe(false);
    expect(isInMonth('data inválida', '2026-07')).toBe(false);
    expect(isInMonth('', '2026-07')).toBe(false);
  });
});

describe('recentMonths', () => {
  it('retorna os N últimos meses, mais antigo primeiro', () => {
    const agora = currentMonthKey();
    const lista = recentMonths(3);

    expect(lista.length).toBe(3);
    expect(lista[2]).toBe(agora);
    expect(lista[0]).toBe(prevMonthKey(prevMonthKey(agora)));
  });

  it('retorna lista vazia para contagem zero', () => {
    expect(recentMonths(0)).toEqual([]);
  });
});
