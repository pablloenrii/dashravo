/**
 * RAVO OS — Testes dos helpers de tickets (src/utils/tickets.ts)
 */

import { describe, it, expect } from 'vitest';
import { parseTempoResposta } from '@/utils/tickets';

describe('parseTempoResposta', () => {
  it('converte "Xh Ym" em minutos', () => {
    expect(parseTempoResposta('2h 15m')).toBe(135);
    expect(parseTempoResposta('45m')).toBe(45);
    expect(parseTempoResposta('3h')).toBe(180);
    expect(parseTempoResposta('2H 30M')).toBe(150);
    expect(parseTempoResposta('1h 0m')).toBe(60);
  });

  it('retorna 0 para valores vazios ou não reconhecidos', () => {
    expect(parseTempoResposta(undefined)).toBe(0);
    expect(parseTempoResposta(null)).toBe(0);
    expect(parseTempoResposta('')).toBe(0);
    expect(parseTempoResposta('abc')).toBe(0);
    expect(parseTempoResposta('tempo')).toBe(0);
  });
});
