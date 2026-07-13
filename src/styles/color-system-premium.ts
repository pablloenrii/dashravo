/**
 * RAVO OS v5.0 — Premium Color System
 * Enterprise-grade palette for sophisticated UI
 */

export const colorSystemPremium = {
  // Neutrals - Sophisticated grayscale
  neutral: {
    bg: '#0A0A0A',           // Background - softer black
    surface: '#0D0D0D',      // Card surface - elegant
    surfaceHover: '#11152B', // Hover state - subtle lift
    border: 'rgba(255,255,255,0.04)', // Ultra-fine borders
    borderHover: 'rgba(255,255,255,0.08)',
    text: {
      primary: '#EBEBF0',    // Main text - softer white
      secondary: '#9CA3AF',  // Secondary text - sophisticated gray
      tertiary: '#6B7280',   // Tertiary - deeper gray
    },
  },

  // Primary Accent - Orange refined
  accent: {
    primary: '#EA6A1B',      // Main orange - less vibrant
    hover: '#F77E2D',        // Hover - elegant transition
    light: '#FFA040',        // For secondaries
    lighter: 'rgba(234, 106, 27, 0.1)', // Background tint
    veryLight: 'rgba(234, 106, 27, 0.05)',
  },

  // Semantic Colors - Muted but clear
  semantic: {
    success: '#10B981',      // Green - calm
    warning: '#8B8B8B',      // Amber - noticeable
    danger: '#EF4444',       // Red - critical
    info: '#EDEDED',         // Blue - informational
    processing: '#6366F1',   // Indigo - in progress
  },

  // Data Colors - Premium palette (non-vibrant)
  data: {
    orange: '#EA6A1B',       // Revenue - primary orange
    cyan: '#EDEDED',         // Customers - refined cyan
    purple: '#A78BFA',       // Conversion - softer purple
    green: '#10B981',        // Success - calm green
    blue: '#EDEDED',         // Pipeline - professional blue
    amber: '#D97706',        // Automation - warm amber
    pink: '#EC4899',         // Alternative - sophisticated pink
    slate: '#64748B',        // Neutral data - slate
  },

  // Gradients for premium feel
  gradients: {
    cardHover: 'linear-gradient(135deg, rgba(234, 106, 27, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
    glassLight: 'rgba(255, 255, 255, 0.03)',
    glassDark: 'rgba(0, 0, 0, 0.2)',
  },

  // Shadows - Refined
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
  },
};

// Legacy color system for backward compatibility
export const colorSystem = {
  revenue: { primary: colorSystemPremium.data.orange },
  customers: { primary: colorSystemPremium.data.cyan },
  conversion: { primary: colorSystemPremium.data.purple },
  active: { primary: colorSystemPremium.data.blue },
  success: colorSystemPremium.semantic.success,
  pipeline: { primary: colorSystemPremium.data.blue },
  automation: { primary: colorSystemPremium.data.amber },
  danger: colorSystemPremium.semantic.danger,
};

export const metricTypes = {
  revenue: colorSystemPremium.data.orange,
  customers: colorSystemPremium.data.cyan,
  conversion: colorSystemPremium.data.purple,
  active: colorSystemPremium.data.blue,
  pipeline: colorSystemPremium.data.blue,
  automation: colorSystemPremium.data.amber,
};
