/**
 * RAVO OS — Testes do ErrorBoundary e ErrorBoundaryVisual
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorBoundaryVisual } from '@/components/ErrorBoundaryVisual';

// Evita timers reais do toastError e ruído de console
vi.mock('@/utils/toast', () => ({ toastError: vi.fn() }));

let shouldThrow = true;

function Flaky() {
  if (shouldThrow) throw new Error('erro flaky');
  return <div>recuperado</div>;
}

function quiet() {
  return vi.spyOn(console, 'error').mockImplementation(() => undefined);
}

beforeEach(() => {
  shouldThrow = true;
});

describe('ErrorBoundary', () => {
  it('renderiza os children sem erro', () => {
    shouldThrow = false;
    render(<ErrorBoundary><div>conteúdo</div></ErrorBoundary>);
    expect(screen.getByText('conteúdo')).toBeTruthy();
  });

  it('captura o erro e mostra o fallback visual', () => {
    quiet();
    render(<ErrorBoundary><Flaky /></ErrorBoundary>);
    expect(screen.getByText('Algo deu errado')).toBeTruthy();
    expect(screen.getByText('erro flaky')).toBeTruthy();
  });

  it('invoca onError quando o erro é capturado', () => {
    quiet();
    const onError = vi.fn();
    render(<ErrorBoundary onError={onError}><Flaky /></ErrorBoundary>);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('usa o fallback customizado em vez do visual padrão', () => {
    quiet();
    render(
      <ErrorBoundary fallback={<div>fallback custom</div>}><Flaky /></ErrorBoundary>
    );
    expect(screen.getByText('fallback custom')).toBeTruthy();
  });

  it('"Tentar novamente" recupera quando o erro é corrigido', () => {
    quiet();
    render(<ErrorBoundary><Flaky /></ErrorBoundary>);
    expect(screen.getByText('Algo deu errado')).toBeTruthy();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/ }));
    expect(screen.getByText('recuperado')).toBeTruthy();
  });
});

describe('ErrorBoundaryVisual', () => {
  it('renderiza título e descrição padrão', () => {
    render(<ErrorBoundaryVisual />);
    expect(screen.getByText('Algo deu errado')).toBeTruthy();
    expect(screen.getByText(/Houve um erro ao carregar os dados/)).toBeTruthy();
  });

  it('aceita título e descrição customizados', () => {
    render(<ErrorBoundaryVisual title="Título" description="Descrição" />);
    expect(screen.getByText('Título')).toBeTruthy();
    expect(screen.getByText('Descrição')).toBeTruthy();
  });

  it('exibe erro como string e como Error', () => {
    const { rerender } = render(<ErrorBoundaryVisual error="string de erro" />);
    expect(screen.getByText('string de erro')).toBeTruthy();
    rerender(<ErrorBoundaryVisual error={new Error('error object')} />);
    expect(screen.getByText('error object')).toBeTruthy();
  });

  it('chama onRetry no clique', () => {
    const onRetry = vi.fn();
    render(<ErrorBoundaryVisual onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('aplica hover no botão de retry', () => {
    render(<ErrorBoundaryVisual onRetry={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /Tentar novamente/ });
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
  });

  it('não renderiza o botão de retry sem onRetry', () => {
    render(<ErrorBoundaryVisual />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
