import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';

import { MobileFeedProvider, useMobileFeedContext } from '../context/MobileFeedContext';
import { useMobileFeed } from '../hooks/useMobileFeed';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { MOCK_SEARCH_PROFILES } from '../data/mock-mentions';

import { MobileFeedHeader } from '../components/mobile-feed/MobileFeedHeader';
import { TopicSummaryBar } from '../components/mobile-feed/TopicSummaryBar';
import { ActiveFiltersPanel } from '../components/mobile-feed/ActiveFiltersPanel';
import { MentionCard } from '../components/mobile-feed/MentionCard';
import { MentionCardSkeleton } from '../components/mobile-feed/MentionCardSkeleton';
import { EmptyState } from '../components/mobile-feed/EmptyState';
import { BottomNavPill } from '../components/mobile-feed/BottomNavPill';
import { QInsightFab } from '../components/mobile-feed/QInsightFab';
import { ViewSwitcherDrawer } from '../components/mobile-feed/ViewSwitcherDrawer';
import { FilterDrawer } from '../components/mobile-feed/FilterDrawer';
import { DateRangeDrawer } from '../components/mobile-feed/DateRangeDrawer';
import { StateSwitcherDrawer } from '../components/mobile-feed/StateSwitcherDrawer';
import { SortingDrawer } from '../components/mobile-feed/SortingDrawer';
import { SelectionModeBar } from '../components/mobile-feed/SelectionModeBar';
import { MassActionsPanel } from '../components/mobile-feed/MassActionsPanel';
import { AuthorBottomSheet } from '../components/mobile-feed/AuthorBottomSheet';
import { TagsBottomSheet } from '../components/mobile-feed/TagsBottomSheet';
import { HeaderContextMenu } from '../components/mobile-feed/HeaderContextMenu';
import { DownloadReportDialog } from '../components/mobile-feed/DownloadReportDialog';
import { SearchPublicationsDialog } from '../components/mobile-feed/SearchPublicationsDialog';
import { SourceContextMenu } from '../components/mobile-feed/SourceContextMenu';
import { SourceCardDialog } from '../components/mobile-feed/SourceCardDialog';
import { ReportSourceDialog } from '../components/mobile-feed/ReportSourceDialog';
import { MOCK_SYSTEM_TAGS } from '../data/mock-tags';
import type { Mention, Sentiment, FeedFilters, ActiveFilterChip, MentionState, SortOption } from '../types/mentions';

function buildFilterChips(filters: FeedFilters): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  for (const src of filters.sources) {
    chips.push({ key: `source:${src}`, label: src, category: 'Джерело' });
  }
  for (const lang of filters.languages) {
    chips.push({ key: `lang:${lang}`, label: lang, category: 'Мова' });
  }
  for (const country of filters.countries) {
    chips.push({ key: `country:${country}`, label: country, category: 'Географія' });
  }
  for (const author of filters.authors) {
    chips.push({ key: `author:${author}`, label: author, category: 'Автор' });
  }
  for (const tag of filters.tags.included) {
    chips.push({ key: `tag+:${tag}`, label: tag, category: 'Тег' });
  }
  for (const tag of filters.tags.excluded) {
    chips.push({ key: `tag-:${tag}`, label: `−${tag}`, category: 'Тег' });
  }
  for (const mt of filters.mentionType) {
    chips.push({ key: `type:${mt}`, label: mt, category: 'Тип' });
  }
  for (const role of filters.role) {
    chips.push({ key: `role:${role}`, label: role, category: 'Роль' });
  }
  if (filters.sentiment) {
    const labels = { positive: 'Позитивна', neutral: 'Нейтральна', negative: 'Негативна' };
    chips.push({ key: 'sentiment', label: labels[filters.sentiment], category: 'Тональність' });
  }
  if (filters.searchQuery) {
    chips.push({ key: 'search', label: filters.searchQuery, category: 'Пошук' });
  }

  return chips;
}

