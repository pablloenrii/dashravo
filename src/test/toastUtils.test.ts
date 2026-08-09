/**
 * RAVO OS — Testes dos helpers de toast (src/utils/toast.ts)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
  toastAction,
  removeToast,
  clearToasts,
  useToast,
} from '@/utils/toast';
import { useToastStore } from '@/store/toast.store';

beforeEach(() => {
  clearToasts();
});

describe('helpers de toast', () => {
  it('toastSuccess adiciona toast do tipo success', () => {
    toastSuccess('salvo!', 0);
    expect(useToastStore.getState().toasts[0]).toMatchObject({ type: 'success', message: 'salvo!' });
  });

  it('toastError adiciona toast do tipo error', () => {
    toastError('falhou!', 0);
    expect(useToastStore.getState().toasts[0]).toMatchObject({ type: 'error', message: 'falhou!' });
  });

  it('toastWarning adiciona toast do tipo warning', () => {
    toastWarning('cuidado', 0);
    expect(useToastStore.getState().toasts[0]).toMatchObject({ type: 'warning', message: 'cuidado' });
  });

  it('toastInfo adiciona toast do tipo info', () => {
    toastInfo('info', 0);
    expect(useToastStore.getState().toasts[0]).toMatchObject({ type: 'info', message: 'info' });
  });

  it('respeita duração personalizada', () => {
    toastSuccess('com duração', 2500);
    expect(useToastStore.getState().toasts[0].duration).toBe(2500);
  });

  it('toastAction adiciona toast com ação e duração 0', () => {
    const action = { label: 'Ver', onClick: () => undefined };
    toastAction('tarefa', action, 'warning');
    expect(useToastStore.getState().toasts[0]).toMatchObject({
      type: 'warning',
      message: 'tarefa',
      duration: 0,
      action,
    });
  });

  it('removeToast remove por id', () => {
    const id = useToastStore.getState().addToast({ type: 'info', message: 'x', duration: 0 });
    removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});

describe('useToast', () => {
  it('expõe a lista de toasts e os helpers', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
    expect(typeof result.current.success).toBe('function');
    expect(typeof result.current.error).toBe('function');
    expect(typeof result.current.warning).toBe('function');
    expect(typeof result.current.info).toBe('function');
    expect(typeof result.current.action).toBe('function');
    expect(typeof result.current.remove).toBe('function');
    expect(typeof result.current.clear).toBe('function');
  });

  it('reage a novas notificações', () => {
    const { result } = renderHook(() => useToast());
    act(() => toastSuccess('novo toast', 0));
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('novo toast');
  });
});
