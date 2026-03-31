import { Smile, Download, Trash2, Tag } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { Sentiment } from '../../types/mentions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { cn } from '@/lib/utils';

interface MassActionsPanelProps {
  selectedCount: number;
  onChangeSentiment: (sentiment: Sentiment) => void;
  onExport: () => void;
  onDelete: () => void;
  onAddTag: () => void;
}

const SENTIMENT_OPTIONS: { value: Sentiment; label: string; color: string }[] = [
  { value: 'positive', label: 'Позитивна', color: 'text-[#00cc87]' },
  { value: 'neutral', label: 'Нейтральна', color: 'text-[#8086ab]' },
  { value: 'negative', label: 'Негативна', color: 'text-[#fa248c]' },
];

export function MassActionsPanel({
  selectedCount,
  onChangeSentiment,
  onExport,
  onDelete,
  onAddTag,
}: MassActionsPanelProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#d4d9e7] px-4 py-3 max-w-md mx-auto">
      <div className="flex items-center justify-around">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="flex flex-col gap-0.5 h-auto py-1.5">
              <Smile className="size-5 text-[#5a5e79]" />
              <span className="text-[10px] text-[#5a5e79]">Тональність</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1" align="center">
            {SENTIMENT_OPTIONS.map(({ value, label, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChangeSentiment(value)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[#f5f6fa] transition-colors"
              >
                <span className={cn('font-medium', color)}>{label}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="sm" onClick={onExport} className="flex flex-col gap-0.5 h-auto py-1.5">
          <Download className="size-5 text-[#5a5e79]" />
          <span className="text-[10px] text-[#5a5e79]">Експорт</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={onDelete} className="flex flex-col gap-0.5 h-auto py-1.5">
          <Trash2 className="size-5 text-red-500" />
          <span className="text-[10px] text-red-500">Видалити</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={onAddTag} className="flex flex-col gap-0.5 h-auto py-1.5">
          <Tag className="size-5 text-[#5a5e79]" />
          <span className="text-[10px] text-[#5a5e79]">Тег</span>
        </Button>
      </div>
    </div>
  );
}
