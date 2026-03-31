import { ChevronDown, Filter, CalendarDays, MoreVertical, ArrowUpDown } from 'lucide-react';
import { useMobileFeedContext } from '../../context/MobileFeedContext';
import { format } from 'date-fns';
import { getStateLabel } from './StateSwitcherDrawer';
import { getSortLabel } from './SortingDrawer';

interface MobileFeedHeaderProps {
  onOpenViewSwitcher: () => void;
  onOpenFilters: () => void;
  onOpenDateRange: () => void;
  onOpenStateSwitcher: () => void;
  onOpenSorting: () => void;
  onOpenContextMenu: () => void;
}

export function MobileFeedHeader({
  onOpenViewSwitcher,
  onOpenFilters,
  onOpenDateRange,
  onOpenStateSwitcher,
  onOpenSorting,
  onOpenContextMenu,
}: MobileFeedHeaderProps) {
  const { filters, activeFolder, selectionMode } = useMobileFeedContext();

  const activeFilterCount =
    filters.sources.length +
    filters.languages.length +
    filters.countries.length +
    filters.authors.length +
    filters.tags.included.length +
    filters.tags.excluded.length +
    filters.mentionType.length +
    filters.role.length;

  const dateLabel = filters.dateRange
    ? `${format(filters.dateRange.from, 'yyyy-MM-dd')} - ${format(filters.dateRange.to, 'yyyy-MM-dd')}`
    : '2026-03-08 - 2026-03-09';

  if (selectionMode) return null;

  return (
    <div className="bg-[#420c8d] pt-3 pb-3 px-4 flex flex-col items-center gap-2.5 sticky top-0 z-20">
      {/* Row 1: View Switcher + Context Menu */}
      <div className="flex items-center justify-between w-full">
        <div className="w-8" />
        <button
          type="button"
          onClick={onOpenViewSwitcher}
          className="bg-[#f8edff] rounded-full flex items-center gap-1 pl-6 pr-4 py-1"
        >
          <span className="font-bold text-base text-[#0e0233] tracking-[-0.4px] whitespace-nowrap">
            {activeFolder.name}
          </span>
          <ChevronDown className="size-5 text-[#0e0233]" />
        </button>
        <button
          type="button"
          onClick={onOpenContextMenu}
          className="size-8 flex items-center justify-center"
        >
          <MoreVertical className="size-5 text-white/80" />
        </button>
      </div>

      {/* Row 2: Filter + Date pills */}
      <div className="flex gap-2 items-center flex-wrap justify-center">
        <button
          type="button"
          onClick={onOpenFilters}
          className="bg-[#ff3694] rounded-full flex items-center gap-1 px-4 py-[5px]"
        >
          <Filter className="size-[14px] text-white" />
          <span className="text-xs text-white tracking-[-0.4px] whitespace-nowrap">
            {activeFilterCount > 0 ? `${activeFilterCount} фільтрів` : `22 КС / ${activeFolder.mentionCount}`}
          </span>
        </button>
        <button
          type="button"
          onClick={onOpenDateRange}
          className="bg-[#6936a6] rounded-full flex items-center gap-1 px-4 py-[5px]"
        >
          <CalendarDays className="size-[14px] text-white" />
          <span className="text-xs text-white tracking-[-0.4px] whitespace-nowrap">
            {dateLabel}
          </span>
        </button>
      </div>

      {/* Row 3: State switcher + Sorting */}
      <div className="flex gap-2 items-center w-full">
        <button
          type="button"
          onClick={onOpenStateSwitcher}
          className="flex-1 flex items-center justify-center gap-1 bg-white/10 rounded-full px-3 py-[5px]"
        >
          <span className="text-xs text-white/90 whitespace-nowrap">
            {getStateLabel(filters.mentionState)}
          </span>
          <ChevronDown className="size-3 text-white/60" />
        </button>
        <button
          type="button"
          onClick={onOpenSorting}
          className="flex-1 flex items-center justify-center gap-1 bg-white/10 rounded-full px-3 py-[5px] min-w-0"
        >
          <ArrowUpDown className="size-3 text-white/60 shrink-0" />
          <span className="text-xs text-white/90 truncate">
            {getSortLabel(filters.sortBy)}
          </span>
        </button>
      </div>
    </div>
  );
}
