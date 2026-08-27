import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeTokens, type ThemeTokens } from '@/constants/theme';

/**
 * Hook que retorna os tokens de tema (cores, superfícies, etc.)
 * baseado no modo atual (dark/light). Re-renderiza quando o tema muda.
 *
 * Uso:
 *   const { chart, text, surface } = useThemeTokens();
 */
export function useThemeTokens(): ThemeTokens {
  const { mode } = useTheme();
  return useMemo(() => getThemeTokens(mode), [mode]);
}
