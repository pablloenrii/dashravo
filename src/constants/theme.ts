/**
 * RAVO OS — Design tokens e cores oficiais
 *
 * Fonte única das cores usadas nos gráficos e superfícies. As páginas não devem
 * mais hardcodar hex (ex.: '#0F0F0F'); use estes tokens. Mantém consistência com
 * as variáveis CSS definidas em styles/minimalist.css.
 */

/** Cores semânticas de dados (máx. 3 + neutro) — mesmas regras do color-system */
export const chart = {
  /** Verde reservado para receita/sucesso */
  revenue: '#3FB950',
  success: '#10B981',
  /** Neutros de série */
  line: '#8B8B8B',
  seriesAlt: '#5A5A5A',
  neutral: '#6B7280',
  light: '#EDEDED',
  /** Eixos/grades */
  axis: '#454545',
  axisAlt: '#86868B',
  grid: 'rgba(255,255,255,0.06)',
  /** Paleta oficial de séries (usada nos transforms de usePagesQueries) */
  palette: ['#EDEDED', '#10B981', '#8B8B8B', '#6B7280'],
} as const;

/** Superfícies e bordas padrão (app, sidebar, cards, inputs) */
export const surface = {
  /** Fundo geral da aplicação */
  app: '#0A0A0A',
  /** Sidebar / drawer */
  sidebar: '#0D0D0D',
  /** Cards, KPIs, painéis */
  card: '#0F0F0F',
  /** Superfície elevada (menus, abas ativas) */
  elevated: '#1A1A1A',
  active: '#1E1E1E',
  /** Acentos de avatar/chip */
  avatar: '#2A2A2A',
  /** Skeleton/placeholder */
  skeleton: '#3A3A3A',
  /** Inputs e fundos sutis */
  input: 'rgba(255,255,255,0.04)',
  hover: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.1)',
  borderHover: 'rgba(255,255,255,0.14)',
} as const;

/** Texto padrão das páginas (hierarquia) */
export const text = {
  primary: '#F2F2F3',
  /** Valor/texto forte (accents) */
  strong: '#EDEDED',
  /** Título em superfícies elevadas */
  highlight: '#EBEBF0',
  bright: '#F5F5F7',
  /** Texto sobre fundo de accent */
  white: '#FFFFFF',
  secondary: '#9CA3AF',
  secondaryAlt: '#A1A1A6',
  tertiary: '#6E6E6E',
  dim: '#6B7280',
  muted: '#8A8F98',
  label: '#5B616E',
  faint: '#4B5563',
} as const;

/** Cores semânticas de status (sucesso, perigo, alerta, info/accent) */
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
} as const;

/** Fundos translúcidos de badges/status por intenção */
export const soft = {
  success: 'rgba(16,185,129,0.12)',
  danger: 'rgba(239,68,68,0.12)',
  warning: 'rgba(245,158,11,0.12)',
  purple: 'rgba(168,85,247,0.12)',
  info: 'rgba(99,102,241,0.12)',
  revenue: 'rgba(63,185,80,0.1)',
} as const;

/** Tipografia padrão de título de página e seção */
export const type = {
  pageTitle: { fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em' } as const,
  sectionTitle: {
    fontSize: '12px', fontWeight: 650, letterSpacing: '0.04em',
    textTransform: 'uppercase',
  } as const,
};

/** Raio e espaçamento padrão */
export const layout = {
  radius: '10px',
  radiusLg: '12px',
  pageMaxWidth: '1400px',
  gridGap: '12px',
} as const;
