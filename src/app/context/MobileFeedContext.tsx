import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import type { Sentiment, FeedFilters, Folder, SentimentSummary, Mention } from '../types/mentions';
import { MOCK_FOLDERS } from '../data/mock-mentions';

const DEFAULT_FILTERS: FeedFilters = {
  searchProfileId: 'sp-1',
  sentiment: null,
  sources: [],
  languages: [],
  countries: [],
  authors: [],
  dateRange: null,
  tags: { included: [], excluded: [] },
  mentionState: 'all',
  sortBy: 'date_desc',
  geographyEnabled: false,
  ratingRange: null,
  audienceRange: null,
  mentionType: [],
  role: [],
  searchQuery: '',
};

interface MobileFeedContextType {
  filters: FeedFilters;
  activeFolder: Folder;
  selectionMode: boolean;
  selectedIds: Set<string>;
  sentimentSummary: SentimentSummary;
  setFilter: <K extends keyof FeedFilters>(key: K, value: FeedFilters[K]) => void;
  setFilters: (filters: FeedFilters) => void;
  resetFilters: () => void;
  setActiveFolder: (folder: Folder) => void;
  toggleSelectionMode: () => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setSentimentSummary: (summary: SentimentSummary) => void;
}

const MobileFeedContext = createContext<MobileFeedContextType | null>(null);

export function MobileFeedProvider({
  children,
  mentions = [],
}: {
  children: ReactNode;
  mentions?: Mention[];
}) {
  const [filters, setFiltersState] = useState<FeedFilters>(DEFAULT_FILTERS);
  const [activeFolder, setActiveFolder] = useState<Folder>(MOCK_FOLDERS[0]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [manualSummary, setManualSummary] = useState<SentimentSummary | null>(null);

  const sentimentSummary = useMemo(() => {
    if (manualSummary) return manualSummary;
    const summary: SentimentSummary = { positive: 0, neutral: 0, negative: 0, total: 0 };
    for (const m of mentions) {
      summary[m.sentiment]++;
      summary.total++;
    }
    return summary;
  }, [mentions, manualSummary]);

  const setFilter = useCallback(<K extends keyof FeedFilters>(key: K, value: FeedFilters[K]) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setFilters = useCallback((newFilters: FeedFilters) => {
    setFiltersState(newFilters);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const value = useMemo(
    () => ({
      filters,
      activeFolder,
      selectionMode,
      selectedIds,
      sentimentSummary,
      setFilter,
      setFilters,
      resetFilters,
      setActiveFolder,
      toggleSelectionMode,
      toggleSelected,
      selectAll,
      clearSelection,
      setSentimentSummary: setManualSummary,
    }),
    [
      filters,
      activeFolder,
      selectionMode,
      selectedIds,
      sentimentSummary,
      setFilter,
      setFilters,
      resetFilters,
      toggleSelectionMode,
      toggleSelected,
      selectAll,
      clearSelection,
    ],
  );

  return <MobileFeedContext.Provider value={value}>{children}</MobileFeedContext.Provider>;
}

export function useMobileFeedContext() {
  const ctx = useContext(MobileFeedContext);
  if (!ctx) throw new Error('useMobileFeedContext must be used within MobileFeedProvider');
  return ctx;
}
