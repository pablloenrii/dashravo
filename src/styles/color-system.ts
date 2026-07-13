/**
 * RAVO OS Color System - Minimalist Premium
 * 3 Primary Colors Only
 */

export const colorSystem = {
  // Primary Colors (3 only)
  primary: '#EDEDED',      // Blue
  success: '#10B981',      // Green
  warning: '#8B8B8B',      // Amber (for attention)

  // Backgrounds
  background: '#0D0D0D',   // Dark Navy
  backgroundSecondary: '#1A1A1A',  // Slate Dark
  backgroundTertiary: '#0F0F0F',   // Almost Black

  // Text
  text: '#F5F5F7',         // Off White
  textSecondary: '#A1A1A6', // Gray
  textTertiary: '#6B7280', // Light Gray

  // Borders
  border: '#1A1A1A',       // Slate
  borderLight: 'rgba(255,255,255,0.1)',

  // Legacy nested objects (keeping for backward compatibility but using primary colors)
  customers: {
    primary: '#EDEDED',
    light: 'rgba(255,255,255, 0.1)',
    dark: '#2A2A2A'
  },
  pipeline: {
    primary: '#EDEDED',
    light: 'rgba(255,255,255, 0.1)',
    dark: '#2A2A2A'
  },
  conversion: {
    primary: '#10B981',
    light: 'rgba(16, 185, 129, 0.1)',
    dark: '#047857'
  },
  revenue: {
    primary: '#EDEDED',
    light: 'rgba(255,255,255, 0.1)',
    dark: '#2A2A2A'
  },
  churn: {
    primary: '#8B8B8B',
    light: 'rgba(245, 158, 11, 0.1)',
    dark: '#D97706'
  },
  engagement: {
    primary: '#10B981',
    light: 'rgba(16, 185, 129, 0.1)',
    dark: '#047857'
  },
};

export type ColorSystem = typeof colorSystem;
