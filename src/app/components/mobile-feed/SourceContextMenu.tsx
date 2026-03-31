import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/app/components/ui/drawer';
import { Link, Filter, Ban, CreditCard, AlertTriangle } from 'lucide-react';
import type { Mention } from '../../types/mentions';

interface SourceContextMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mention: Mention | null;
  onCopyLink: () => void;
  onFilterBySource: () => void;
  onBlockSource: () => void;
  onShowSourceCard: () => void;
  onReportSource: () => void;
}

const MENU_ITEMS = [
  { id: 'copy', label: 'Копіювати посилання публікації', icon: Link },
  { id: 'filter', label: 'Показати згадки тільки з цього джерела', icon: Filter },
  { id: 'block', label: 'Заблокувати джерело', icon: Ban },
  { id: 'card', label: 'Показати картку джерела', icon: CreditCard },
  { id: 'report', label: 'Повідомити про проблему з цим джерелом', icon: AlertTriangle },
] as const;

export function SourceContextMenu({
  open,
  onOpenChange,
  mention,
  onCopyLink,
  onFilterBySource,
  onBlockSource,
  onShowSourceCard,
  onReportSource,
}: SourceContextMenuProps) {
  if (!mention) return null;

  const handleAction = (id: string) => {
    onOpenChange(false);
    switch (id) {
      case 'copy':
        onCopyLink();
        break;
      case 'filter':
        onFilterBySource();
        break;
      case 'block':
        onBlockSource();
        break;
      case 'card':
        onShowSourceCard();
        break;
      case 'report':
        onReportSource();
        break;
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="truncate">{mention.sourceLabel}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col pb-6 px-2">
          {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleAction(id)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#f5f6fa] transition-colors text-left"
            >
              <Icon className={`size-5 ${id === 'block' ? 'text-red-500' : 'text-[#5a5e79]'}`} />
              <span className={`text-sm ${id === 'block' ? 'text-red-500' : 'text-[#3c3e53]'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
