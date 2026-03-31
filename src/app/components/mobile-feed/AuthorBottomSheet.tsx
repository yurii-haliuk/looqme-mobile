import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/app/components/ui/drawer';
import { Separator } from '@/app/components/ui/separator';
import { Button } from '@/app/components/ui/button';
import { Users, TrendingUp, TrendingDown, Minus, Filter } from 'lucide-react';
import type { Mention } from '../../types/mentions';
import { formatAudience } from './utils';

interface AuthorBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mention: Mention | null;
  onFilterByAuthor: (authorName: string) => void;
}

export function AuthorBottomSheet({
  open,
  onOpenChange,
  mention,
  onFilterByAuthor,
}: AuthorBottomSheetProps) {
  if (!mention) return null;

  // Mock author stats
  const mockStats = {
    totalMentions: Math.floor(Math.random() * 50) + 5,
    positive: Math.floor(Math.random() * 20) + 1,
    neutral: Math.floor(Math.random() * 15) + 1,
    negative: Math.floor(Math.random() * 10) + 1,
    avgEngagement: (Math.random() * 5 + 0.5).toFixed(1),
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Про автора</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 flex flex-col gap-4">
          {/* Author info */}
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-[#e3e8f3] flex items-center justify-center">
              <Users className="size-6 text-[#5a5e79]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium text-black">{mention.author.name}</span>
              <span className="text-sm text-[#8086ab]">
                Аудиторія: {formatAudience(mention.author.audience)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Stats grid */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-[#3c3e53]">Динаміка публікацій</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f5f6fa] rounded-lg p-3 flex flex-col gap-1">
                <span className="text-xs text-[#8086ab]">Всього згадок</span>
                <span className="text-lg font-bold text-black">{mockStats.totalMentions}</span>
              </div>
              <div className="bg-[#f5f6fa] rounded-lg p-3 flex flex-col gap-1">
                <span className="text-xs text-[#8086ab]">Середня залученість</span>
                <span className="text-lg font-bold text-black">{mockStats.avgEngagement}%</span>
              </div>
            </div>

            <p className="text-sm font-medium text-[#3c3e53]">Загальна тональність</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-green-50 rounded-lg p-2 flex items-center gap-2">
                <TrendingUp className="size-4 text-[#00cc87]" />
                <span className="text-sm font-medium text-[#00cc87]">{mockStats.positive}</span>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-2 flex items-center gap-2">
                <Minus className="size-4 text-[#8086ab]" />
                <span className="text-sm font-medium text-[#8086ab]">{mockStats.neutral}</span>
              </div>
              <div className="flex-1 bg-pink-50 rounded-lg p-2 flex items-center gap-2">
                <TrendingDown className="size-4 text-[#fa248c]" />
                <span className="text-sm font-medium text-[#fa248c]">{mockStats.negative}</span>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-[#420c8d] hover:bg-[#350a73] text-white gap-2"
            onClick={() => {
              onFilterByAuthor(mention.author.name);
              onOpenChange(false);
            }}
          >
            <Filter className="size-4" />
            Фільтрувати за автором
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
