import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/app/components/ui/drawer';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Search } from 'lucide-react';

interface FilterSelectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: string[];
  selected: string[];
  onApply: (selected: string[]) => void;
}

export function FilterSelectDrawer({
  open,
  onOpenChange,
  title,
  options,
  selected,
  onApply,
}: FilterSelectDrawerProps) {
  const [local, setLocal] = useState<string[]>(selected);
  const [search, setSearch] = useState('');
  const showSearch = options.length > 10;

  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (val: string) => {
    setLocal((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        if (!o) onApply(local);
        onOpenChange(o);
      }}
    >
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col px-4 pb-4">
          {showSearch && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8086ab]" />
              <input
                type="text"
                placeholder="Пошук..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#d4d9e7] text-sm focus:outline-none focus:ring-2 focus:ring-[#420c8d]/30"
              />
            </div>
          )}
          <div className="flex flex-col overflow-y-auto max-h-[50vh]">
            {filtered.map((option) => (
              <label key={option} className="flex items-center gap-2 py-2.5 px-1 cursor-pointer">
                <Checkbox
                  checked={local.includes(option)}
                  onCheckedChange={() => toggle(option)}
                />
                <span className="text-sm text-[#3c3e53]">{option}</span>
              </label>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-[#8086ab] py-4 text-center">Нічого не знайдено</p>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
