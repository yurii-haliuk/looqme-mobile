import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/app/components/ui/drawer';
import { CheckCheck, Download, Search, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderContextMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCustomPage: boolean;
  onMarkAllRead: () => void;
  onDownloadReport: () => void;
  onSearchPublications: () => void;
  onEditPage: () => void;
}

const MENU_ITEMS = [
  { id: 'mark-read', label: 'Позначити все, як прочитане', icon: CheckCheck, alwaysShow: true },
  { id: 'download', label: 'Завантажити звіт', icon: Download, alwaysShow: true },
  { id: 'search', label: 'Пошук за публікаціями', icon: Search, alwaysShow: true },
  { id: 'edit-page', label: 'Редагувати сторінку', icon: Pencil, alwaysShow: false },
] as const;

export function HeaderContextMenu({
  open,
  onOpenChange,
  isCustomPage,
  onMarkAllRead,
  onDownloadReport,
  onSearchPublications,
  onEditPage,
}: HeaderContextMenuProps) {
  const handleAction = (id: string) => {
    onOpenChange(false);
    switch (id) {
      case 'mark-read':
        onMarkAllRead();
        break;
      case 'download':
        onDownloadReport();
        break;
      case 'search':
        onSearchPublications();
        break;
      case 'edit-page':
        onEditPage();
        break;
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Дії</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col pb-6 px-2">
          {MENU_ITEMS.filter((item) => item.alwaysShow || (item.id === 'edit-page' && isCustomPage)).map(
            ({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleAction(id)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#f5f6fa] transition-colors text-left"
              >
                <Icon className="size-5 text-[#5a5e79]" />
                <span className="text-sm text-[#3c3e53]">{label}</span>
              </button>
            ),
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
