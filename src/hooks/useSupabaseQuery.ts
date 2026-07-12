/**
 * RAVO OS — Helper genérico de queries Supabase
 *
 * Arquitetura (v6):
 * - SEM fallback automático de mock: erro real aparece no estado `error`
 *   e deve ser exibido na UI (banner por card/página).
 * - Mock apenas via flag explícita: VITE_USE_MOCK=true no .env.local.
 * - Proteção contra race conditions: apenas a requisição mais recente
 *   atualiza o estado (generation counter + cleanup).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

interface SupabaseResult {
  data: unknown;
  error: { message: string } | null;
}

export interface QueryResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface QueryOptions<T> {
  /** Função que executa a query no Supabase (from().select() ou .rpc()) */
  queryFn: () => PromiseLike<SupabaseResult>;
  /** Transformação das linhas cruas (ex.: Number() em colunas NUMERIC) */
  transform?: (rows: unknown) => T;
  /** Valor inicial/vazio */
  empty: T;
  /**
   * Chave do mock em useMockData, usada APENAS quando VITE_USE_MOCK=true.
   * O import dinâmico fica centralizado aqui, dentro de um branch
   * estaticamente morto no build de produção — o chunk de mock
   * é totalmente eliminado do bundle.
   */
  mockKey: keyof MockModule;
}

type MockModule = typeof import('./useMockData');

export function useSupabaseQuery<T>(options: QueryOptions<T>): QueryResult<T> {
  const [data, setData] = useState<T>(options.empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Mantém a referência mais recente das opções sem re-disparar o efeito
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Generation counter: invalida respostas de requisições antigas
  const generationRef = useRef(0);

  useEffect(() => {
    if (USE_MOCK) {
      let mockActive = true;
      import('./useMockData').then((m) => {
        if (!mockActive) return;
        setData(m[optionsRef.current.mockKey] as unknown as T);
        setLoading(false);
        setError(null);
      });
      return () => {
        mockActive = false;
      };
    }

    const generation = ++generationRef.current;
    let active = true;

    setLoading(true);

    (async () => {
      try {
        const { data: rows, error: err } = await optionsRef.current.queryFn();
        if (!active || generation !== generationRef.current) return;

        if (err) {
          setError(err.message);
          setData(optionsRef.current.empty);
        } else {
          const transform = optionsRef.current.transform;
          setData(transform ? transform(rows) : ((rows as T) ?? optionsRef.current.empty));
          setError(null);
        }
      } catch (err) {
        if (!active || generation !== generationRef.current) return;
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setData(optionsRef.current.empty);
      } finally {
        if (active && generation === generationRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, loading, error, refetch };
}

/** Converte com segurança colunas NUMERIC (Supabase retorna string no JSON) */
export function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
