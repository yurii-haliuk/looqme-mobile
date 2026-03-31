import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/lib/utils';
import type { TagColor, SystemTag } from '../../types/mentions';
import { TAG_COLORS } from '../../data/mock-tags';

interface CreateEditTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  tag?: SystemTag | null;
  onSave: (name: string, color: TagColor) => void;
}

export function CreateEditTagDialog({
  open,
  onOpenChange,
  mode,
  tag,
  onSave,
}: CreateEditTagDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<TagColor>(TAG_COLORS[0]);

  useEffect(() => {
    if (open) {
      setName(tag?.name ?? '');
      setColor(tag?.color ?? TAG_COLORS[0]);
    }
  }, [open, tag]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), color);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === 'create' ? 'Створення тегу' : 'Редагування тегу'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-1">
          <input
            type="text"
            placeholder="Назва тегу"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-[#d4d9e7] text-sm focus:outline-none focus:ring-2 focus:ring-[#420c8d]/30"
            autoFocus
          />

          {/* Color picker */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[#8086ab] uppercase tracking-wide">
              Колір
            </span>
            <div className="flex gap-3">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'size-8 rounded-full transition-all',
                    color === c && 'ring-2 ring-offset-2 ring-[#420c8d]',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {name.trim() && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8086ab]">Попередній перегляд:</span>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: color }}
              >
                {name.trim()}
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Скасувати
            </Button>
            <Button
              className="flex-1 bg-[#00cc87] hover:bg-[#00b377] text-white"
              disabled={!name.trim()}
              onClick={handleSave}
            >
              {mode === 'create' ? 'Створити' : 'Зберегти'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
