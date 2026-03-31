import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';

interface PageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialName?: string;
  onSave: (name: string, includeFilters: boolean) => void;
}

export function PageDialog({
  open,
  onOpenChange,
  mode,
  initialName = '',
  onSave,
}: PageDialogProps) {
  const [name, setName] = useState(initialName);
  const [includeFilters, setIncludeFilters] = useState(true);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setIncludeFilters(mode === 'create');
    }
  }, [open, initialName, mode]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), includeFilters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === 'create' ? 'Створити нову сторінку' : 'Редагувати сторінку'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-1">
          <input
            type="text"
            placeholder="Введіть назву сторінки"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-[#d4d9e7] text-sm focus:outline-none focus:ring-2 focus:ring-[#420c8d]/30"
            autoFocus
          />

          {mode === 'create' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={includeFilters}
                onCheckedChange={(checked) => setIncludeFilters(!!checked)}
              />
              <span className="text-sm text-[#3c3e53]">Додати вибрані фільтри</span>
            </label>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Скасувати
            </Button>
            <Button
              className="flex-1 bg-[#00cc87] hover:bg-[#00b377] text-white"
              disabled={!name.trim()}
              onClick={handleSave}
            >
              Зберегти
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
