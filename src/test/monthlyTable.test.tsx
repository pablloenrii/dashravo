/**
 * RAVO OS — Testes da MonthlyTable (análise mês a mês)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthlyTable } from '@/components/MonthlyTable';
import { mergeMonthly } from '@/utils/monthlyAnalysis';

const rows = mergeMonthly(
  [
    { mes: 'Mai', receita: 1000, despesa: 400, lucro: 600 },
    { mes: 'Jun', receita: 1500, despesa: 500, lucro: 1000 },
    { mes: 'Jul', receita: 2000, despesa: 800, lucro: 1200 },
  ],
  [],
  [],
  [],
  ['2026-05', '2026-06', '2026-07']
);

describe('MonthlyTable', () => {
  it('renderiza cabeçalho, linhas e total das métricas padrão', () => {
    render(<MonthlyTable rows={rows} />);
    expect(screen.getByText('Mês')).toBeTruthy();
    expect(screen.getByText('Receita')).toBeTruthy();
    expect(screen.getByText('Investimento')).toBeTruthy();
    expect(screen.getByText('Mai')).toBeTruthy();
    expect(screen.getByText('Jul')).toBeTruthy();
    expect(screen.getByText('Total / média')).toBeTruthy();
    // total de receita (1k + 1,5k + 2k) formatado
    expect(screen.getByText('R$ 4.5k')).toBeTruthy();
  });

  it('formata métricas com o formatador do registro', () => {
    render(<MonthlyTable rows={rows} />);
    expect(screen.getAllByText('60.0%').length).toBe(2); // margem de Maio e Julho
  });

  it('destaca a linha do mês selecionado e não dispara clique sem callback', () => {
    const onSelectMonth = vi.fn();
    render(<MonthlyTable rows={rows} highlightedMonth="2026-06" onSelectMonth={onSelectMonth} />);
    expect(screen.getByText(/selecionado/)).toBeTruthy();
    fireEvent.click(screen.getByText('Jun'));
    expect(onSelectMonth).toHaveBeenCalledWith('2026-06');
  });

  it('permite trocar as métricas selecionadas', () => {
    const onChange = vi.fn();
    render(<MonthlyTable rows={rows} selected={['receita']} onSelectedChange={onChange} />);
    fireEvent.click(screen.getByText('Investimento'));
    expect(onChange).toHaveBeenCalledWith(['receita', 'despesa']);
  });

  it('mostra estado vazio quando não há linhas', () => {
    render(<MonthlyTable rows={[]} />);
    expect(screen.getByText('Sem dados para o período selecionado.')).toBeTruthy();
  });

  it('mostra placeholder de carregamento quando loading e sem linhas', () => {
    render(<MonthlyTable rows={[]} loading />);
    expect(screen.getByText('Carregando análise…')).toBeTruthy();
  });
});
