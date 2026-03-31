import { SearchX } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface EmptyStateProps {
  onResetFilters: () => void;
}

export function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
      <div className="flex items-center justify-center size-16 rounded-full bg-[#f5f6fa]">
        <SearchX className="size-8 text-[#8086ab]" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-base font-medium text-[#3c3e53]">Нічого не знайдено</p>
        <p className="text-sm text-[#8086ab]">
          Спробуйте змінити фільтри або обрати інший період
        </p>
      </div>
      <Button variant="outline" onClick={onResetFilters} className="mt-2">
        Скинути фільтри
      </Button>
    </div>
  );
}
