/**
 * RAVO OS — Testes do MonthDetailPanel (métricas do mês)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthDetailPanel } from '@/components/MonthDetailPanel';
import { monthLabelLong } from '@/contexts/PeriodContext';

const ok = () => ({ data: [], loading: false, error: null, refetch: vi.fn() });

vi.mock('@/hooks/useMetricsQueries', () => ({
  useMRRData: () => ({
    data: [
      { mes: 'Jun', mrr: 110000, arr: 1320000 },
      { mes: 'Jul', mrr: 130000, arr: 1560000 },
    ], loading: false, error: null, refetch: vi.fn(),
  }),
  useChurnData: () => ({
    data: [
      { mes: 'Jun', churn_rate: 2.5, nrr: 106 },
      { mes: 'Jul', churn_rate: 2, nrr: 108 },
    ], loading: false, error: null, refetch: vi.fn(),
  }),
  useCustomerMetrics: () => ({
    data: { 'Active Customers': 92, LTV: 30000, CAC: 5000 },
    loading: false, error: null, refetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/usePagesQueries', () => ({
  useFinanceChartData: () => ({
    data: [
      { mes: 'Jun', receita: 185000, despesa: 95000, lucro: 90000 },
      { mes: 'Jul', receita: 215000, despesa: 98000, lucro: 117000 },
    ], loading: false, error: null, refetch: vi.fn(),
  }),
  useContactsData: () => ok(),
  useContactsChartData: () => ({
    data: [
      { mes: 'Jun', novos: 18, ativos: 78 },
      { mes: 'Jul', novos: 21, ativos: 92 },
    ], loading: false, error: null, refetch: vi.fn(),
  }),
  useExpensesData: () => ({
    data: [{ name: 'Pessoal', value: 45000, percentual: 42, fill: '#EDEDED' }],
    loading: false, error: null, refetch: vi.fn(),
  }),
  useCashFlowData: () => ok(),
}));

describe('MonthDetailPanel', () => {
  it('renderiza nada quando não há mês selecionado', () => {
    const { container } = render(<MonthDetailPanel month={null} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('mostra o título do mês e as métricas consolidadas', () => {
    render(<MonthDetailPanel month="2026-07" onClose={vi.fn()} />);
    expect(screen.getByText(`Métricas · ${monthLabelLong('2026-07')}`)).toBeTruthy();

    // financeiro
    expect(screen.getByText('R$ 215k')).toBeTruthy(); // receita
    expect(screen.getByText('R$ 98k')).toBeTruthy(); // investimento
    expect(screen.getByText('R$ 117k')).toBeTruthy(); // lucro
    expect(screen.getByText('54.4%')).toBeTruthy(); // margem

    // recorrência e aquisição
    expect(screen.getByText('130K')).toBeTruthy(); // MRR
    expect(screen.getByText('1.6M')).toBeTruthy(); // ARR
    expect(screen.getByText('92')).toBeTruthy(); // clientes ativos (customer metrics)
    expect(screen.getByText('21')).toBeTruthy(); // novos leads
    expect(screen.getByText('2.0%')).toBeTruthy(); // churn
    expect(screen.getByText('108%')).toBeTruthy(); // nrr
    expect(screen.getByText('6.0')).toBeTruthy(); // ltv/cac (30000/5000)

    // comercial
    expect(screen.getByText('Win rate')).toBeTruthy();
    expect(screen.getByText('Ciclo de venda')).toBeTruthy();
  });

  it('fecha ao clicar no botão de fechar', () => {
    const onClose = vi.fn();
    render(<MonthDetailPanel month="2026-07" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
