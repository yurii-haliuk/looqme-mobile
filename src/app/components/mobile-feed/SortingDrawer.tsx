import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/app/components/ui/drawer';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortOption } from '../../types/mentions';

interface SortGroup {
  label: string | null;
  options: { value: SortOption; label: string }[];
}

const SORT_GROUPS: SortGroup[] = [
  {
    label: null,
    options: [
      { value: 'date_desc', label: 'За датою (спочатку нові)' },
      { value: 'date_asc', label: 'За датою (спочатку старі)' },
      { value: 'duplicates', label: 'За кількістю дублів' },
    ],
  },
  {
    label: 'ЗМІ',
    options: [
      { value: 'monthly_audience', label: 'За місячною аудиторією' },
      { value: 'avg_views', label: 'За середньою кількістю переглядів' },
    ],
  },
  {
    label: 'Соціальні мережі',
    options: [
      { value: 'engagement', label: 'За залученістю' },
      { value: 'views', label: 'За переглядами' },
      { value: 'audience', label: 'За аудиторією' },
      { value: 'author_audience', label: 'За аудиторією автора' },
      { value: 'place_audience', label: 'За аудиторією місця' },
    ],
  },
];

interface SortingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: SortOption;
  onChange: (sort: SortOption) => void;
}

export function SortingDrawer({ open, onOpenChange, value, onChange }: SortingDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Сортування</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col pb-6 px-2">
          {SORT_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="text-xs font-medium text-[#8086ab] uppercase tracking-wide px-4 pt-4 pb-2">
                  {group.label}
                </p>
              )}
              {group.options.map(({ value: val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    onChange(val);
                    onOpenChange(false);
                  }}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-lg w-full text-left transition-colors',
                    val === value ? 'bg-[#f8edff]' : 'hover:bg-[#f5f6fa]',
                  )}
                >
                  <span className={cn('text-sm', val === value ? 'font-medium text-[#420c8d]' : 'text-[#3c3e53]')}>
                    {label}
                  </span>
                  {val === value && <Check className="size-5 text-[#420c8d]" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function getSortLabel(sort: SortOption): string {
  for (const group of SORT_GROUPS) {
    const found = group.options.find((o) => o.value === sort);
    if (found) return found.label;
  }
  return 'За датою (спочатку нові)';
}
