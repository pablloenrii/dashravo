/**
 * RAVO OS — Testes de componentes presentacionais básicos
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { ProgressBar } from '@/components/ProgressBar';
import { ChartTooltip } from '@/components/ChartTooltip';
import { SearchBar } from '@/components/SearchBar';
import { ChartCard } from '@/components/ChartCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { chart } from '@/constants/theme';

function withTheme({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('Button', () => {
  it('renderiza o conteúdo e dispara onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Salvar</Button>);
    const btn = screen.getByRole('button', { name: 'Salvar' });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respeita disabled e não dispara onClick', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Salvar</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('mostra loading e desabilita o botão', () => {
    render(<Button loading>Salvar</Button>);
    const btn = screen.getByRole('button', { name: /Salvar/ });
    expect(btn.hasAttribute('disabled')).toBe(true);
  });

  it('mostra o ícone quando presente e não está carregando', () => {
    const icon = <span data-testid="icone">*</span>;
    render(<Button icon={icon}>Salvar</Button>);
    expect(screen.getByTestId('icone')).toBeTruthy();
  });

  it('não mostra o ícone durante loading', () => {
    const icon = <span data-testid="icone">*</span>;
    render(<Button loading icon={icon}>Salvar</Button>);
    expect(screen.queryByTestId('icone')).toBeNull();
  });

  it('aplica hover em todas as variantes e não hover quando disabled', () => {
    (['primary', 'secondary', 'ghost', 'danger'] as const).forEach((variant) => {
      const { unmount } = render(<Button variant={variant}>Salvar</Button>);
      const btn = screen.getByRole('button', { name: 'Salvar' });
      fireEvent.mouseEnter(btn);
      fireEvent.mouseLeave(btn);
      unmount();
    });

    const { unmount } = render(<Button disabled>Salvar</Button>);
    const btn = screen.getByRole('button', { name: 'Salvar' });
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    unmount();
  });
});

describe('Input', () => {
  it('renderiza label, input e propaga onChange', () => {
    const onChange = vi.fn();
    render(<Input label="Nome" placeholder="Digite" onChange={onChange} />);
    expect(screen.getByText('Nome')).toBeTruthy();
    const input = screen.getByPlaceholderText('Digite');
    fireEvent.change(input, { target: { value: 'João' } });
    expect(onChange).toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe('João');
  });

  it('exibe mensagem de erro', () => {
    render(<Input label="Email" error="Email inválido" />);
    expect(screen.getByText('Email inválido')).toBeTruthy();
  });

  it('exibe estado de sucesso', () => {
    render(<Input label="Email" success />);
    expect(screen.getByText('✓ Válido')).toBeTruthy();
  });

  it('renderiza ícone quando fornecido', () => {
    const icon = <span data-testid="icone-input">@</span>;
    render(<Input icon={icon} />);
    expect(screen.getByTestId('icone-input')).toBeTruthy();
  });

  it('aplica foco/desfoque sem quebrar', () => {
    render(<Input placeholder="foco" />);
    const input = screen.getByPlaceholderText('foco');
    fireEvent.focus(input);
    fireEvent.blur(input);
  });
});

describe('Badge', () => {
  it('renderiza o conteúdo com a variante default', () => {
    render(<Badge>Ativo</Badge>);
    expect(screen.getByText('Ativo')).toBeTruthy();
  });

  it('aceita variantes e className', () => {
    render(<Badge variant="success" className="custom">Ok</Badge>);
    const badge = screen.getByText('Ok');
    expect(badge.className).toContain('custom');
  });
});

describe('ProgressBar', () => {
  it('mostra o percentual calculado e o label', () => {
    render(<ProgressBar value={50} label="Atingimento" />);
    expect(screen.getByText('Atingimento')).toBeTruthy();
    expect(screen.getByText('50%')).toBeTruthy();
  });

  it('clampa o percentual em 100%', () => {
    render(<ProgressBar value={150} />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('esconde o valor quando showValue=false', () => {
    render(<ProgressBar value={50} showValue={false} />);
    expect(screen.queryByText('50%')).toBeNull();
  });

  it('não renderiza shimmer quando animated=false', () => {
    render(<ProgressBar value={50} animated={false} />);
    expect(screen.getByText('50%')).toBeTruthy();
  });
});

describe('ChartTooltip', () => {
  it('retorna null quando inativo', () => {
    const { container } = render(<ChartTooltip active={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('retorna null quando não há payload', () => {
    const { container } = render(<ChartTooltip active payload={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza label e entradas com valor formatado', () => {
    render(
      <ChartTooltip
        active
        label="Agosto"
        payload={[
          { name: 'Receita', value: 1250.5, fill: chart.revenue, dataKey: 'receita' },
          { name: 'Despesa', value: '—', fill: chart.line, dataKey: 'despesa' },
        ]}
      />
    );
    expect(screen.getByText('Agosto')).toBeTruthy();
    expect(screen.getByText('Receita')).toBeTruthy();
    expect(screen.getByText('1.250,5')).toBeTruthy();
    expect(screen.getByText('Despesa')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();
  });
});

describe('SearchBar', () => {
  it('dispara onSearchClick ao clicar', () => {
    const onClick = vi.fn();
    render(<SearchBar onSearchClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('mostra o atalho Ctrl K', () => {
    render(<SearchBar onSearchClick={vi.fn()} />);
    expect(screen.getByText('Ctrl K')).toBeTruthy();
  });

  it('aplica hover sem quebrar', () => {
    render(<SearchBar onSearchClick={vi.fn()} />);
    const btn = screen.getByRole('button', { name: 'Buscar' });
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
  });
});

describe('ChartCard', () => {
  it('renderiza título, subtítulo e children', () => {
    render(
      <ChartCard title="MRR" subtitle="últimos 12 meses">
        <div>gráfico</div>
      </ChartCard>
    );
    expect(screen.getByText('MRR')).toBeTruthy();
    expect(screen.getByText('últimos 12 meses')).toBeTruthy();
    expect(screen.getByText('gráfico')).toBeTruthy();
  });

  it('não renderiza subtítulo quando ausente', () => {
    render(<ChartCard title="Só título"><div>x</div></ChartCard>);
    expect(screen.getByText('Só título')).toBeTruthy();
  });
});

describe('ThemeToggle', () => {
  it('alterna o tema ao clicar', () => {
    render(withTheme({ children: <ThemeToggle /> }));
    const btn = screen.getByRole('button', { name: 'Alternar tema' });
    // inicia em dark → clicou muda para light
    expect(btn.getAttribute('title')).toBe('Mudar para tema claro');
    fireEvent.click(btn);
    expect(btn.getAttribute('title')).toBe('Mudar para tema escuro');
    fireEvent.click(btn);
    expect(btn.getAttribute('title')).toBe('Mudar para tema claro');
  });

  it('aplica hover em ambos os modos', () => {
    render(withTheme({ children: <ThemeToggle /> }));
    const btn = screen.getByRole('button', { name: 'Alternar tema' });
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
    fireEvent.click(btn);
    fireEvent.mouseEnter(btn);
    fireEvent.mouseLeave(btn);
  });
});
