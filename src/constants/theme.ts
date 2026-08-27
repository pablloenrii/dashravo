/**
 * RAVO OS — Design tokens e cores oficiais
 *
 * Fonte única das cores usadas nos gráficos e superfícies. As páginas não devem
 * mais hardcodar hex (ex.: '#0F0F0F'); use estes tokens. Mantém consistência com
 * as variáveis CSS definidas em styles/minimalist.css.
 *
 * Para usar tokens dinâmicos (dark/light), use o hook useThemeTokens().
 * Os exports estáticos abaixo são fallbacks dark-mode.
 */

import type { ThemeMode } from '@/contexts/ThemeContext';

/* ============================================================
   DARK THEME (default)
   ============================================================ */

export const chart = {
  revenue: '#3FB950',
  success: '#10B981',
  line: '#8B8B8B',
  seriesAlt: '#5A5A5A',
  neutral: '#6B7280',
  light: '#EDEDED',
  axis: '#454545',
  axisAlt: '#86868B',
  grid: 'rgba(255,255,255,0.06)',
  palette: ['#EDEDED', '#10B981', '#8B8B8B', '#6B7280'],
};

export const surface = {
  app: '#0A0A0A',
  sidebar: '#0D0D0D',
  card: '#0F0F0F',
  elevated: '#1A1A1A',
  active: '#1E1E1E',
  avatar: '#2A2A2A',
  skeleton: '#3A3A3A',
  input: 'rgba(255,255,255,0.04)',
  hover: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.1)',
  borderHover: 'rgba(255,255,255,0.14)',
};

export const text = {
  primary: '#F2F2F3',
  strong: '#EDEDED',
  highlight: '#EBEBF0',
  bright: '#F5F5F7',
  white: '#FFFFFF',
  secondary: '#9CA3AF',
  secondaryAlt: '#A1A1A6',
  tertiary: '#6E6E6E',
  dim: '#6B7280',
  muted: '#8A8F98',
  label: '#5B616E',
  faint: '#4B5563',
};

export const semantic = {
  success: '#10B981',
  successStrong: '#059669',
  successSoft: '#86EFAC',
  danger: '#EF4444',
  dangerStrong: '#DC2626',
  dangerSoft: '#FCA5A5',
  warning: '#D97706',
  info: '#6366F1',
  purple: '#A855F7',
  purpleStrong: '#9333EA',
  pink: '#EC4899',
};

export const soft = {
  success: 'rgba(16,185,129,0.12)',
  danger: 'rgba(239,68,68,0.12)',
  warning: 'rgba(245,158,11,0.12)',
  purple: 'rgba(168,85,247,0.12)',
  info: 'rgba(99,102,241,0.12)',
  revenue: 'rgba(63,185,80,0.1)',
};

export const type = {
  pageTitle: { fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em' },
  sectionTitle: {
    fontSize: '12px', fontWeight: 650, letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
};

export const layout = {
  radius: '10px',
  radiusLg: '12px',
  pageMaxWidth: '1400px',
  gridGap: '12px',
};

/* ============================================================
   LIGHT THEME
   ============================================================ */

const chartLight = {
  ...chart,
  line: '#6B7280',
  seriesAlt: '#9CA3AF',
  light: '#374151',
  axis: '#D1D5DB',
  axisAlt: '#9CA3AF',
  grid: 'rgba(0,0,0,0.06)',
  palette: ['#374151', '#10B981', '#6B7280', '#9CA3AF'],
};

const surfaceLight = {
  app: '#FFFFFF',
  sidebar: '#F9FAFB',
  card: '#FFFFFF',
  elevated: '#F3F4F6',
  active: '#E5E7EB',
  avatar: '#E5E7EB',
  skeleton: '#E5E7EB',
  input: 'rgba(0,0,0,0.03)',
  hover: 'rgba(0,0,0,0.04)',
  divider: 'rgba(0,0,0,0.06)',
  border: 'rgba(0,0,0,0.08)',
  borderStrong: 'rgba(0,0,0,0.12)',
  borderHover: 'rgba(0,0,0,0.16)',
};

const textLight = {
  primary: '#111827',
  strong: '#1F2937',
  highlight: '#111827',
  bright: '#111827',
  white: '#FFFFFF',
  secondary: '#6B7280',
  secondaryAlt: '#6B7280',
  tertiary: '#9CA3AF',
  dim: '#9CA3AF',
  muted: '#6B7280',
  label: '#6B7280',
  faint: '#9CA3AF',
};

const semanticLight = {
  ...semantic,
};

const softLight = {
  success: 'rgba(16,185,129,0.08)',
  danger: 'rgba(239,68,68,0.08)',
  warning: 'rgba(245,158,11,0.08)',
  purple: 'rgba(168,85,247,0.08)',
  info: 'rgba(99,102,241,0.08)',
  revenue: 'rgba(63,185,80,0.08)',
};

/* ============================================================
   getThemeTokens — retorna tokens para o modo informado
   ============================================================ */

export interface ThemeTokens {
  chart: typeof chart;
  surface: typeof surface;
  text: typeof text;
  semantic: typeof semantic;
  soft: typeof soft;
  type: typeof type;
  layout: typeof layout;
}

export function getThemeTokens(mode: ThemeMode): ThemeTokens {
  if (mode === 'light') {
    return {
      chart: chartLight,
      surface: surfaceLight,
      text: textLight,
      semantic: semanticLight,
      soft: softLight,
      type,
      layout,
    };
  }
  return { chart, surface, text, semantic, soft, type, layout };
}
