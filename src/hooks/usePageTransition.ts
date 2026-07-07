import { useState, useEffect } from 'react';

export interface UsePageTransitionProps {
  duration?: number; // ms
  direction?: 'in' | 'out';
}

export function usePageTransition({ duration = 400, direction = 'in' }: UsePageTransitionProps = {}) {
  const [isVisible, setIsVisible] = useState(direction === 'in' ? false : true);

  useEffect(() => {
    if (direction === 'in') {
      // Small delay for better visual effect
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [direction]);

  const pageStyle = {
    animation: isVisible
      ? `slideUp ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
      : `fadeOut ${duration}ms ease-out forwards`,
    opacity: isVisible ? 1 : 0,
  };

  return { isVisible, pageStyle };
}

/**
 * Add these keyframes to your CSS:
 * @keyframes fadeOut {
 *   from { opacity: 1; }
 *   to { opacity: 0; }
 * }
 */
