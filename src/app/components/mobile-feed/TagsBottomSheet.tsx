import { useState, useCallback } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/app/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Button } from '@/app/components/ui/button';
import { Search, MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { SystemTag, TagColor } from '../../types/mentions';
import { MOCK_SYSTEM_TAGS } from '../../data/mock-tags';
import { CreateEditTagDialog } from './CreateEditTagDialog';
import { DeleteTagDialog } from './DeleteTagDialog';

interface TagsBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentionTags: string[];
  onApply: (tags: string[]) => void;
}

export function TagsBottomSheet({
  open,
  onOpenChange,
  mentionTags,
  onApply,
}: TagsBottomSheetProps) {
  const [allTags, setAllTags] = useState<SystemTag[]>(MOCK_SYSTEM_TAGS);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set(mentionTags));
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Create/edit tag dialog
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [tagDialogMode, setTagDialogMode] = useState<'create' | 'edit'>('create');
  const [editingTag, setEditingTag] = useState<SystemTag | null>(null);

  // Delete tag dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTag, setDeletingTag] = useState<SystemTag | null>(null);

  // Reset selection when opening
  const handleOpenChange = useCallback(
    (o: boolean) => {
      if (o) {
        setSelectedNames(new Set(mentionTags));
        setSearchQuery('');
      }
      onOpenChange(o);
    },
    [mentionTags, onOpenChange],
  );

  const filteredTags = searchQuery
    ? allTags.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allTags;

  const toggleTag = (name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleApply = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 500));
    onApply(Array.from(selectedNames));
    setIsSaving(false);
    onOpenChange(false);
    toast.success('Теги оновлено');
  };

  const handleCreateNew = () => {
    setTagDialogMode('create');
    setEditingTag(null);
    setTagDialogOpen(true);
  };

  const handleEditTag = (tag: SystemTag) => {
    setTagDialogMode('edit');
    setEditingTag(tag);
    setTagDialogOpen(true);
  };

  const handleDeleteTag = (tag: SystemTag) => {
    setDeletingTag(tag);
    setDeleteDialogOpen(true);
  };

  const handleSaveTag = useCallback(
    (name: string, color: TagColor) => {
      if (tagDialogMode === 'create') {
        const newTag: SystemTag = { id: `t-${Date.now()}`, name, color };
        setAllTags((prev) => [...prev, newTag]);
        // Auto-assign to current mention
        setSelectedNames((prev) => new Set([...prev, name]));
        toast.success('Тег створено');
      } else if (editingTag) {
        const oldName = editingTag.name;
        setAllTags((prev) =>
          prev.map((t) => (t.id === editingTag.id ? { ...t, name, color } : t)),
        );
        // Update selection if renamed
        if (oldName !== name) {
          setSelectedNames((prev) => {
            const next = new Set(prev);
            if (next.has(oldName)) {
              next.delete(oldName);
              next.add(name);
            }
            return next;
          });
        }
        toast.success('Тег оновлено');
      }
    },
    [tagDialogMode, editingTag],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deletingTag) return;
    setAllTags((prev) => prev.filter((t) => t.id !== deletingTag.id));
    setSelectedNames((prev) => {
      const next = new Set(prev);
      next.delete(deletingTag.name);
      return next;
    });
    setDeleteDialogOpen(false);
    toast.success('Тег видалено');
  }, [deletingTag]);

  return (
    <>
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle className="text-center">Теги</DrawerTitle>
          </DrawerHeader>

          {/* Search */}
          <div className="px-4 pb-2 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8086ab]" />
              <input
                type="text"
                placeholder="Введіть тег"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#d4d9e7] text-sm focus:outline-none focus:ring-2 focus:ring-[#420c8d]/30"
              />
            </div>
          </div>

          {/* Tag list */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {filteredTags.length === 0 ? (
              <p className="text-sm text-[#8086ab] text-center py-6">Нічого не знайдено</p>
            ) : (
              filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center rounded-lg hover:bg-[#f5f6fa] transition-colors group"
                >
                  {/* Checkbox + color dot + name */}
                  <button
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className="flex-1 flex items-center gap-3 px-3 py-2.5 min-w-0"
                  >
                    <Checkbox
                      checked={selectedNames.has(tag.name)}
                      onCheckedChange={() => toggleTag(tag.name)}
                      className="shrink-0"
                    />
                    <div
                      className="size-3 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm text-[#3c3e53] truncate">{tag.name}</span>
                  </button>

                  {/* Actions menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="size-8 flex items-center justify-center shrink-0 mr-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-black/5 transition-all"
                      >
                        <MoreVertical className="size-4 text-[#8086ab]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditTag(tag)}>
                        <Pencil className="size-4 mr-2" />
                        Редагувати
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteTag(tag)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Видалити
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <DrawerFooter className="flex flex-col gap-2">
            <Button
              className="w-full bg-[#00cc87] hover:bg-[#00b377] text-white"
              onClick={handleApply}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Збереження...
                </>
              ) : (
                'Застосувати'
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full border-[#420c8d] text-[#420c8d]"
              onClick={handleCreateNew}
            >
              Додати новий тег
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Create/Edit Tag Dialog */}
      <CreateEditTagDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        mode={tagDialogMode}
        tag={editingTag}
        onSave={handleSaveTag}
      />

      {/* Delete Tag Dialog */}
      <DeleteTagDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tagName={deletingTag?.name ?? ''}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
