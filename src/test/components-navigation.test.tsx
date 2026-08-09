/**
 * RAVO OS — Testes de componentes de navegação e painéis
 * (Breadcrumb, MobileMenu, NotificationsPanel, CommandPalette, PeriodSelector)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { MobileMenu } from '@/components/MobileMenu';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { CommandPalette } from '@/components/CommandPalette';
import { PeriodSelector } from '@/components/PeriodSelector';
import { PeriodProvider, currentMonthKey, monthLabelLong } from '@/contexts/PeriodContext';

// O PeriodSelector agora renderiza o MonthDetailPanel (que usa hooks do Supabase).
// Stub mínimo para o grafo de módulos não depender de .env nos testes.
vi.mock('@/services/supabase', () => {
  const ok = () => Promise.resolve({ data: [], error: null });
  const stub = {
    rpc: vi.fn(ok),
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(ok) })), order: vi.fn(ok) })),
    })),
    auth: { signOut: vi.fn(() => Promise.resolve({ error: null })) },
  };
  return { sb: stub, supabase: stub };
});

const router = (ui: ReactNode) => <MemoryRouter>{ui}</MemoryRouter>;

describe('Breadcrumb', () => {
  it('renderiza itens com link e sem link', () => {
    render(
      router(
        <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Dashboard' }]} />
      )
    );
    const inicio = screen.getByText('Início');
    expect(inicio.tagName).toBe('A');
    expect(screen.getByText('Dashboard').tagName).toBe('SPAN');

    fireEvent.mouseEnter(inicio);
    fireEvent.mouseLeave(inicio);
  });
});

describe('MobileMenu', () => {
  const items = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/crm', label: 'CRM' },
  ];

  it('retorna null quando fechado', () => {
    const { container } = render(
      router(<MobileMenu isOpen={false} onClose={vi.fn()} items={items} isActive={() => false} />)
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza os itens quando aberto', () => {
    render(
      router(<MobileMenu isOpen onClose={vi.fn()} items={items} isActive={() => false} />)
    );
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('CRM')).toBeTruthy();
  });

  it('fecha ao clicar no botão X', () => {
    const onClose = vi.fn();
    const { container } = render(
      router(<MobileMenu isOpen onClose={onClose} items={items} isActive={() => false} />)
    );
    fireEvent.click(container.querySelector('button')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fecha ao pressionar Escape', () => {
    const onClose = vi.fn();
    render(
      router(<MobileMenu isOpen onClose={onClose} items={items} isActive={() => false} />)
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('marca o item ativo via isActive', () => {
    render(
      router(<MobileMenu isOpen onClose={vi.fn()} items={items} isActive={(p) => p === '/crm'} />)
    );
    const crm = screen.getByText('CRM');
    expect(crm.getAttribute('style')).toContain('font-weight: 600');
  });
});

describe('NotificationsPanel', () => {
  const base = { id: 'x', title: 'Leads parados', message: '3 leads', severity: 'warning' as const, href: '/crm' };

  it('mostra loading', () => {
    render(router(<NotificationsPanel items={[]} loading onClose={vi.fn()} />));
    expect(screen.getByText('Carregando…')).toBeTruthy();
  });

  it('mostra estado vazio', () => {
    render(router(<NotificationsPanel items={[]} loading={false} onClose={vi.fn()} />));
    expect(screen.getByText(/Tudo em dia/)).toBeTruthy();
  });

  it('lista as notificações como links', () => {
    render(router(<NotificationsPanel items={[{ ...base, severity: 'danger' }]} loading={false} onClose={vi.fn()} />));
    expect(screen.getByText('Leads parados')).toBeTruthy();
    expect(screen.getByText('3 leads')).toBeTruthy();
  });

  it('fecha ao clicar no botão de fechar', () => {
    const onClose = vi.fn();
    render(router(<NotificationsPanel items={[]} loading={false} onClose={onClose} />));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar notificações' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('CommandPalette', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function renderPalette(onClose = vi.fn(), initial = '/') {
    return {
      onClose,
      ...render(
        <MemoryRouter initialEntries={[initial]}>
          <Routes>
            <Route path="/" element={<CommandPalette isOpen onClose={onClose} />} />
            <Route path="/dashboard" element={<div>ROTA_DASHBOARD</div>} />
            <Route path="/crm" element={<div>ROTA_CRM</div>} />
          </Routes>
        </MemoryRouter>
      ),
    };
  }

  it('não renderiza nada quando fechada', () => {
    const { container } = render(
      <MemoryRouter><CommandPalette isOpen={false} onClose={vi.fn()} /></MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('abre com o diálogo e lista os comandos', () => {
    renderPalette();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Ir para Dashboard')).toBeTruthy();
    expect(screen.getByText('Ir para Goals')).toBeTruthy();
  });

  it('filtra comandos pelo texto digitado', () => {
    renderPalette();
    const input = screen.getByPlaceholderText('Buscar comando...');
    fireEvent.change(input, { target: { value: 'CRM' } });
    expect(screen.queryByText('Ir para Dashboard')).toBeNull();
    expect(screen.getByText('Ir para CRM')).toBeTruthy();
  });

  it('mostra vazio quando não há correspondência', () => {
    renderPalette();
    fireEvent.change(screen.getByPlaceholderText('Buscar comando...'), { target: { value: 'zzz' } });
    expect(screen.getByText('Nenhum comando encontrado')).toBeTruthy();
  });

  it('fecha ao pressionar Escape', () => {
    const { onClose } = renderPalette();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Enter executa o primeiro comando e navega', () => {
    renderPalette();
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(screen.getByText('ROTA_DASHBOARD')).toBeTruthy();
  });

  it('ArrowDown + Enter executa o segundo comando', () => {
    renderPalette();
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(screen.getByText('ROTA_CRM')).toBeTruthy();
  });

  it('clique no comando executa e fecha', () => {
    const { onClose } = renderPalette();
    fireEvent.click(screen.getByText('Ir para Finance'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('PeriodSelector', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('abre o dropdown e seleciona o mês atual', () => {
    render(
      <PeriodProvider><PeriodSelector /></PeriodProvider>
    );

    const trigger = screen.getByRole('button');
    expect(trigger.textContent).toContain('Todo o período');
    fireEvent.click(trigger);

    const current = monthLabelLong(currentMonthKey());
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${current}`) }));
    expect(screen.getByRole('button').textContent).toContain(current);
  });

  it('abre as métricas de um mês pelo botão de detalhes', () => {
    render(
      <PeriodProvider><PeriodSelector /></PeriodProvider>
    );
    fireEvent.click(screen.getByRole('button'));

    const current = monthLabelLong(currentMonthKey());
    fireEvent.click(screen.getByRole('button', { name: `Ver métricas de ${current}` }));
    expect(screen.getByText(`Métricas · ${current}`)).toBeTruthy();
  });

  it('volta para "Todo o período"', () => {
    window.localStorage.setItem('ravo:period', '2026-07');
    render(
      <PeriodProvider><PeriodSelector /></PeriodProvider>
    );
    expect(screen.getByRole('button').textContent).toContain('Julho de 2026');

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button', { name: 'Todo o período acumulado' }));
    expect(screen.getByRole('button').textContent).toContain('Todo o período');
  });

  it('fecha ao clicar fora', () => {
    render(
      <PeriodProvider><PeriodSelector /></PeriodProvider>
    );
    expect(screen.getAllByRole('button')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
    fireEvent.mouseDown(document.body);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
