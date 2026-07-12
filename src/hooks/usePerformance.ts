/**
 * RAVO OS — usePerformance Hook
 * Hooks otimizados para React performance
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook para debounce de valores
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para throttle de callbacks
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  ) as T;
}

/**
 * Hook para lazy load de elementos
 */
export function useLazyLoad(ref: React.RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}

/**
 * Hook para medir performance de render
 */
export function useRenderMetrics(componentName: string) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current++;
    const renderTime = Date.now() - startTime.current;
    renderTimes.current.push(renderTime);

    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${componentName} render #${renderCount.current} took ${renderTime}ms`);
    }
  });

  return {
    renderCount: renderCount.current,
    averageTime: renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length,
  };
}

/**
 * Hook para cache local com expiração
 */
export function useLocalCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutos
): [T | null, boolean, () => void] {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetcher();
      setData(result);
      localStorage.setItem(
        key,
        JSON.stringify({
          data: result,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Cache fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher]);

  useEffect(() => {
    // Tentar carregar do localStorage
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < ttl) {
          setData(cachedData);
          return;
        }
      } catch (error) {
        console.error('Cache parse error:', error);
      }
    }

    // Se não houver cache válido, fazer fetch
    refetch();
  }, [key, ttl, refetch]);

  return [data, isLoading, refetch];
}

/**
 * Hook para memoizar arrays/objetos complexos
 */
export function useMemoDeep<T>(value: T, deps: React.DependencyList): T {
  const ref = useRef<T>(value);
  const depRef = useRef<React.DependencyList>(deps);

  const depsChanged = deps.some((dep, i) => dep !== depRef.current[i]);

  if (depsChanged) {
    ref.current = value;
    depRef.current = deps;
  }

  return ref.current;
}

/**
 * Hook para executar callback quando sair da viewport
 */
export function useIntersection(
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        callback();
      }
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, callback, options]);
}
