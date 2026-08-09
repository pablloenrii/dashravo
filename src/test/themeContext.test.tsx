/**
 * RAVO OS — Testes do contexto de tema (src/contexts/ThemeContext.tsx)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider, useTheme, useThemeColor } from '@/contexts/ThemeContext';

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
  document.documentElement.removeAttribute('data-theme-mode');
});

describe('ThemeProvider', () => {
  it('inicia em dark/orange por padrão', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.mode).toBe('dark');
    expect(result.current.color).toBe('orange');
  });

  it('lê as preferências salvas no localStorage', () => {
    window.localStorage.setItem('theme-mode', 'light');
    window.localStorage.setItem('theme-color', 'green');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.mode).toBe('light');
    expect(result.current.color).toBe('green');
  });

  it('toggleMode alterna entre light e dark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.toggleMode());
    expect(result.current.mode).toBe('light');
    act(() => result.current.toggleMode());
    expect(result.current.mode).toBe('dark');
  });

  it('setColor muda a cor de destaque', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setColor('purple'));
    expect(result.current.color).toBe('purple');
  });

  it('setTheme define modo e cor de uma vez', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme({ mode: 'light', color: 'red' }));
    expect(result.current.mode).toBe('light');
    expect(result.current.color).toBe('red');
  });

  it('persiste modo e cor no localStorage e aplica atributos no html', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setColor('blue'));

    expect(window.localStorage.getItem('theme-mode')).toBe('dark');
    expect(window.localStorage.getItem('theme-color')).toBe('blue');
    expect(document.documentElement.getAttribute('data-theme-mode')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme-color')).toBe('blue');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('useThemeColor retorna a paleta da cor atual', () => {
    const { result } = renderHook(() => useThemeColor(), { wrapper });
    expect(result.current.primary).toBe('#EDEDED');

    const { result: theme } = renderHook(() => useTheme(), { wrapper });
    act(() => theme.current.setColor('green'));
    const { result: palette } = renderHook(() => useThemeColor(), { wrapper });
    expect(palette.current.primary).toBe('#10B981');
  });

  it('lança erro quando usado fora do provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within ThemeProvider');
  });
});
