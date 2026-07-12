/**
 * RAVO OS Color System - Minimalist Premium
 * 3 Primary Colors Only
 */

export const colorSystem = {
  // Primary Colors (3 only)
  primary: '#3B82F6',      // Blue
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber (for attention)

  // Backgrounds
  background: '#0F172A',   // Dark Navy
  backgroundSecondary: '#1E293B',  // Slate Dark
  backgroundTertiary: '#0A0E1A',   // Almost Black

  // Text
  text: '#F5F5F7',         // Off White
  textSecondary: '#A1A1A6', // Gray
  textTertiary: '#6B7280', // Light Gray

  // Borders
  border: '#1E293B',       // Slate
  borderLight: 'rgba(255,255,255,0.1)',

  // Legacy nested objects (keeping for backward compatibility but using primary colors)
  customers: {
    primary: '#3B82F6',
    light: 'rgba(59, 130, 246, 0.1)',
    dark: '#1E40AF'
  },
  pipeline: {
    primary: '#3B82F6',
    light: 'rgba(59, 130, 246, 0.1)',
    dark: '#1E40AF'
  },
  conversion: {
    primary: '#10B981',
    light: 'rgba(16, 185, 129, 0.1)',
    dark: '#047857'
  },
  revenue: {
    primary: '#3B82F6',
    light: 'rgba(59, 130, 246, 0.1)',
    dark: '#1E40AF'
  },
  churn: {
    primary: '#F59E0B',
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
