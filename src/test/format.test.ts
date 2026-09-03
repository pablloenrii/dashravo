/**
 * RAVO OS — Testes dos formatadores compartilhados (src/utils/format.ts)
 */

import { describe, it, expect } from 'vitest';
import { fmtK, fmtMoney, fmtMoneyFull, fmtMoneyCents, pctChange } from '@/utils/format';

describe('fmtK', () => {
  it('retorna o número inteiro abaixo de milhar', () => {
    expect(fmtK(0)).toBe('0');
    expect(fmtK(999)).toBe('999');
    expect(fmtK(-500)).toBe('-500');
  });

  it('compacta em K sem casa decimal quando múltiplo de 1000', () => {
    expect(fmtK(1000)).toBe('1K');
    expect(fmtK(25000)).toBe('25K');
    expect(fmtK(-1000)).toBe('-1K');
  });

  it('compacta em K com uma casa decimal caso contrário', () => {
    expect(fmtK(1250)).toBe('1.3K');
    expect(fmtK(1500)).toBe('1.5K');
  });

  it('compacta em M a partir de 1 milhão', () => {
    expect(fmtK(1_000_000)).toBe('1.0M');
    expect(fmtK(1_250_000)).toBe('1.3M');
  });
});

describe('fmtMoney', () => {
  it('formata valores abaixo de R$ 1k sem casas decimais', () => {
    expect(fmtMoney(0)).toBe('R$ 0');
    expect(fmtMoney(720)).toBe('R$ 720');
    expect(fmtMoney(999.5)).toBe('R$ 1000');
  });

  it('compacta valores a partir de R$ 1k', () => {
    expect(fmtMoney(1000)).toBe('R$ 1k');
    expect(fmtMoney(1250)).toBe('R$ 1.3k');
    expect(fmtMoney(15_000)).toBe('R$ 15k');
  });

  it('trata valores negativos', () => {
    expect(fmtMoney(-720)).toBe('R$ -720');
    expect(fmtMoney(-1250)).toBe('R$ -1.3k');
  });
});

describe('fmtMoneyFull', () => {
  it('formata moeda completa com milhar pt-BR', () => {
    // toLocaleString pt-BR usa espaço não separável entre R$ e o número
    expect(fmtMoneyFull(1_250_000).replace(/\u00A0/g, ' ')).toBe('R$ 1.250.000');
    expect(fmtMoneyFull(720).replace(/\u00A0/g, ' ')).toBe('R$ 720');
  });
});

describe('fmtMoneyCents', () => {
  it('formata moeda completa com centavos (pt-BR)', () => {
    expect(fmtMoneyCents(11000).replace(/\u00A0/g, ' ')).toBe('R$ 11.000,00');
    expect(fmtMoneyCents(1_250_000.5).replace(/\u00A0/g, ' ')).toBe('R$ 1.250.000,50');
    expect(fmtMoneyCents(0).replace(/\u00A0/g, ' ')).toBe('R$ 0,00');
  });
});

describe('pctChange', () => {
  it('calcula variação positiva e negativa', () => {
    expect(pctChange(120, 100)).toBe(20);
    expect(pctChange(80, 100)).toBe(-20);
  });

  it('usa o valor absoluto da base', () => {
    expect(pctChange(100, -100)).toBe(200);
  });

  it('retorna undefined quando a base é 0', () => {
    expect(pctChange(100, 0)).toBeUndefined();
  });

  it('retorna undefined para entradas não finitas', () => {
    expect(pctChange(NaN, 100)).toBeUndefined();
    expect(pctChange(100, NaN)).toBeUndefined();
    expect(pctChange(Infinity, 100)).toBeUndefined();
  });
});
