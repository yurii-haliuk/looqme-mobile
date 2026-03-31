import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/app/components/ui/drawer';
import { Check, Inbox, Star, CheckCircle, Circle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MentionState } from '../../types/mentions';

const STATE_OPTIONS: { value: MentionState; label: string; icon: typeof Inbox }[] = [
  { value: 'all', label: 'Усі', icon: Inbox },
  { value: 'selected', label: 'Обрані', icon: Star },
  { value: 'processed', label: 'Оброблені', icon: CheckCircle },
  { value: 'unprocessed', label: 'Необроблені', icon: Circle },
  { value: 'deleted', label: 'Видалені', icon: Trash2 },
];

interface StateSwitcherDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: MentionState;
  onChange: (state: MentionState) => void;
}

export function StateSwitcherDrawer({
  open,
  onOpenChange,
  value,
  onChange,
}: StateSwitcherDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Стан публікацій</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col pb-6 px-2">
          {STATE_OPTIONS.map(({ value: val, label, icon: Icon }) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                onChange(val);
                onOpenChange(false);
              }}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-lg transition-colors',
                val === value ? 'bg-[#f8edff]' : 'hover:bg-[#f5f6fa]',
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('size-5', val === value ? 'text-[#420c8d]' : 'text-[#5a5e79]')} />
                <span className={cn('text-sm', val === value ? 'font-medium text-[#420c8d]' : 'text-[#3c3e53]')}>
                  {label}
                </span>
              </div>
              {val === value && <Check className="size-5 text-[#420c8d]" />}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function getStateLabel(state: MentionState): string {
  return STATE_OPTIONS.find((o) => o.value === state)?.label ?? 'Усі';
}
