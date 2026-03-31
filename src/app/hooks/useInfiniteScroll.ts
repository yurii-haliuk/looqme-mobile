import { useEffect, useRef, type RefObject } from 'react';

export function useInfiniteScroll(
  scrollRef: RefObject<HTMLElement | null>,
  onLoadMore: () => void,
  enabled: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { root, rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollRef, onLoadMore, enabled]);

  return sentinelRef;
}
