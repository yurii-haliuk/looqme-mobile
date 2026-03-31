import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Info, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';

interface SearchPublicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
  onSearch: (query: string) => void;
}

export function SearchPublicationsDialog({
  open,
  onOpenChange,
  initialQuery = '',
  onSearch,
}: SearchPublicationsDialogProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (open) setQuery(initialQuery);
  }, [open, initialQuery]);

  const handleSearch = () => {
    if (!query.trim()) return;
    onSearch(query.trim());
    onOpenChange(false);
  };

  const handleClose = () => {
    setQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Пошук за публікаціями</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <textarea
            placeholder="Введіть пошукові слова"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-[#d4d9e7] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#420c8d]/30"
            autoFocus
          />

          <div className="flex items-center justify-between">
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="size-8 flex items-center justify-center rounded-full hover:bg-[#f5f6fa]">
                  <Info className="size-4 text-[#8086ab]" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 text-xs text-[#5a5e79]" align="start">
                <p className="font-medium mb-1">Підказки по пошуку:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Використовуйте лапки для точної фрази: "готова їжа"</li>
                  <li>Використовуйте OR для альтернатив: сільпо OR silpo</li>
                  <li>Використовуйте - для виключення: сільпо -реклама</li>
                </ul>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2">
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery('')}
                  className="gap-1 text-[#8086ab]"
                >
                  <X className="size-3" />
                  Очистити
                </Button>
              )}
              <Button
                className="bg-[#00cc87] hover:bg-[#00b377] text-white"
                disabled={!query.trim()}
                onClick={handleSearch}
              >
                Пошук
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
