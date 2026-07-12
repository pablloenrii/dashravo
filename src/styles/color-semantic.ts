/**
 * RAVO OS — Semantic Color System v5.0
 * Padrão de cores para dados, estados e sentimentos
 */

export const colorSemantic = {
  // Positivos - Crescimento, Lucro, Aumento
  positive: {
    primary: '#10B981',      // Verde forte
    light: '#6EE7B7',        // Verde claro
    lighter: '#A7F3D0',      // Verde muito claro
    dark: '#047857',         // Verde escuro
    bg: 'rgba(16, 185, 129, 0.08)',     // Fundo
    border: 'rgba(16, 185, 129, 0.2)',  // Border
    text: '#10B981',
    glow: 'rgba(16, 185, 129, 0.3)',
  },

  // Negativos - Queda, Perda, Diminuição
  negative: {
    primary: '#EF4444',      // Vermelho forte
    light: '#FCA5A5',        // Vermelho claro
    lighter: '#FEE2E2',      // Vermelho muito claro
    dark: '#991B1B',         // Vermelho escuro
    bg: 'rgba(239, 68, 68, 0.08)',      // Fundo
    border: 'rgba(239, 68, 68, 0.2)',   // Border
    text: '#EF4444',
    glow: 'rgba(239, 68, 68, 0.3)',
  },

  // Neutro - Sem mudança, Flat, Estável
  neutral: {
    primary: '#6B7280',      // Cinza
    light: '#D1D5DB',        // Cinza claro
    lighter: '#F3F4F6',      // Cinza muito claro
    dark: '#374151',         // Cinza escuro
    bg: 'rgba(107, 114, 128, 0.08)',    // Fundo
    border: 'rgba(107, 114, 128, 0.2)', // Border
    text: '#6B7280',
    glow: 'rgba(107, 114, 128, 0.3)',
  },

  // Aviso - Atenção, Alerta
  warning: {
    primary: '#F59E0B',      // Âmbar
    light: '#FCD34D',        // Âmbar claro
    lighter: '#FEF3C7',      // Âmbar muito claro
    dark: '#B45309',         // Âmbar escuro
    bg: 'rgba(245, 158, 11, 0.08)',     // Fundo
    border: 'rgba(245, 158, 11, 0.2)',  // Border
    text: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.3)',
  },

  // Crítico - Erro, Risco
  critical: {
    primary: '#DC2626',      // Vermelho crítico
    light: '#F87171',        // Vermelho claro
    lighter: '#FECACA',      // Vermelho muito claro
    dark: '#7F1D1D',         // Vermelho escuro
    bg: 'rgba(220, 38, 38, 0.08)',      // Fundo
    border: 'rgba(220, 38, 38, 0.2)',   // Border
    text: '#DC2626',
    glow: 'rgba(220, 38, 38, 0.3)',
  },

  // Info - Informação, Contexto
  info: {
    primary: '#3B82F6',      // Azul
    light: '#93C5FD',        // Azul claro
    lighter: '#DBEAFE',      // Azul muito claro
    dark: '#1E40AF',         // Azul escuro
    bg: 'rgba(59, 130, 246, 0.08)',     // Fundo
    border: 'rgba(59, 130, 246, 0.2)',  // Border
    text: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.3)',
  },

  // Sucesso - Confirmação, Completado
  success: {
    primary: '#059669',      // Verde sucesso
    light: '#6EE7B7',        // Verde claro
    lighter: '#D1FAE5',      // Verde muito claro
    dark: '#064E3B',         // Verde escuro
    bg: 'rgba(5, 150, 105, 0.08)',      // Fundo
    border: 'rgba(5, 150, 105, 0.2)',   // Border
    text: '#059669',
    glow: 'rgba(5, 150, 105, 0.3)',
  },
};

/**
 * Helper para determinar cor baseada em valor (positivo/negativo)
 */
export function getValueColor(value: number, _type: 'percent' | 'amount' = 'percent') {
  if (value > 0) return colorSemantic.positive;
  if (value < 0) return colorSemantic.negative;
  return colorSemantic.neutral;
}

/**
 * Helper para format número com cor
 */
export function formatNumberWithColor(
  value: number,
  options: {
    decimals?: number;
    prefix?: string;
    suffix?: string;
  } = {}
) {
  const { decimals = 2, prefix = '', suffix = '' } = options;

  const formatted = `${prefix}${value.toFixed(decimals)}${suffix}`;
  const color = getValueColor(value).text;

  return { formatted, color };
}

/**
 * Mapaear de tendência para cor
 */
export function getTrendColor(direction: 'up' | 'down' | 'flat') {
  switch (direction) {
    case 'up':
      return colorSemantic.positive;
    case 'down':
      return colorSemantic.negative;
    case 'flat':
    default:
      return colorSemantic.neutral;
  }
}
