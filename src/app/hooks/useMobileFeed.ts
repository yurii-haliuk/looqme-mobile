import { useState, useCallback, useRef } from 'react';
import type { Mention, Sentiment } from '../types/mentions';
import { MOCK_MENTIONS } from '../data/mock-mentions';

const PAGE_SIZE = 10;
const MOCK_DELAY = 800;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useMobileFeed() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await delay(MOCK_DELAY);
      const slice = MOCK_MENTIONS.slice(0, PAGE_SIZE);
      setMentions(slice);
      setPage(1);
      setHasMore(slice.length < MOCK_MENTIONS.length);
      initialLoadDone.current = true;
    } catch {
      setError('Не вдалося завантажити дані');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      await delay(MOCK_DELAY);
      const start = page * PAGE_SIZE;
      const slice = MOCK_MENTIONS.slice(start, start + PAGE_SIZE);
      if (slice.length === 0) {
        setHasMore(false);
      } else {
        setMentions((prev) => [...prev, ...slice]);
        setPage((prev) => prev + 1);
        setHasMore(start + slice.length < MOCK_MENTIONS.length);
      }
    } catch {
      setError('Не вдалося завантажити більше');
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore, hasMore]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await delay(MOCK_DELAY);
      const slice = MOCK_MENTIONS.slice(0, PAGE_SIZE);
      setMentions(slice);
      setPage(1);
      setHasMore(slice.length < MOCK_MENTIONS.length);
    } catch {
      setError('Не вдалося оновити');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const updateSentiment = useCallback((id: string, sentiment: Sentiment) => {
    setMentions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, sentiment } : m)),
    );
  }, []);

  const toggleProcessed = useCallback((id: string) => {
    setMentions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isProcessed: !m.isProcessed } : m)),
    );
  }, []);

  const deleteMentions = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setMentions((prev) => prev.filter((m) => !idSet.has(m.id)));
  }, []);

  const bulkUpdateSentiment = useCallback((ids: string[], sentiment: Sentiment) => {
    const idSet = new Set(ids);
    setMentions((prev) =>
      prev.map((m) => (idSet.has(m.id) ? { ...m, sentiment } : m)),
    );
  }, []);

  return {
    mentions,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    error,
    loadInitial,
    loadMore,
    refresh,
    updateSentiment,
    toggleProcessed,
    deleteMentions,
    bulkUpdateSentiment,
  };
}
