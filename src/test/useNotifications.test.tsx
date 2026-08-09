/**
 * RAVO OS — Testes do hook de notificações do header (src/hooks/useNotifications.ts)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications } from '@/hooks/useNotifications';
import { sb } from '@/services/supabase';
import { ROT_DAYS } from '@/utils/crmMetrics';

vi.mock('@/services/supabase', () => ({
  sb: { from: vi.fn() },
}));

const mockedSb = sb as unknown as { from: ReturnType<typeof vi.fn> };

function tableBuilder(data: unknown[]) {
  const q: { select: ReturnType<typeof vi.fn>; in: ReturnType<typeof vi.fn>; eq: ReturnType<typeof vi.fn> } = {
    select: vi.fn(() => q),
    in: vi.fn(() => Promise.resolve({ data, error: null })),
    eq: vi.fn(() => Promise.resolve({ data, error: null })),
  };
  return q;
}

function stubTables(tables: Record<string, unknown[]>) {
  mockedSb.from.mockImplementation((table: string) => tableBuilder(tables[table] ?? []));
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useNotifications', () => {
  it('começa carregando e termina vazio sem dados', async () => {
    stubTables({});
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('gera alerta de leads parados quando atualizado há mais de ROT_DAYS', async () => {
    stubTables({
      contatos: [{ id: 'c1', etapa: 'Novo Lead', updated_at: isoDaysAgo(ROT_DAYS + 5) }],
    });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('crm-parados');
    expect(result.current.items[0].href).toBe('/crm');
  });

  it('não gera alerta para leads movimentados recentemente', async () => {
    stubTables({
      contatos: [{ id: 'c1', etapa: 'Novo Lead', updated_at: isoDaysAgo(2) }],
    });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([]);
  });

  it('gera alerta de tickets em espera acima de 2h', async () => {
    stubTables({
      tickets: [{ id: 't1', tempo_resposta: '3h' }],
    });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items[0].id).toBe('cs-aguardando');
    expect(result.current.items[0].severity).toBe('danger');
  });

  it('não gera alerta para ticket respondido em menos de 2h', async () => {
    stubTables({
      tickets: [{ id: 't1', tempo_resposta: '45m' }],
    });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([]);
  });

  it('gera alerta de metas em risco', async () => {
    stubTables({
      metas: [{ id: 'm1', status: 'atrasado' }],
    });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items[0].id).toBe('goals-risco');
  });

  it('combina os três tipos de alerta', async () => {
    stubTables({
      contatos: [{ id: 'c1', etapa: 'Novo Lead', updated_at: isoDaysAgo(ROT_DAYS + 1) }],
      tickets: [{ id: 't1', tempo_resposta: '5h' }],
      metas: [{ id: 'm1', status: 'atencao' }],
    });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items.map((i) => i.id).sort()).toEqual([
      'crm-parados',
      'cs-aguardando',
      'goals-risco',
    ]);
  });

  it('captura erro da query e expõe no estado error', async () => {
    mockedSb.from.mockImplementation(() => {
      throw new Error('falha de rede');
    });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('falha de rede');
    expect(result.current.items).toEqual([]);
  });
});
