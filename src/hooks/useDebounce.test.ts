/**
 * RAVO OS — useDebounce Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebounce } from './usePerformance';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');

    vi.advanceTimersByTime(500);
    await vi.runAllTimersAsync();
    expect(result.current).toBe('updated');
  });

  it('should reset timer on new value', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    rerender({ value: 'first', delay: 500 });
    vi.advanceTimersByTime(300);

    rerender({ value: 'second', delay: 500 });
    vi.advanceTimersByTime(300);
    expect(result.current).toBe('initial');

    vi.advanceTimersByTime(200);
    await vi.runAllTimersAsync();
    expect(result.current).toBe('second');
  });

  it('should respect custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    );

    rerender({ value: 'updated', delay: 1000 });
    vi.advanceTimersByTime(500);
    expect(result.current).toBe('initial');

    vi.advanceTimersByTime(500);
    await vi.runAllTimersAsync();
    expect(result.current).toBe('updated');
  });
});
