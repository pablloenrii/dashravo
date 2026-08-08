/**
 * RAVO OS — Testes do hook genérico de query (src/hooks/useSupabaseQuery.ts)
 *
 * Cobre fluxos assíncronos (loading → data/erro), transform, refetch,
 * re-execução via reloadDeps e proteção contra race conditions.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';

type MockKey = keyof typeof import('@/hooks/useMockData');
const MOCK_MRR = 'MOCK_MRR' as MockKey;

function ok<T>(data: T) {
  return { data, error: null };
}
function fail(message: string) {
  return { data: null, error: { message } };
}

describe('useSupabaseQuery', () => {
  it('carrega os dados e aplica o transform', async () => {
    const queryFn = vi.fn().mockResolvedValue(ok([{ v: '42' }]));
    const { result } = renderHook(() =>
      useSupabaseQuery<number[]>({
        queryFn,
        transform: (rows) => ((rows as { v: string }[]) ?? []).map((r) => Number(r.v)),
        empty: [],
        mockKey: MOCK_MRR,
      })
    );

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([42]);
    expect(result.current.error).toBeNull();
  });

  it('mantém o empty quando não há dados', async () => {
    const queryFn = vi.fn().mockResolvedValue(ok(null));
    const { result } = renderHook(() =>
      useSupabaseQuery<string[]>({ queryFn, empty: [], mockKey: MOCK_MRR })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  it('expõe o erro da query no estado error', async () => {
    const queryFn = vi.fn().mockResolvedValue(fail('boom'));
    const { result } = renderHook(() =>
      useSupabaseQuery<string[]>({ queryFn, empty: [], mockKey: MOCK_MRR })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('boom');
    expect(result.current.data).toEqual([]);
  });

  it('captura exceções lançadas pela query', async () => {
    const queryFn = vi.fn().mockRejectedValue(new Error('rede'));
    const { result } = renderHook(() =>
      useSupabaseQuery<string[]>({ queryFn, empty: [], mockKey: MOCK_MRR })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('rede');
  });

  it('refetch re-executa a query e atualiza os dados', async () => {
    const queryFn = vi.fn().mockResolvedValue(ok(['a']));
    const { result } = renderHook(() =>
      useSupabaseQuery<string[]>({ queryFn, empty: [], mockKey: MOCK_MRR })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queryFn).toHaveBeenCalledTimes(1);

    queryFn.mockResolvedValue(ok(['b']));
    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.data).toEqual(['b']));
    expect(queryFn).toHaveBeenCalledTimes(2);
  });

  it('mudar reloadDeps re-executa a query', async () => {
    const queryFn = vi.fn().mockResolvedValue(ok(['a']));
    const { result, rerender } = renderHook(
      ({ dep }: { dep: string }) =>
        useSupabaseQuery<string[]>({ queryFn, empty: [], mockKey: MOCK_MRR }, [dep]),
      { initialProps: { dep: '2026-07' } }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queryFn).toHaveBeenCalledTimes(1);

    rerender({ dep: '2026-08' });
    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(2));
  });

  it('ignora respostas atrasadas de requisições antigas (race protection)', async () => {
    let resolveSlow!: (v: unknown) => void;
    const slow = new Promise((res) => { resolveSlow = res; });
    const queryFn = vi.fn()
      .mockReturnValueOnce(slow)
      .mockResolvedValueOnce(ok(['nova']));

    const { result, rerender } = renderHook(
      ({ dep }: { dep: string }) =>
        useSupabaseQuery<string[]>({ queryFn, empty: [], mockKey: MOCK_MRR }, [dep]),
      { initialProps: { dep: 'a' } }
    );

    rerender({ dep: 'b' });
    await waitFor(() => expect(result.current.data).toEqual(['nova']));

    await act(async () => { resolveSlow(ok(['velha'])); });
    expect(result.current.data).toEqual(['nova']);
  });
});
