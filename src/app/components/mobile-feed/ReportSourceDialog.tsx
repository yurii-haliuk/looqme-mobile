import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const REPORT_REASONS = [
  'Неправильно визначена тональність',
  'Це спам',
  'Неправильне джерело',
  'Дублікат',
  'Інше',
];

interface ReportSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceLabel: string;
}

export function ReportSourceDialog({
  open,
  onOpenChange,
  sourceLabel,
}: ReportSourceDialogProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    setReason('');
    setDetails('');
    onOpenChange(false);
    toast.success('Скаргу відправлено. Дякуємо за зворотний зв\'язок');
  };

  const handleClose = () => {
    setReason('');
    setDetails('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Повідомити про проблему</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#5a5e79]">
            Джерело: <span className="font-medium text-black">{sourceLabel}</span>
          </p>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#8086ab] uppercase tracking-wide">
              Причина
            </span>
            <div className="flex flex-col gap-1">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    reason === r
                      ? 'bg-[#f8edff] text-[#420c8d] font-medium'
                      : 'hover:bg-[#f5f6fa] text-[#3c3e53]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#8086ab] uppercase tracking-wide">
              Деталі (необов'язково)
            </span>
            <textarea
              placeholder="Опишіть проблему..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-[#d4d9e7] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#420c8d]/30"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Скасувати
            </Button>
            <Button
              className="flex-1 bg-[#00cc87] hover:bg-[#00b377] text-white"
              disabled={!reason || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Відправка...
                </>
              ) : (
                'Відправити'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
