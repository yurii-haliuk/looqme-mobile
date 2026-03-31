import { useState, useRef, useCallback, type RefObject } from 'react';

const THRESHOLD = 60;
const MAX_PULL = 120;

export function usePullToRefresh(
  scrollRef: RefObject<HTMLElement | null>,
  onRefresh: () => Promise<void>,
) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const el = scrollRef.current;
      if (!el || el.scrollTop > 0 || isRefreshing) return;
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    },
    [scrollRef, isRefreshing],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;
      const el = scrollRef.current;
      if (!el || el.scrollTop > 0) {
        isPulling.current = false;
        setPullDistance(0);
        return;
      }
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0) {
        const distance = Math.min(diff * 0.5, MAX_PULL);
        setPullDistance(distance);
      }
    },
    [scrollRef, isRefreshing],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  return {
    pullDistance,
    isRefreshing,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
