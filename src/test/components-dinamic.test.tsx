/**
 * RAVO OS — Testes de MetricCard, KPICardMinimal, Alert, Modal e QueryState
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MetricCard, pctChange as metricPctChange } from '@/components/MetricCard';
import { KPICardMinimal } from '@/components/KPICardMinimal';
import { Alert } from '@/components/Alert';
import { Modal } from '@/components/Modal';
import { QueryError, QueryLoading } from '@/components/QueryState';

afterEach(() => {
  vi.useRealTimers();
});

describe('MetricCard', () => {
  it('renderiza label, valor e sublabel', () => {
    render(<MetricCard label="MRR" value="R$ 50k" sublabel="vs mês anterior" />);
    expect(screen.getByText('MRR')).toBeTruthy();
    expect(screen.getByText('R$ 50k')).toBeTruthy();
    expect(screen.getByText('vs mês anterior')).toBeTruthy();
  });

  it('exibe variação positiva em verde', () => {
    render(<MetricCard label="MRR" value="R$ 50k" deltaPct={15} />);
    expect(screen.getByText('15%')).toBeTruthy();
  });

  it('exibe variação negativa em vermelho', () => {
    render(<MetricCard label="MRR" value="R$ 50k" deltaPct={-10} />);
    expect(screen.getByText('10%')).toBeTruthy();
  });

  it('trata variação quase nula como flat (0%)', () => {
    render(<MetricCard label="MRR" value="R$ 50k" deltaPct={0.2} />);
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('invertDelta marca variação positiva como negativa (sem quebrar)', () => {
    render(<MetricCard label="Churn" value="2%" deltaPct={10} invertDelta />);
    expect(screen.getByText('10%')).toBeTruthy();
  });

  it('mostra barra de progresso com cor por faixa de atingimento', () => {
    const { rerender } = render(<MetricCard label="Meta" value="80%" progress={120} />);
    expect(screen.getByText('80%')).toBeTruthy();
    rerender(<MetricCard label="Meta" value="80%" progress={80} />);
    rerender(<MetricCard label="Meta" value="80%" progress={30} />);
  });

  it('em loading mostra placeholder e omite delta/progresso', () => {
    render(<MetricCard label="MRR" value="R$ 50k" deltaPct={10} progress={50} loading />);
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.queryByText('10%')).toBeNull();
  });

  it('dispara onClick e trata hover quando clicável', () => {
    const onClick = vi.fn();
    render(<MetricCard label="MRR" value="R$ 50k" onClick={onClick} />);
    const card = screen.getByText('MRR').parentElement!.parentElement!;
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('pctChange do MetricCard retorna undefined com base 0', () => {
    expect(metricPctChange(100, 0)).toBeUndefined();
    expect(metricPctChange(120, 100)).toBe(20);
  });
});

describe('KPICardMinimal', () => {
  it('renderiza título, valor, unidade e trend', () => {
    render(<KPICardMinimal title="MRR" value={50000} unit="R$" trend="+12%" />);
    expect(screen.getByText('50000')).toBeTruthy();
    expect(screen.getByText('R$')).toBeTruthy();
    expect(screen.getByText('MRR')).toBeTruthy();
    expect(screen.getByText('+12%')).toBeTruthy();
  });

  it('em loading renderiza skeleton sem valor', () => {
    render(<KPICardMinimal title="MRR" value={50000} loading />);
    expect(screen.queryByText('50000')).toBeNull();
    expect(screen.queryByText('MRR')).toBeNull();
  });

  it('renderiza ícone quando fornecido', () => {
    render(<KPICardMinimal title="MRR" value={1} icon={<span data-testid="kpi-icon">$</span>} />);
    expect(screen.getByTestId('kpi-icon')).toBeTruthy();
  });

  it('aplica hover no card', () => {
    const { container } = render(<KPICardMinimal title="MRR" value={1} />);
    const card = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
  });
});

describe('Alert', () => {
  it('renderiza mensagem e título', () => {
    render(<Alert title="Erro" message="Falha ao carregar" type="error" />);
    expect(screen.getByText('Erro')).toBeTruthy();
    expect(screen.getByText('Falha ao carregar')).toBeTruthy();
  });

  it('fecha ao clicar no botão e chama onClose', () => {
    const onClose = vi.fn();
    render(<Alert message="msg" onClose={onClose} />);
    const closeBtn = document.querySelector('button');
    fireEvent.click(closeBtn!);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('msg')).toBeNull();
  });

  it('não renderiza botão de fechar quando closable=false', () => {
    render(<Alert message="msg" closable={false} />);
    expect(document.querySelector('button')).toBeNull();
  });

  it('fecha automaticamente após autoClose', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Alert message="auto" autoClose={500} onClose={onClose} />);
    act(() => vi.advanceTimersByTime(500));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('auto')).toBeNull();
  });
});

describe('Modal', () => {
  it('retorna null quando fechado', () => {
    const { container } = render(<Modal isOpen={false} onClose={vi.fn()}>x</Modal>);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza título, children e footer quando aberto', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Novo deal" footer={<button>Salvar</button>}>
        conteúdo
      </Modal>
    );
    expect(screen.getByText('Novo deal')).toBeTruthy();
    expect(screen.getByText('conteúdo')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeTruthy();
  });

  it('fecha ao clicar no botão X e ao pressionar Escape', () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="Título">x</Modal>);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('fecha ao clicar no backdrop, mas não ao clicar no conteúdo', () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="Título">conteúdo</Modal>);
    fireEvent.click(screen.getByText('conteúdo'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('oculta o botão de fechar quando closeButton=false', () => {
    render(<Modal isOpen onClose={vi.fn()} closeButton={false} title="Título">x</Modal>);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('QueryState', () => {
  it('QueryError mostra a mensagem', () => {
    render(<QueryError message="Falha na RPC" />);
    expect(screen.getByText('Falha na RPC')).toBeTruthy();
    expect(screen.getByText('Erro ao carregar dados')).toBeTruthy();
  });

  it('QueryError chama onRetry no clique', () => {
    const onRetry = vi.fn();
    render(<QueryError message="erro" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('QueryError não renderiza retry sem onRetry', () => {
    render(<QueryError message="erro" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('QueryLoading renderiza skeleton com aria-busy', () => {
    const { container } = render(<QueryLoading height={200} />);
    const el = container.querySelector('[aria-busy="true"]');
    expect(el).toBeTruthy();
  });
});
