import React from 'react';

/**
 * SVG Gradient definitions for premium charts
 * Use: <ChartGradients /> inside your chart's <defs>
 */
export function ChartGradients() {
  return (
    <>
      {/* Orange - Revenue gradient */}
      <defs>
        <linearGradient id="gradientOrange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EA6A1B" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#EA6A1B" stopOpacity={0.05} />
        </linearGradient>

        {/* Cyan - Customers gradient */}
        <linearGradient id="gradientCyan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.05} />
        </linearGradient>

        {/* Green - Success gradient */}
        <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
        </linearGradient>

        {/* Purple - Conversion gradient */}
        <linearGradient id="gradientPurple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.05} />
        </linearGradient>

        {/* Blue - Pipeline gradient */}
        <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
        </linearGradient>

        {/* Amber - Automation gradient */}
        <linearGradient id="gradientAmber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D97706" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#D97706" stopOpacity={0.05} />
        </linearGradient>

        {/* Multi gradient for premium look */}
        <linearGradient id="gradientPremium" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EA6A1B" stopOpacity={0.8} />
          <stop offset="50%" stopColor="#06B6D4" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#10B981" stopOpacity={0.5} />
        </linearGradient>
      </defs>
    </>
  );
}

/**
 * Helper to get gradient ID by color name
 */
export const gradientMap: Record<string, string> = {
  orange: 'url(#gradientOrange)',
  cyan: 'url(#gradientCyan)',
  green: 'url(#gradientGreen)',
  purple: 'url(#gradientPurple)',
  blue: 'url(#gradientBlue)',
  amber: 'url(#gradientAmber)',
  premium: 'url(#gradientPremium)',
};
