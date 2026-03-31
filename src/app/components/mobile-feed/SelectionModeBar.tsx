import { X, CheckSquare } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface SelectionModeBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onCancel: () => void;
}

export function SelectionModeBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onCancel,
}: SelectionModeBarProps) {
  return (
    <div className="bg-[#420c8d] pt-3 pb-3 px-4 flex items-center justify-between sticky top-0 z-30">
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="text-white hover:bg-white/10 gap-1"
      >
        <X className="size-4" />
        Скасувати
      </Button>

      <span className="text-white text-sm font-medium">
        {selectedCount} обрано
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={onSelectAll}
        className="text-white hover:bg-white/10 gap-1"
      >
        <CheckSquare className="size-4" />
        {selectedCount === totalCount ? 'Зняти все' : 'Вибрати все'}
      </Button>
    </div>
  );
}
