import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/app/components/ui/drawer';
import { Button } from '@/app/components/ui/button';
import { Search, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TagFilter } from '../../types/mentions';

const MOCK_TAGS = [
  'Без тегу',
  '737',
  'позитив',
  'відкриття',
  'фінанси',
  'технології',
  'доставка',
  'рейтинг',
  'огляд',
  'акції',
  'інвестиції',
  'скарга',
  'AI',
  'маркетплейс',
  'конкуренти',
];

interface TagSelectorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: TagFilter;
  onApply: (tags: TagFilter) => void;
}

export function TagSelectorDrawer({
  open,
  onOpenChange,
  value,
  onApply,
}: TagSelectorDrawerProps) {
  const [included, setIncluded] = useState<string[]>(value.included);
  const [excluded, setExcluded] = useState<string[]>(value.excluded);
  const [search, setSearch] = useState('');

  const filtered = search
    ? MOCK_TAGS.filter((t) => t.toLowerCase().includes(search.toLowerCase()))
    : MOCK_TAGS;

  const toggleInclude = (tag: string) => {
    if (included.includes(tag)) {
      setIncluded((prev) => prev.filter((t) => t !== tag));
    } else {
      setExcluded((prev) => prev.filter((t) => t !== tag));
      setIncluded((prev) => [...prev, tag]);
    }
  };

  const toggleExclude = (tag: string) => {
    if (excluded.includes(tag)) {
      setExcluded((prev) => prev.filter((t) => t !== tag));
    } else {
      setIncluded((prev) => prev.filter((t) => t !== tag));
      setExcluded((prev) => [...prev, tag]);
    }
  };

  const handleApply = () => {
    onApply({ included, excluded });
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Вибір тегів</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col px-4 pb-2">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8086ab]" />
            <input
              type="text"
              placeholder="Введіть назву"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#d4d9e7] text-sm focus:outline-none focus:ring-2 focus:ring-[#420c8d]/30"
            />
          </div>
          <div className="flex flex-col overflow-y-auto max-h-[55vh]">
            {filtered.map((tag) => {
              const isIncluded = included.includes(tag);
              const isExcluded = excluded.includes(tag);
              return (
                <div
                  key={tag}
                  className="flex items-center justify-between py-2.5 px-1"
                >
                  <span className="text-sm text-[#3c3e53]">{tag}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleInclude(tag)}
                      className={cn(
                        'size-8 rounded-full flex items-center justify-center transition-colors',
                        isIncluded
                          ? 'bg-[#00cc87] text-white'
                          : 'bg-[#f5f6fa] text-[#5a5e79] hover:bg-[#e3e8f3]',
                      )}
                    >
                      <Plus className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExclude(tag)}
                      className={cn(
                        'size-8 rounded-full flex items-center justify-center transition-colors',
                        isExcluded
                          ? 'bg-[#fa248c] text-white'
                          : 'bg-[#f5f6fa] text-[#5a5e79] hover:bg-[#e3e8f3]',
                      )}
                    >
                      <Minus className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <DrawerFooter>
          <Button className="w-full bg-[#420c8d] hover:bg-[#350a73] text-white" onClick={handleApply}>
            Застосувати ({included.length + excluded.length} обрано)
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
