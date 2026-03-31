import { useState, useEffect, useRef, type RefObject } from 'react';

type ScrollDirection = 'up' | 'down' | null;

export function useScrollDirection(scrollRef: RefObject<HTMLElement | null>, threshold = 10) {
  const [direction, setDirection] = useState<ScrollDirection>(null);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      const scrollTop = el!.scrollTop;
      const diff = scrollTop - lastScrollTop.current;

      if (Math.abs(diff) > threshold) {
        setDirection(diff > 0 ? 'down' : 'up');
        lastScrollTop.current = scrollTop;
      }
    }

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [scrollRef, threshold]);

  return direction;
}
