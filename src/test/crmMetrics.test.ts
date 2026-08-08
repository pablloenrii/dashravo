/**
 * RAVO OS — Testes das métricas comerciais (src/utils/crmMetrics.ts)
 *
 * Cobrem o recorte temporal por mês, o pipeline/funil e o desempenho por canal
 * — a lógica que alimenta os KPIs do CRM e do Dashboard.
 *
 * Nota: datas usam strings LOCAIS (sem 'Z') para que o resultado não dependa
 * do fuso horário onde a suíte roda.
 */

import { describe, it, expect } from 'vitest';
import { computeCrmMetrics, computeFunnel, computeBySource } from '@/utils/crmMetrics';
import type { ContactData } from '@/hooks/usePagesQueries';

function makeContact(partial: Partial<ContactData> & { id: string }): ContactData {
  return {
    nome: 'Contato',
    empresa: '',
    email: '',
    etapa: 'Qualificado',
    valor: 0,
    ...partial,
  };
}

const JUL = '2026-07';

describe('computeCrmMetrics', () => {
  // c1: novo no mês, em aberto e PARADO (updated antigo)
  const c1 = makeContact({ id: '1', etapa: 'Qualificado', valor: 10000, created_at: '2026-07-05T10:00:00', updated_at: '2026-06-01T10:00:00' });
  // c2: criado antes do mês, GANHO no mês
  const c2 = makeContact({ id: '2', etapa: 'Ganho', valor: 50000, created_at: '2026-06-20T10:00:00', updated_at: '2026-07-10T10:00:00' });
  // c3: novo e PERDIDO no mês
  const c3 = makeContact({ id: '3', etapa: 'Perdido', valor: 30000, created_at: '2026-07-15T10:00:00', updated_at: '2026-07-16T10:00:00' });
  // c4: criado antes do mês, em aberto, atualizado agora (não parado)
  const c4 = makeContact({ id: '4', etapa: 'Proposta', valor: 20000, created_at: '2026-06-01T10:00:00', updated_at: new Date().toISOString() });
  // c5: novo e GANHO no mês
  const c5 = makeContact({ id: '5', etapa: 'Ganho', valor: 40000, created_at: '2026-07-20T10:00:00', updated_at: '2026-07-25T10:00:00' });

  const all = [c1, c2, c3, c4, c5];

  it('recorta o mês corretamente e calcula KPIs', () => {
    const m = computeCrmMetrics(all, JUL);

    // Recorte temporal
    expect(m.novosLeadsCount).toBe(3);          // c1, c3, c5
    expect(m.ganhos.map((c) => c.id)).toEqual(['2', '5']);
    expect(m.perdidos.map((c) => c.id)).toEqual(['3']);
    expect(m.abertos.map((c) => c.id)).toEqual(['1', '4']); // só etapas abertas

    // KPIs
    expect(m.receitaGanha).toBe(90000);
    expect(m.pipelineAberto).toBe(30000);
    expect(m.forecast).toBe(18000);             // 10k×0.5 + 20k×0.65
    expect(m.winRate).toBe(67);                 // 2 ganhos / (2+1)
    expect(m.ticketMedio).toBe(45000);          // 90k / 2
    expect(m.cicloMedio).toBe(13);              // (20d + 5d) / 2 = 12.5 → 13
    expect(m.parados).toBe(1);                  // só c1 tem updated antigo
    expect(m.conversao).toBe(67);               // 2 / 3
  });

  it('sem filtro de mês considera todo o histórico', () => {
    const m = computeCrmMetrics(all, null);

    expect(m.novosLeadsCount).toBe(5);
    expect(m.ganhos.length).toBe(2);
    expect(m.receitaGanha).toBe(90000);
    expect(m.pipelineAberto).toBe(30000);
    expect(m.conversao).toBe(40);               // 2 / 5
  });

  it('retorna zeros com lista vazia', () => {
    const m = computeCrmMetrics([], JUL);
    expect(m).toMatchObject({
      receitaGanha: 0,
      pipelineAberto: 0,
      forecast: 0,
      winRate: 0,
      ticketMedio: 0,
      cicloMedio: 0,
      parados: 0,
      novosLeadsCount: 0,
      conversao: 0,
    });
  });
});

describe('computeFunnel', () => {
  const qualificado = makeContact({ id: 'a', etapa: 'Qualificado', valor: 10000, origem: 'Inbound' });
  const proposta = makeContact({ id: 'b', etapa: 'Proposta', valor: 20000, origem: 'Inbound' });
  const perdido = makeContact({ id: 'c', etapa: 'Perdido', valor: 5000, origem: 'Outbound' });

  it('conta quem alcançou cada etapa (posição atual como proxy)', () => {
    const funnel = computeFunnel([qualificado, proposta]);

    const ordem = ['Novo Lead', 'Contato Feito', 'Qualificado', 'Proposta', 'Negociação', 'Ganho'];
    expect(funnel.map((s) => s.etapa)).toEqual(ordem);
    expect(funnel.map((s) => s.quantidade)).toEqual([2, 2, 2, 1, 0, 0]);
    expect(funnel.map((s) => s.conversaoEtapa)).toEqual([100, 100, 100, 50, 0, 0]);
  });

  it('não conta lead "Perdido" como avanço no funil', () => {
    const funnel = computeFunnel([qualificado, proposta, perdido]);
    // Perdido não soma em nenhuma etapa
    expect(funnel[0].quantidade).toBe(2);
    expect(funnel[5].quantidade).toBe(0);
  });
});

describe('computeBySource', () => {
  it('agrega por origem e ordena por receita', () => {
    const rows = computeBySource([
      makeContact({ id: 'a', etapa: 'Ganho', valor: 40000, origem: 'Inbound' }),
      makeContact({ id: 'b', etapa: 'Ganho', valor: 50000, origem: 'Indicação' }),
      makeContact({ id: 'c', etapa: 'Qualificado', valor: 0, origem: 'Inbound' }),
      makeContact({ id: 'd', etapa: 'Ganho', valor: 0, origem: '' }),
    ]);

    expect(rows.map((r) => r.origem)).toEqual(['Indicação', 'Inbound', 'Não informado']);

    const indicacao = rows[0];
    expect(indicacao).toMatchObject({ leads: 1, ganhos: 1, receita: 50000, winRate: 100 });

    const inbound = rows[1];
    expect(inbound).toMatchObject({ leads: 2, ganhos: 1, receita: 40000, winRate: 50 });
  });

  it('sem origem, rotula como "Não informado"', () => {
    const rows = computeBySource([makeContact({ id: 'x', etapa: 'Ganho', valor: 1000 })]);
    expect(rows[0].origem).toBe('Não informado');
  });
});
