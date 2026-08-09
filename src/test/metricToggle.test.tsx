/**
 * RAVO OS — Testes do MetricToggle (chips de seleção de métricas)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MetricToggle } from '@/components/MetricToggle';

const options = [
  { key: 'receita', label: 'Receita', color: '#3FB950' },
  { key: 'despesa', label: 'Investimento', color: '#8B8B8B' },
];

describe('MetricToggle', () => {
  it('renderiza as opções', () => {
    render(<MetricToggle metrics={options} selected={['receita']} onChange={vi.fn()} />);
    expect(screen.getByText('Receita')).toBeTruthy();
    expect(screen.getByText('Investimento')).toBeTruthy();
  });

  it('adiciona a métrica quando desativada', () => {
    const onChange = vi.fn();
    render(<MetricToggle metrics={options} selected={['receita']} onChange={onChange} />);
    fireEvent.click(screen.getByText('Investimento'));
    expect(onChange).toHaveBeenCalledWith(['receita', 'despesa']);
  });

  it('remove a métrica quando ativada', () => {
    const onChange = vi.fn();
    render(<MetricToggle metrics={options} selected={['receita', 'despesa']} onChange={onChange} />);
    fireEvent.click(screen.getByText('Receita'));
    expect(onChange).toHaveBeenCalledWith(['despesa']);
  });

  it('marca aria-pressed para itens ativos', () => {
    render(<MetricToggle metrics={options} selected={['receita']} onChange={vi.fn()} />);
    expect(screen.getByText('Receita').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Investimento').getAttribute('aria-pressed')).toBe('false');
  });
});
