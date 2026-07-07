/**
 * RAVO OS — Premium Design System
 * Refined color palette, typography, and spacing system
 */

export const designSystem = {
  colors: {
    black: '#09090B',
    darkGray: '#0F172A',
    mediumGray: '#1E293B',
    lightGray: '#94A3B8',
    ultraLight: '#E2E8F0',
    orange: '#FF6200',
    orangeHover: '#FF7A33',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    glass: 'rgba(15,23,42,0.5)',
    glassLight: 'rgba(15,23,42,0.3)',
    border: 'rgba(255,255,255,0.08)',
  },

  typography: {
    display: { fontSize: '32px', fontWeight: '700', lineHeight: '1.2' },
    h1: { fontSize: '24px', fontWeight: '700', lineHeight: '1.3' },
    h2: { fontSize: '20px', fontWeight: '600', lineHeight: '1.4' },
    h3: { fontSize: '16px', fontWeight: '600', lineHeight: '1.4' },
    body: { fontSize: '14px', fontWeight: '400', lineHeight: '1.6' },
    bodySmall: { fontSize: '13px', fontWeight: '400', lineHeight: '1.5' },
    label: { fontSize: '12px', fontWeight: '600', lineHeight: '1.4' },
    caption: { fontSize: '11px', fontWeight: '400', lineHeight: '1.4' },
  },

  spacing: {
    xs: '4px', sm: '8px', md: '16px', lg: '24px',
    xl: '32px', '2xl': '48px', '3xl': '64px',
  },

  radius: { sm: '8px', md: '12px', lg: '16px' },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  },
  transition: { fast: '150ms', normal: '300ms', slow: '500ms' },
};

export const { colors, typography, spacing } = designSystem;
