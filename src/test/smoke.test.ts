/**
 * RAVO OS — Smoke Test
 * Garante que o pipeline de testes continua funcional
 * e cobre utilitários reais usados pelo app.
 */

import { describe, it, expect } from 'vitest';
import { toNumber } from '@/hooks/useSupabaseQuery';

describe('toNumber', () => {
  it('converte valores numéricos', () => {
    expect(toNumber(42)).toBe(42);
    expect(toNumber('42')).toBe(42);
  });

  it('trata valores nulos e inválidos', () => {
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
    expect(toNumber('abc')).toBe(0);
  });
});
