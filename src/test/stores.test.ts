/**
 * RAVO OS — Testes das stores Zustand (toast.store + revalidate.store)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useToastStore } from '@/store/toast.store';
import { useRevalidateStore } from '@/store/revalidate.store';

describe('toast.store', () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adiciona toast com id e duração padrão de 5s', () => {
    const id = useToastStore.getState().addToast({ type: 'success', message: 'ok' });
    const toasts = useToastStore.getState().toasts;

    expect(id).toBeTruthy();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({ type: 'success', message: 'ok', duration: 5000 });
  });

  it('preserva duração personalizada (incluindo 0 = indefinido)', () => {
    const { addToast } = useToastStore.getState();
    addToast({ type: 'info', message: 'a', duration: 1500 });
    addToast({ type: 'warning', message: 'b', duration: 0 });
    expect(useToastStore.getState().toasts[0].duration).toBe(1500);
    expect(useToastStore.getState().toasts[1].duration).toBe(0);
  });

  it('remove toast automaticamente após a duração', () => {
    vi.useFakeTimers();
    const { addToast } = useToastStore.getState();
    addToast({ type: 'info', message: 'timer', duration: 1000 });
    expect(useToastStore.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(1000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('remove toast por id', () => {
    const { addToast, removeToast } = useToastStore.getState();
    const a = addToast({ type: 'success', message: 'a', duration: 0 });
    addToast({ type: 'success', message: 'b', duration: 0 });

    removeToast(a);
    const remaining = useToastStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].message).toBe('b');
  });

  it('limpa todas as notificações', () => {
    const { addToast, clearToasts } = useToastStore.getState();
    addToast({ type: 'success', message: 'a', duration: 0 });
    addToast({ type: 'error', message: 'b', duration: 0 });

    clearToasts();
    expect(useToastStore.getState().toasts).toEqual([]);
  });
});

describe('revalidate.store', () => {
  it('inicia na versão 0', () => {
    expect(useRevalidateStore.getState().version).toBe(0);
  });

  it('invalidate incrementa a versão a cada chamada', () => {
    const { invalidate } = useRevalidateStore.getState();
    invalidate();
    invalidate();
    expect(useRevalidateStore.getState().version).toBe(2);
  });
});
