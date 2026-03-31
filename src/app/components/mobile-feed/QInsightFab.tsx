import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/app/components/ui/drawer';

interface QInsightFabProps {
  isHidden: boolean;
}

export function QInsightFab({ isHidden }: QInsightFabProps) {
  const [open, setOpen] = useState(false);

  if (isHidden) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-7 right-4 z-20 size-[56px] rounded-full shadow-[0px_8px_40px_0px_rgba(0,0,0,0.12)] flex items-center justify-center"
        style={{
          backgroundImage:
            'linear-gradient(113.85deg, #9748ff 13.98%, #00cc87 42.07%, #ae98ff 63.21%, #fa248c 81.42%)',
        }}
      >
        <Sparkles className="size-6 text-white" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Q Insight</DrawerTitle>
            <DrawerDescription>AI-асистент для аналізу згадок</DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 p-4 flex flex-col items-center justify-center gap-4 min-h-[300px]">
            <div className="size-16 rounded-full bg-gradient-to-br from-[#9748ff] to-[#00cc87] flex items-center justify-center">
              <Sparkles className="size-8 text-white" />
            </div>
            <p className="text-sm text-[#8086ab] text-center max-w-[240px]">
              Запитайте AI про поточну вибірку згадок. Наприклад: "Які основні теми негативних відгуків?"
            </p>
            <div className="w-full flex gap-2 mt-4">
              <input
                type="text"
                placeholder="Введіть запитання..."
                className="flex-1 h-10 rounded-full border border-[#d4d9e7] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#420c8d]/30"
              />
              <button
                type="button"
                className="h-10 px-4 rounded-full bg-[#420c8d] text-white text-sm font-medium"
              >
                Надіслати
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
