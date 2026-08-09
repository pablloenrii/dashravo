/**
 * RAVO OS — Testes da análise mensal (src/utils/monthlyAnalysis.ts)
 */

import { describe, it, expect } from 'vitest';
import {
  mergeMonthly, summarize, MONTHLY_METRICS, DEFAULT_SELECTED,
  monthSnapshot,
  FinanceSlice, MRRSlice, ChurnSlice, ContactSlice, MrrFullSlice,
} from '@/utils/monthlyAnalysis';

const finance: FinanceSlice[] = [
  { mes: 'Mai', receita: 1000, despesa: 400, lucro: 600 },
  { mes: 'Jun', receita: 1500, despesa: 500, lucro: 1000 },
  { mes: 'Jul', receita: 2000, despesa: 800, lucro: 1200 },
];

const mrr: MRRSlice[] = [
  { mes: 'Mai', mrr: 800 },
  { mes: 'Jun', mrr: 1100 },
  { mes: 'Jul', mrr: 1500 },
];

const churn: ChurnSlice[] = [
  { mes: 'Mai', churn_rate: 3, nrr: 104 },
  { mes: 'Jun', churn_rate: 2.5, nrr: 106 },
  { mes: 'Jul', churn_rate: 2, nrr: 108 },
];

const contacts: ContactSlice[] = [
  { mes: 'Mai', novos: 10, ativos: 40 },
  { mes: 'Jun', novos: 12, ativos: 52 },
  { mes: 'Jul', novos: 15, ativos: 67 },
];

describe('mergeMonthly', () => {
  it('une as séries pela chave mes e deriva a margem', () => {
    const rows = mergeMonthly(finance, mrr, churn, contacts);
    expect(rows.length).toBe(3);
    expect(rows[0]).toMatchObject({
      mes: 'Mai', receita: 1000, despesa: 400, lucro: 600,
      mrr: 800, churn: 3, nrr: 104, novos: 10, ativos: 40,
    });
    expect(rows[0].margem).toBeCloseTo(60);
  });

  it('anexa a chave canônica alinhada por índice', () => {
    const keys = ['2026-05', '2026-06', '2026-07'];
    const rows = mergeMonthly(finance, mrr, churn, contacts, keys);
    expect(rows[0].key).toBe('2026-05');
    expect(rows[2].key).toBe('2026-07');
  });

  it('mantém mês de séries que só existem em uma fonte (sem quebrar)', () => {
    const extraFinance = [{ mes: 'Abr', receita: 900, despesa: 300, lucro: 600 }];
    const rows = mergeMonthly([...extraFinance, ...finance], [], [], []);
    expect(rows.length).toBe(4);
    expect(rows[0].mes).toBe('Abr');
    expect(rows[0].mrr).toBeUndefined();
  });

  it('retorna lista vazia quando não há dados', () => {
    expect(mergeMonthly([], [], [], [])).toEqual([]);
  });

  it('margem é undefined quando receita é zero', () => {
    const rows = mergeMonthly([{ mes: 'Jan', receita: 0, despesa: 100, lucro: -100 }], [], [], []);
    expect(rows[0].margem).toBeUndefined();
  });
});

describe('summarize', () => {
  const rows = mergeMonthly(finance, mrr, churn, contacts);

  it('soma métricas monetárias', () => {
    expect(summarize(rows, 'receita')).toBe(4500);
    expect(summarize(rows, 'lucro')).toBe(2800);
  });

  it('calcula média para percentuais', () => {
    expect(summarize(rows, 'churn')).toBeCloseTo(2.5);
  });

  it('retorna undefined sem valores válidos', () => {
    const semChurn = mergeMonthly(finance, mrr, [], []);
    expect(summarize(semChurn, 'churn')).toBeUndefined();
  });
});

describe('registro de métricas', () => {
  it('expõe todas as métricas mapeadas e as padrão selecionadas', () => {
    expect(Object.keys(MONTHLY_METRICS)).toHaveLength(9);
    expect(DEFAULT_SELECTED).toEqual(['receita', 'despesa', 'lucro', 'margem']);
  });
});

describe('monthSnapshot', () => {
  const finSnap: FinanceSlice[] = [
    { mes: 'Jun', receita: 185000, despesa: 95000, lucro: 90000 },
    { mes: 'Jul', receita: 215000, despesa: 98000, lucro: 117000 },
  ];
  const mrrSnap: MrrFullSlice[] = [
    { mes: 'Jun', mrr: 110000, arr: 1320000 },
    { mes: 'Jul', mrr: 130000, arr: 1560000 },
  ];
  const churnSnap: ChurnSlice[] = [
    { mes: 'Jun', churn_rate: 2.5, nrr: 106 },
    { mes: 'Jul', churn_rate: 2, nrr: 108 },
  ];
  const ctSnap: ContactSlice[] = [
    { mes: 'Jun', novos: 18, ativos: 78 },
    { mes: 'Jul', novos: 21, ativos: 92 },
  ];

  it('usa o último item da janela como mês atual e deriva margem', () => {
    const snap = monthSnapshot(finSnap, mrrSnap, churnSnap, ctSnap, '2026-07');
    expect(snap.key).toBe('2026-07');
    expect(snap.mes).toBe('Jul');
    expect(snap.current).toMatchObject({
      receita: 215000, despesa: 98000, lucro: 117000,
      mrr: 130000, arr: 1560000, churn: 2, nrr: 108, novos: 21, ativos: 92,
    });
    expect(snap.current.margem).toBeCloseTo(54.42, 2);
  });

  it('calcula deltas vs mês anterior (e margem em pontos percentuais)', () => {
    const snap = monthSnapshot(finSnap, mrrSnap, churnSnap, ctSnap);
    expect(snap.previous).toMatchObject({ receita: 185000, mrr: 110000 });
    expect(snap.deltas.receita).toBeCloseTo(((215000 - 185000) / 185000) * 100);
    expect(snap.deltas.mrr).toBeCloseTo(((130000 - 110000) / 110000) * 100);
    // margem: 54.4% - 48.6%
    const prevMargem = (90000 / 185000) * 100;
    expect(snap.deltaMargem).toBeCloseTo(snap.current.margem - prevMargem);
  });

  it('não expõe deltas quando a janela tem um único mês', () => {
    const snap = monthSnapshot(
      [{ mes: 'Jul', receita: 100, despesa: 40, lucro: 60 }],
      [], [], [],
    );
    expect(snap.previous).toBeUndefined();
    expect(snap.deltas).toEqual({});
    expect(snap.deltaMargem).toBeUndefined();
  });

  it('suporta séries vazias (zeros sem quebrar)', () => {
    const snap = monthSnapshot([], [], [], []);
    expect(snap.mes).toBe('');
    expect(snap.current.receita).toBe(0);
    expect(snap.previous).toBeUndefined();
  });

  it('não calcula delta de margem quando a receita é zero', () => {
    const snap = monthSnapshot(
      [
        { mes: 'Jun', receita: 0, despesa: 0, lucro: 0 },
        { mes: 'Jul', receita: 0, despesa: 0, lucro: 0 },
      ],
      [], [], [],
    );
    expect(snap.deltaMargem).toBeUndefined();
  });
});
