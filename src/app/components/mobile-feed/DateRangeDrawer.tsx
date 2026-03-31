import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/app/components/ui/drawer';
import { Calendar } from '@/app/components/ui/calendar';
import { Button } from '@/app/components/ui/button';
import { subDays, startOfDay, endOfDay, startOfToday } from 'date-fns';
import type { DateRange } from 'react-day-picker';

const PRESETS = [
  { label: 'Сьогодні', getRange: () => ({ from: startOfToday(), to: endOfDay(new Date()) }) },
  { label: 'Останні 7 днів', getRange: () => ({ from: subDays(startOfToday(), 6), to: endOfDay(new Date()) }) },
  { label: 'Останні 30 днів', getRange: () => ({ from: subDays(startOfToday(), 29), to: endOfDay(new Date()) }) },
];

interface DateRangeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: { from: Date; to: Date } | null;
  onApply: (range: { from: Date; to: Date } | null) => void;
}

export function DateRangeDrawer({
  open,
  onOpenChange,
  value,
  onApply,
}: DateRangeDrawerProps) {
  const [range, setRange] = useState<DateRange | undefined>(
    value ? { from: value.from, to: value.to } : undefined,
  );

  const handleApply = () => {
    if (range?.from && range?.to) {
      onApply({ from: startOfDay(range.from), to: endOfDay(range.to) });
    } else {
      onApply(null);
    }
    onOpenChange(false);
  };

  const handlePreset = (getRange: () => { from: Date; to: Date }) => {
    const r = getRange();
    setRange({ from: r.from, to: r.to });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Оберіть період</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-2">
          <div className="flex gap-2 flex-wrap mb-4">
            {PRESETS.map(({ label, getRange }) => (
              <button
                key={label}
                type="button"
                onClick={() => handlePreset(getRange)}
                className="px-3 py-1.5 rounded-full bg-[#f5f6fa] text-xs font-medium text-[#3c3e53] hover:bg-[#e3e8f3] transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={1}
            />
          </div>
        </div>

        <DrawerFooter>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setRange(undefined);
                onApply(null);
                onOpenChange(false);
              }}
            >
              Скинути
            </Button>
            <Button
              className="flex-1 bg-[#420c8d] hover:bg-[#350a73] text-white"
              onClick={handleApply}
              disabled={!range?.from || !range?.to}
            >
              Застосувати
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