function MobileFeedContent() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [authorSheetOpen, setAuthorSheetOpen] = useState(false);
  const [authorSheetMention, setAuthorSheetMention] = useState<Mention | null>(null);
  const [tagsSheetOpen, setTagsSheetOpen] = useState(false);
  const [tagsSheetMention, setTagsSheetMention] = useState<Mention | null>(null);

  const tagColorMap = useMemo(
    () => Object.fromEntries(MOCK_SYSTEM_TAGS.map((t) => [t.name, t.color])),
    [],
  );
  const {
    filters,
    activeFolder,
    selectionMode,
    selectedIds,
    setFilter,
    setFilters,
    resetFilters,
    setActiveFolder,
    toggleSelectionMode,
    toggleSelected,
    selectAll,
    clearSelection,
  } = useMobileFeedContext();

  const {
    mentions,
    isLoading,
    isLoadingMore,
    hasMore,
    loadInitial,
    loadMore,
    refresh,
    updateSentiment,
    toggleProcessed,
    deleteMentions,
    bulkUpdateSentiment,
  } = useMobileFeed();

  // Drawers state
  const [viewSwitcherOpen, setViewSwitcherOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [stateSwitcherOpen, setStateSwitcherOpen] = useState(false);
  const [sortingOpen, setSortingOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const [sourceMenuMention, setSourceMenuMention] = useState<Mention | null>(null);
  const [sourceCardOpen, setSourceCardOpen] = useState(false);
  const [reportSourceOpen, setReportSourceOpen] = useState(false);
  const [blockedSources, setBlockedSources] = useState<Set<string>>(new Set());

  // Active search profile
  const activeProfile = MOCK_SEARCH_PROFILES[0];
  const keywords = activeProfile.keywords;

  // Scroll direction for nav pill hide/show
  const scrollDirection = useScrollDirection(scrollRef);
  const isNavHidden = scrollDirection === 'down' && !selectionMode;

  // Infinite scroll
  const sentinelRef = useInfiniteScroll(scrollRef, loadMore, hasMore && !isLoading);

  // Pull to refresh
  const { pullDistance, isRefreshing, touchHandlers } = usePullToRefresh(scrollRef, refresh);

  // Load initial data
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleOpenTags = useCallback((m: Mention) => {
    setTagsSheetMention(m);
    setTagsSheetOpen(true);
  }, []);

  const handleApplyTags = useCallback(
    (tags: string[]) => {
      if (tagsSheetMention) {
        // Update the mention's tags in the feed hook
        // For now, just update locally - in real app this would be an API call
        updateSentiment; // reference to keep hook stable
        toast.success('Теги оновлено');
      }
    },
    [tagsSheetMention],
  );

  // Filtered mentions
  const filteredMentions = useMemo(() => {
    let result = mentions;
    if (filters.sentiment) {
      result = result.filter((m) => m.sentiment === filters.sentiment);
    }
    if (filters.mentionState === 'processed') {
      result = result.filter((m) => m.isProcessed);
    } else if (filters.mentionState === 'unprocessed') {
      result = result.filter((m) => !m.isProcessed);
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.body.toLowerCase().includes(q) ||
          m.author.name.toLowerCase().includes(q),
      );
    }
    return result;
  }, [mentions, filters.sentiment, filters.mentionState, filters.searchQuery]);

  // Active filter chips
  const filterChips = useMemo(() => buildFilterChips(filters), [filters]);

  const handleRemoveChip = useCallback(
    (key: string) => {
      if (key === 'sentiment') {
        setFilter('sentiment', null);
        return;
      }
      if (key === 'search') {
        setFilter('searchQuery', '');
        return;
      }
      const [prefix, value] = key.split(':');
      switch (prefix) {
        case 'source':
          setFilter('sources', filters.sources.filter((s) => s !== value));
          break;
        case 'lang':
          setFilter('languages', filters.languages.filter((l) => l !== value));
          break;
        case 'country':
          setFilter('countries', filters.countries.filter((c) => c !== value));
          break;
        case 'author':
          setFilter('authors', filters.authors.filter((a) => a !== value));
          break;
        case 'tag+':
          setFilter('tags', { ...filters.tags, included: filters.tags.included.filter((t) => t !== value) });
          break;
        case 'tag-':
          setFilter('tags', { ...filters.tags, excluded: filters.tags.excluded.filter((t) => t !== value) });
          break;
        case 'type':
          setFilter('mentionType', filters.mentionType.filter((t) => t !== value));
          break;
        case 'role':
          setFilter('role', filters.role.filter((r) => r !== value));
          break;
      }
    },
    [filters, setFilter],
  );

  // Handlers
  const handleSentimentChange = useCallback(
    (id: string, sentiment: Sentiment) => {
      updateSentiment(id, sentiment);
      toast.success('Тональність оновлено');
    },
    [updateSentiment],
  );

  const handleToggleProcessed = useCallback(
    (id: string) => {
      toggleProcessed(id);
      toast.success('Статус оновлено');
    },
    [toggleProcessed],
  );

  const handleOpenSourceMenu = useCallback((m: Mention) => {
    setSourceMenuMention(m);
    setSourceMenuOpen(true);
  }, []);

  const handleCopySourceLink = useCallback(async () => {
    if (!sourceMenuMention) return;
    await navigator.clipboard.writeText(sourceMenuMention.sourceUrl);
    toast.success('Посилання скопійовано');
  }, [sourceMenuMention]);

  const handleFilterBySource = useCallback(() => {
    if (!sourceMenuMention) return;
    setFilter('sources', [sourceMenuMention.sourceType]);
    toast.success(`Фільтр за джерелом: ${sourceMenuMention.sourceLabel}`);
  }, [sourceMenuMention, setFilter]);

  const handleBlockSource = useCallback(() => {
    if (!sourceMenuMention) return;
    setBlockedSources((prev) => {
      const next = new Set(prev);
      if (next.has(sourceMenuMention.sourceLabel)) {
        next.delete(sourceMenuMention.sourceLabel);
        toast.success('Джерело розблоковано');
      } else {
        next.add(sourceMenuMention.sourceLabel);
        toast.success('Джерело заблоковано');
      }
      return next;
    });
  }, [sourceMenuMention]);

  const handleOpenDetail = useCallback(
    (id: string) => {
      navigate(`/mobile-feed/${id}`);
    },
    [navigate],
  );

  const handleOpenAuthor = useCallback((m: Mention) => {
    setAuthorSheetMention(m);
    setAuthorSheetOpen(true);
  }, []);

  const handleFilterByAuthor = useCallback(
    (authorName: string) => {
      setFilter('authors', [authorName]);
      toast.success(`Фільтр за автором: ${authorName}`);
    },
    [setFilter],
  );

  const handleLongPress = useCallback(
    (id: string) => {
      if (!selectionMode) {
        toggleSelectionMode();
        toggleSelected(id);
      }
    },
    [selectionMode, toggleSelectionMode, toggleSelected],
  );

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredMentions.length) {
      clearSelection();
    } else {
      selectAll(filteredMentions.map((m) => m.id));
    }
  }, [selectedIds.size, filteredMentions, clearSelection, selectAll]);

  const handleCancelSelection = useCallback(() => {
    clearSelection();
    toggleSelectionMode();
  }, [clearSelection, toggleSelectionMode]);

  const handleBulkSentiment = useCallback(
    (sentiment: Sentiment) => {
      bulkUpdateSentiment(Array.from(selectedIds), sentiment);
      toast.success(`Тональність змінено для ${selectedIds.size} згадок`);
      handleCancelSelection();
    },
    [selectedIds, bulkUpdateSentiment, handleCancelSelection],
  );

  const handleBulkDelete = useCallback(() => {
    deleteMentions(Array.from(selectedIds));
    toast.success(`Видалено ${selectedIds.size} згадок`);
    handleCancelSelection();
  }, [selectedIds, deleteMentions, handleCancelSelection]);

  const handleExport = useCallback(() => {
    toast.success(`Експортовано ${selectedIds.size} згадок`);
    handleCancelSelection();
  }, [selectedIds.size, handleCancelSelection]);

  const handleAddTag = useCallback(() => {
    toast.success(`Тег додано до ${selectedIds.size} згадок`);
    handleCancelSelection();
  }, [selectedIds.size, handleCancelSelection]);

  const handleApplyFilters = useCallback(
    (newFilters: FeedFilters) => {
      setFilters(newFilters);
    },
    [setFilters],
  );

  const handleStateChange = useCallback(
    (state: MentionState) => {
      setFilter('mentionState', state);
    },
    [setFilter],
  );

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      setFilter('sortBy', sort);
    },
    [setFilter],
  );

  // Context menu actions
  const handleMarkAllRead = useCallback(() => {
    toast.success('Усі публікації позначено як прочитані');
  }, []);

  const handleSearchPublications = useCallback(
    (query: string) => {
      setFilter('searchQuery', query);
    },
    [setFilter],
  );

  return (
    <div className="max-w-md mx-auto min-h-dvh bg-[#f5f6fa] relative flex flex-col">
      {/* Header or Selection Bar */}
      {selectionMode ? (
        <SelectionModeBar
          selectedCount={selectedIds.size}
          totalCount={filteredMentions.length}
          onSelectAll={handleSelectAll}
          onCancel={handleCancelSelection}
        />
      ) : (
        <MobileFeedHeader
          onOpenViewSwitcher={() => setViewSwitcherOpen(true)}
          onOpenFilters={() => setFilterDrawerOpen(true)}
          onOpenDateRange={() => setDateRangeOpen(true)}
          onOpenStateSwitcher={() => setStateSwitcherOpen(true)}
          onOpenSorting={() => setSortingOpen(true)}
          onOpenContextMenu={() => setContextMenuOpen(true)}
        />
      )}

      {/* Topic Summary */}
      <TopicSummaryBar profile={activeProfile} />

      {/* Active Filters Chips */}
      <ActiveFiltersPanel
        chips={filterChips}
        onRemoveChip={handleRemoveChip}
        onClearAll={resetFilters}
      />

      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-150"
          style={{ height: pullDistance }}
        >
          <RefreshCw
            className={`size-5 text-[#420c8d] transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          />
        </div>
      )}

      {/* Scrollable feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3"
        {...touchHandlers}
      >
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <MentionCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredMentions.length === 0 ? (
          <EmptyState onResetFilters={resetFilters} />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredMentions.map((mention) => (
              <MentionCard
                key={mention.id}
                mention={mention}
                keywords={keywords}
                selectionMode={selectionMode}
                isSelected={selectedIds.has(mention.id)}
                onSentimentChange={handleSentimentChange}
                onToggleProcessed={handleToggleProcessed}
                onToggleSelected={toggleSelected}
                onLongPress={handleLongPress}
                onOpenSourceMenu={handleOpenSourceMenu}
                onOpenDetail={handleOpenDetail}
                onOpenAuthor={handleOpenAuthor}
                onOpenTags={handleOpenTags}
                tagColors={tagColorMap}
              />
            ))}

            <div ref={sentinelRef} className="h-1" />

            {isLoadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-5 text-[#420c8d] animate-spin" />
              </div>
            )}
          </div>
        )}

        <div className="h-24" />
      </div>

      {/* Bottom Navigation */}
      {!selectionMode && <BottomNavPill isHidden={isNavHidden} />}
      {!selectionMode && <QInsightFab isHidden={isNavHidden} />}

      {/* Mass Actions Panel */}
      {selectionMode && (
        <MassActionsPanel
          selectedCount={selectedIds.size}
          onChangeSentiment={handleBulkSentiment}
          onExport={handleExport}
          onDelete={handleBulkDelete}
          onAddTag={handleAddTag}
        />
      )}

      {/* Drawers */}
      <ViewSwitcherDrawer
        open={viewSwitcherOpen}
        onOpenChange={setViewSwitcherOpen}
        activeFolder={activeFolder}
        onSelect={setActiveFolder}
      />
      <FilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        filters={filters}
        onApply={handleApplyFilters}
        onReset={resetFilters}
        totalCount={activeFolder.mentionCount}
      />
      <DateRangeDrawer
        open={dateRangeOpen}
        onOpenChange={setDateRangeOpen}
        value={filters.dateRange}
        onApply={(range) => setFilter('dateRange', range)}
      />
      <StateSwitcherDrawer
        open={stateSwitcherOpen}
        onOpenChange={setStateSwitcherOpen}
        value={filters.mentionState}
        onChange={handleStateChange}
      />
      <SortingDrawer
        open={sortingOpen}
        onOpenChange={setSortingOpen}
        value={filters.sortBy}
        onChange={handleSortChange}
      />

      {/* Source Context Menu */}
      <SourceContextMenu
        open={sourceMenuOpen}
        onOpenChange={setSourceMenuOpen}
        mention={sourceMenuMention}
        onCopyLink={handleCopySourceLink}
        onFilterBySource={handleFilterBySource}
        onBlockSource={handleBlockSource}
        onShowSourceCard={() => setSourceCardOpen(true)}
        onReportSource={() => setReportSourceOpen(true)}
      />
      <SourceCardDialog
        open={sourceCardOpen}
        onOpenChange={setSourceCardOpen}
        mention={sourceMenuMention}
        mentionCount={sourceMenuMention ? filteredMentions.filter((m) => m.sourceLabel === sourceMenuMention.sourceLabel).length : 0}
        totalCount={filteredMentions.length}
        isBlocked={sourceMenuMention ? blockedSources.has(sourceMenuMention.sourceLabel) : false}
        onBlock={handleBlockSource}
        onFilterBySource={handleFilterBySource}
      />
      <ReportSourceDialog
        open={reportSourceOpen}
        onOpenChange={setReportSourceOpen}
        sourceLabel={sourceMenuMention?.sourceLabel ?? ''}
      />

      {/* Header Context Menu */}
      <HeaderContextMenu
        open={contextMenuOpen}
        onOpenChange={setContextMenuOpen}
        isCustomPage={!activeFolder.isSystem}
        onMarkAllRead={handleMarkAllRead}
        onDownloadReport={() => setDownloadDialogOpen(true)}
        onSearchPublications={() => setSearchDialogOpen(true)}
        onEditPage={() => setViewSwitcherOpen(true)}
      />
      <DownloadReportDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
      />
      <SearchPublicationsDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        initialQuery={filters.searchQuery}
        onSearch={handleSearchPublications}
      />

      {/* Tags Bottom Sheet */}
      <TagsBottomSheet
        open={tagsSheetOpen}
        onOpenChange={setTagsSheetOpen}
        mentionTags={tagsSheetMention?.tags ?? []}
        onApply={handleApplyTags}
      />

      {/* Author Bottom Sheet */}
      <AuthorBottomSheet
        open={authorSheetOpen}
        onOpenChange={setAuthorSheetOpen}
        mention={authorSheetMention}
        onFilterByAuthor={handleFilterByAuthor}
      />

      <Toaster />
    </div>
  );
}

export default function MobileCommentsFeedPage() {
  return (
    <MobileFeedProvider>
      <MobileFeedContent />
    </MobileFeedProvider>
  );
}
