/**
 * RAVO OS v5.0 — Enterprise Color System
 * Professional dashboard palette for Fortune 500 companies
 *
 * Design Philosophy:
 * - Blue: Trust, stability, intelligence (primary)
 * - Green: Success, positive, growth
 * - Red: Warning, negative, decline
 * - Gray: Neutral, support, secondary
 *
 * This is the standard for professional SaaS dashboards
 * (Stripe, Figma, Linear, Datadog, etc.)
 */

export const colorSystemEnterprise = {
  // ===== NEUTRALS (Foundation) =====
  neutral: {
    // Backgrounds - carefully selected for OLED/LCD comfort
    bg: {
      darkest: '#06070D',    // App background
      dark: '#0B0E19',       // Card background
      medium: '#11152B',     // Hover state
      light: '#1F2937',      // Contrast element
    },

    // Text - optimized for readability and contrast
    text: {
      primary: '#F5F5F7',    // Main text (100% readability)
      secondary: '#9CA3AF',  // Supporting text
      tertiary: '#6B7280',   // Disabled, muted text
      inverted: '#06070D',   // For light backgrounds
    },

    // Borders & Dividers
    border: {
      subtle: 'rgba(255,255,255,0.04)',
      default: 'rgba(255,255,255,0.08)',
      strong: 'rgba(255,255,255,0.12)',
    },
  },

  // ===== PRIMARY ACCENT (Blue - Enterprise Trust) =====
  // Blue is the universal color of:
  // - Trust (Apple, Microsoft, Google, Stripe, Figma)
  // - Intelligence (IBM, AWS, DataDog)
  // - Stability (LinkedIn, Discord, Slack)
  primary: {
    strongest: '#2563EB',    // Bold accent (buttons, key data)
    strong: '#3B82F6',       // Hover state (lighter)
    default: '#60A5FA',      // Secondary elements
    soften: 'rgba(37, 99, 235, 0.15)',    // Background tint
    subtle: 'rgba(37, 99, 235, 0.08)',    // Very light background
    glow: 'rgba(37, 99, 235, 0.25)',      // Glow effect
  },

  // ===== SEMANTIC COLORS (Status & Meaning) =====
  // Only 3 semantic colors for maximum clarity
  semantic: {
    // Green: Positive indicators
    success: '#10B981',      // Growth, positive trend, success status

    // Red: Negative indicators
    error: '#EF4444',        // Decline, negative trend, error status

    // Yellow: Attention needed
    warning: '#F59E0B',      // In progress, requires attention

    // Gray: Neutral info
    info: '#6B7280',         // Neutral information (inactive, waiting)
  },

  // ===== DATA VISUALIZATION =====
  // Minimal palette: primary data, meta/goal, and semantic
  charts: {
    primary: '#2563EB',      // Revenue, main metric
    secondary: '#6B7280',    // Goals, targets, secondary metric
    success: '#10B981',      // Positive trend
    error: '#EF4444',        // Negative trend
    neutral: '#A1A1A6',      // Neutral category
  },

  // ===== UTILITIES =====
  utilities: {
    divider: 'rgba(255,255,255,0.06)',
    overlay: 'rgba(0, 0, 0, 0.4)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    insetShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
  },
};

// ===== HELPER FUNCTIONS =====
export function getStatusColor(status: 'success' | 'error' | 'warning' | 'info'): string {
  return colorSystemEnterprise.semantic[status];
}

export function getPrimaryWithOpacity(opacity: number): string {
  return `rgba(37, 99, 235, ${opacity})`;
}

// For backwards compatibility
export const colors = colorSystemEnterprise;
