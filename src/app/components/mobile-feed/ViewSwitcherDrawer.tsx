import { useState, useCallback } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/app/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Check, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Folder } from '../../types/mentions';
import { MOCK_FOLDERS } from '../../data/mock-mentions';
import { PageDialog } from './PageDialog';
import { DeletePageDialog } from './DeletePageDialog';

interface ViewSwitcherDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeFolder: Folder;
  onSelect: (folder: Folder) => void;
}

export function ViewSwitcherDrawer({
  open,
  onOpenChange,
  activeFolder,
  onSelect,
}: ViewSwitcherDrawerProps) {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [pageDialogMode, setPageDialogMode] = useState<'create' | 'edit'>('create');
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);

  const handleCreate = useCallback(() => {
    setPageDialogMode('create');
    setEditingFolder(null);
    setPageDialogOpen(true);
  }, []);

  const handleEdit = useCallback((folder: Folder) => {
    setPageDialogMode('edit');
    setEditingFolder(folder);
    setPageDialogOpen(true);
  }, []);

  const handleDelete = useCallback((folder: Folder) => {
    setDeletingFolder(folder);
    setDeleteDialogOpen(true);
  }, []);

  const handleSavePage = useCallback(
    (name: string, _includeFilters: boolean) => {
      if (pageDialogMode === 'create') {
        const newFolder: Folder = {
          id: `f-${Date.now()}`,
          name,
          mentionCount: 0,
          isSystem: false,
        };
        setFolders((prev) => [...prev, newFolder]);
        onSelect(newFolder);
        onOpenChange(false);
        toast.success('Сторінку успішно створено');
      } else if (editingFolder) {
        setFolders((prev) =>
          prev.map((f) => (f.id === editingFolder.id ? { ...f, name } : f)),
        );
        if (activeFolder.id === editingFolder.id) {
          onSelect({ ...editingFolder, name });
        }
        toast.success('Сторінку оновлено');
      }
    },
    [pageDialogMode, editingFolder, activeFolder, onSelect, onOpenChange],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deletingFolder) return;
    setFolders((prev) => prev.filter((f) => f.id !== deletingFolder.id));
    if (activeFolder.id === deletingFolder.id) {
      const fallback = folders.find((f) => f.isSystem) ?? folders[0];
      onSelect(fallback);
    }
    setDeleteDialogOpen(false);
    setDeletingFolder(null);
    toast.success('Сторінку видалено');
  }, [deletingFolder, activeFolder, folders, onSelect]);

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="flex flex-row items-center justify-between">
            <DrawerTitle>Оберіть папку</DrawerTitle>
            <button
              type="button"
              onClick={handleCreate}
              className="size-9 flex items-center justify-center rounded-full bg-[#f5f6fa] hover:bg-[#e3e8f3] transition-colors"
            >
              <Plus className="size-5 text-[#420c8d]" />
            </button>
          </DrawerHeader>

          <div className="flex flex-col pb-4 px-2">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={cn(
                  'flex items-center justify-between rounded-lg transition-colors group',
                  folder.id === activeFolder.id ? 'bg-[#f8edff]' : 'hover:bg-[#f5f6fa]',
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelect(folder);
                    onOpenChange(false);
                  }}
                  className="flex-1 flex items-center justify-between px-4 py-3 text-left min-w-0"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span
                      className={cn(
                        'text-sm font-medium truncate',
                        folder.id === activeFolder.id ? 'text-[#420c8d]' : 'text-[#0e0233]',
                      )}
                    >
                      {folder.name}
                    </span>
                    <span className="text-xs text-[#8086ab]">{folder.mentionCount} згадок</span>
                  </div>
                  {folder.id === activeFolder.id && (
                    <Check className="size-5 text-[#420c8d] shrink-0 ml-2" />
                  )}
                </button>

                {/* Actions for custom folders */}
                {!folder.isSystem && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="size-9 flex items-center justify-center shrink-0 mr-1 rounded-full hover:bg-black/5 transition-colors"
                      >
                        <MoreVertical className="size-4 text-[#8086ab]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(folder)}>
                        <Pencil className="size-4 mr-2" />
                        Перейменувати
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(folder)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Видалити
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}

            {/* Create button at bottom */}
            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-3 mt-2 rounded-lg text-[#420c8d] hover:bg-[#f8edff] transition-colors"
            >
              <Plus className="size-5" />
              <span className="text-sm font-medium">Створити нову сторінку</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Create / Edit Dialog */}
      <PageDialog
        open={pageDialogOpen}
        onOpenChange={setPageDialogOpen}
        mode={pageDialogMode}
        initialName={editingFolder?.name ?? ''}
        onSave={handleSavePage}
      />

      {/* Delete Confirmation */}
      <DeletePageDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        folderName={deletingFolder?.name ?? ''}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
