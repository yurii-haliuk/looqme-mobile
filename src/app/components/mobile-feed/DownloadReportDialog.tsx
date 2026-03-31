import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATES = [
  { value: 'default', label: 'За замовчуванням' },
  { value: 'detailed', label: 'Детальний звіт' },
  { value: 'summary', label: 'Зведений звіт' },
];

const FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'word', label: 'Word' },
];

interface DownloadReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DownloadReportDialog({ open, onOpenChange }: DownloadReportDialogProps) {
  const [template, setTemplate] = useState('default');
  const [format, setFormat] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    onOpenChange(false);
    toast.success('Формування звіту почалося. Ми повідомимо, коли він буде готовий');
  };

  const handleClose = () => {
    setTemplate('default');
    setFormat('pdf');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Завантажити публікації</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#8086ab] uppercase tracking-wide">
              Виберіть шаблон
            </span>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#8086ab] uppercase tracking-wide">
              Виберіть формат
            </span>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Скасувати
            </Button>
            <Button
              className="flex-1 bg-[#00cc87] hover:bg-[#00b377] text-white"
              onClick={handleDownload}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Завантаження...
                </>
              ) : (
                'Завантажити'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
