import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import type { Mention } from '../../types/mentions';
import { formatMetric } from './utils';

interface SourceCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mention: Mention | null;
  mentionCount: number;
  totalCount: number;
  isBlocked: boolean;
  onBlock: () => void;
  onFilterBySource: () => void;
}

export function SourceCardDialog({
  open,
  onOpenChange,
  mention,
  mentionCount,
  totalCount,
  isBlocked,
  onBlock,
  onFilterBySource,
}: SourceCardDialogProps) {
  if (!mention) return null;

  const percentage = totalCount > 0 ? (mentionCount / totalCount) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg truncate">{mention.sourceLabel}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5a5e79]">Кількість згадок:</span>
              <span className="text-sm font-bold text-black">{formatMetric(mentionCount)}</span>
            </div>
            <div className="h-2 w-full bg-[#e3e8f3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00cc87] rounded-full transition-[width] duration-300"
                style={{ width: `${Math.max(percentage, 2)}%` }}
              />
            </div>
            <span className="text-xs text-[#8086ab]">
              {percentage.toFixed(1)}% від загальної кількості
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-[#420c8d] text-[#420c8d]"
              onClick={() => {
                onBlock();
                onOpenChange(false);
              }}
            >
              {isBlocked ? 'Розблокувати' : 'Заблокувати'}
            </Button>
            <Button
              className="flex-1 bg-[#00cc87] hover:bg-[#00b377] text-white"
              onClick={() => {
                onFilterBySource();
                onOpenChange(false);
              }}
            >
              Показати згадки
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
