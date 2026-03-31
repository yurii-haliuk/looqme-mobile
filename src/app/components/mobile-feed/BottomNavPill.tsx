import { useState } from 'react';
import { Newspaper, BarChart3, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const TABS = [
  { id: 'mentions' as const, label: 'Згадки', Icon: Newspaper },
  { id: 'analytics' as const, label: 'Аналітика', Icon: BarChart3 },
  { id: 'search' as const, label: 'Пошук', Icon: Search },
];

type TabId = (typeof TABS)[number]['id'];

interface BottomNavPillProps {
  isHidden: boolean;
}

export function BottomNavPill({ isHidden }: BottomNavPillProps) {
  const [activeTab, setActiveTab] = useState<TabId>('mentions');

  return (
    <AnimatePresence>
      {!isHidden && (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: 0 }}
          exit={{ y: 120 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 max-w-md w-[calc(100%-80px)]"
        >
          <div className="bg-white rounded-full shadow-[0px_8px_40px_0px_rgba(0,0,0,0.12)] flex items-center p-1">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-full transition-colors',
                  activeTab === id && 'bg-[#f8edff]',
                )}
              >
                <Icon
                  className={cn(
                    'size-5',
                    activeTab === id ? 'text-[#420c8d]' : 'text-[#7a84a7]',
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-semibold leading-3',
                    activeTab === id ? 'text-[#420c8d]' : 'text-[#636688]',
                  )}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
