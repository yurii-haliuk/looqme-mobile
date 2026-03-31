import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';

interface KeywordReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keywords: string[];
}

export function KeywordReportDialog({
  open,
  onOpenChange,
  keywords,
}: KeywordReportDialogProps) {
  const [selected, setSelected] = useState('');

  const handleSubmit = () => {
    if (!selected) return;
    onOpenChange(false);
    setSelected('');
    toast.success('Дякуємо, звіт відправлено модераторам');
  };

  const handleClose = () => {
    setSelected('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Повідомити про проблему з кодуванням</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-[#5a5e79]">
              Неправильно прокодоване ключове слово:
            </span>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть ключове слово" />
              </SelectTrigger>
              <SelectContent>
                {keywords.map((kw) => (
                  <SelectItem key={kw} value={kw}>
                    {kw}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Скасувати
            </Button>
            <Button
              className="flex-1 bg-[#00cc87] hover:bg-[#00b377] text-white"
              disabled={!selected}
              onClick={handleSubmit}
            >
              Відправити
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
