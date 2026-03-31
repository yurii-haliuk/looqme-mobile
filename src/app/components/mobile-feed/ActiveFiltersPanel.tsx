import { X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { ActiveFilterChip } from '../../types/mentions';

interface ActiveFiltersPanelProps {
  chips: ActiveFilterChip[];
  onRemoveChip: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFiltersPanel({ chips, onRemoveChip, onClearAll }: ActiveFiltersPanelProps) {
  if (chips.length === 0) return null;

  return (
    <div className="bg-white px-4 py-2 border-b border-[#e3e8f3]">
      <div className="flex gap-2 items-center overflow-x-auto no-scrollbar">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="shrink-0 text-xs h-7 px-2 border-[#d4d9e7] text-[#5a5e79]"
        >
          Очистити
        </Button>
        {chips.map((chip) => (
          <div
            key={chip.key}
            className="flex items-center gap-1 shrink-0 bg-[#f8edff] text-[#420c8d] rounded-full px-3 py-1 text-xs font-medium"
          >
            <span className="whitespace-nowrap">
              {chip.category}: {chip.label}
            </span>
            <button
              type="button"
              onClick={() => onRemoveChip(chip.key)}
              className="ml-0.5 hover:bg-[#ede0ff] rounded-full p-0.5 transition-colors"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
