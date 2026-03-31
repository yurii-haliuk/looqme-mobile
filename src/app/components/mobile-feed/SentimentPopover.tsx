import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Smile, Meh, Frown, ChevronDown } from 'lucide-react';
import type { Sentiment } from '../../types/mentions';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const SENTIMENT_OPTIONS: { value: Sentiment; label: string; Icon: typeof Smile; color: string }[] = [
  { value: 'positive', label: 'Позитивна', Icon: Smile, color: 'text-[#00cc87]' },
  { value: 'neutral', label: 'Нейтральна', Icon: Meh, color: 'text-[#8086ab]' },
  { value: 'negative', label: 'Негативна', Icon: Frown, color: 'text-[#fa248c]' },
];

interface SentimentPopoverProps {
  value: Sentiment;
  onChange: (sentiment: Sentiment) => void;
}

export function SentimentPopover({ value, onChange }: SentimentPopoverProps) {
  const [open, setOpen] = useState(false);
  const current = SENTIMENT_OPTIONS.find((o) => o.value === value)!;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="flex items-center gap-0.5 shrink-0">
          <current.Icon className={cn('size-5', current.color)} />
          <ChevronDown className="size-3 text-[#8086ab]" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="end" sideOffset={4}>
        {SENTIMENT_OPTIONS.map(({ value: val, label, Icon, color }) => (
          <button
            key={val}
            type="button"
            onClick={() => {
              onChange(val);
              setOpen(false);
            }}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[#f5f6fa] transition-colors',
              val === value && 'bg-[#f5f6fa] font-medium',
            )}
          >
            <Icon className={cn('size-4', color)} />
            <span>{label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
