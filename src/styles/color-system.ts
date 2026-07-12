/**
 * RAVO OS — Color System with Purpose
 * Cada métrica tem uma cor consistente baseada no tipo
 */

export const colorSystem = {
  // Receita / Monetário
  revenue: {
    primary: '#FF6200',    // Orange - Action, Growth
    light: 'rgba(255,98,0,0.1)',
    text: '#FF8A33',
  },

  // Clientes / Pessoas
  customers: {
    primary: '#30B0C0',    // Cyan - Trust, Reliability
    light: 'rgba(48,176,192,0.1)',
    text: '#30B0C0',
  },

  // Taxa / Porcentagem
  conversion: {
    primary: '#A855F7',    // Purple - Data, Analysis
    light: 'rgba(168,85,247,0.1)',
    text: '#A855F7',
  },

  // Usuários Ativos / Online
  active: {
    primary: '#34C759',    // Green - Positive, Active
    light: 'rgba(52,199,89,0.1)',
    text: '#34C759',
  },

  // Pipeline / Oportunidades
  pipeline: {
    primary: '#3B82F6',    // Blue - Information, Pipeline
    light: 'rgba(59,130,246,0.1)',
    text: '#3B82F6',
  },

  // IA / Automação
  automation: {
    primary: '#FF9500',    // Amber - Alert, Automation
    light: 'rgba(255,149,0,0.1)',
    text: '#FF9500',
  },

  // Status Colors
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  neutral: '#A1A1A6',
};

// Metric Type Definitions
export const metricTypes = {
  REVENUE: 'revenue',
  CUSTOMERS: 'customers',
  CONVERSION: 'conversion',
  ACTIVE: 'active',
  PIPELINE: 'pipeline',
  AUTOMATION: 'automation',
} as const;

// Get color for metric type
export function getColorForMetric(type: string) {
  return colorSystem[type as keyof typeof colorSystem] || colorSystem.revenue;
}
