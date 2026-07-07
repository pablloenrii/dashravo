import { useRef, useCallback, useEffect } from 'react';

export interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // minimum distance in px
}

export function useSwipe(handlers: SwipeHandlers, enabled = true) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  const threshold = handlers.threshold || 50;

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;
      touchStartX.current = e.changedTouches[0].screenX;
      touchStartY.current = e.changedTouches[0].screenY;
    },
    [enabled]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;
      touchEndX.current = e.changedTouches[0].screenX;
      touchEndY.current = e.changedTouches[0].screenY;

      const dx = touchStartX.current - touchEndX.current;
      const dy = touchStartY.current - touchEndY.current;

      // Horizontal swipes
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > threshold) {
          handlers.onSwipeLeft?.();
        } else if (dx < -threshold) {
          handlers.onSwipeRight?.();
        }
      }
      // Vertical swipes
      else {
        if (dy > threshold) {
          handlers.onSwipeUp?.();
        } else if (dy < -threshold) {
          handlers.onSwipeDown?.();
        }
      }
    },
    [enabled, threshold, handlers]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('touchstart', handleTouchStart as any, false);
    document.addEventListener('touchend', handleTouchEnd as any, false);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart as any, false);
      document.removeEventListener('touchend', handleTouchEnd as any, false);
    };
  }, [enabled, handleTouchStart, handleTouchEnd]);

  return { handleTouchStart, handleTouchEnd };
}
