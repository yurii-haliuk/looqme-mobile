import { useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Separator } from '@/app/components/ui/separator';
import {
  Globe,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Newspaper,
  MessagesSquare,
  MessageCircle,
  Megaphone,
  ThumbsUp,
  Repeat2,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Mention, SourcePlatform } from '../../types/mentions';
import { formatAudience, formatMetric } from './utils';

const SOURCE_ICONS: Record<SourcePlatform, typeof Globe> = {
  youtube: Youtube,
  facebook: Facebook,
  instagram: Instagram,
  telegram: MessageCircle,
  twitter: Twitter,
  web: Globe,
  news: Newspaper,
  forum: MessagesSquare,
};

// Mock comment data for the thread
interface ThreadComment {
  id: string;
  author: string;
  audience: number;
  text: string;
  date: string;
  isHighlighted: boolean;
  depth: number;
  likes: number;
}

function generateMockThread(mention: Mention): { rootPost: Mention; comments: ThreadComment[] } {
  return {
    rootPost: {
      ...mention,
      title: `Оригінальний пост від ${mention.author.name}`,
      body: mention.body.slice(0, 200) + '...',
    },
    comments: [
      {
        id: 'c-1',
        author: 'user_alpha',
        audience: 1200,
        text: 'Цілком погоджуюсь! Якість дуже залежить від локації.',
        date: '26 квіт 2024 22:15',
        isHighlighted: false,
        depth: 0,
        likes: 12,
      },
      {
        id: 'c-2',
        author: mention.author.name,
        audience: mention.author.audience,
        text: mention.body.slice(0, 150),
        date: '26 квіт 2024 22:30',
        isHighlighted: true,
        depth: 1,
        likes: 45,
      },
      {
        id: 'c-3',
        author: 'food_expert_ua',
        audience: 5600,
        text: 'А спробуйте у центральних магазинах — там набагато краще.',
        date: '26 квіт 2024 23:00',
        isHighlighted: false,
        depth: 1,
        likes: 8,
      },
      {
        id: 'c-4',
        author: 'another_user',
        audience: 340,
        text: 'У Львові теж самі проблеми, на жаль.',
        date: '27 квіт 2024 08:12',
        isHighlighted: false,
        depth: 0,
        likes: 3,
      },
    ],
  };
}

interface MentionContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mention: Mention | null;
}

export function MentionContextDialog({
  open,
  onOpenChange,
  mention,
}: MentionContextDialogProps) {
  const [tab, setTab] = useState('comments');
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [open]);

  if (!mention) return null;

  const { rootPost, comments } = generateMockThread(mention);
  const SourceIcon = SOURCE_ICONS[mention.sourceType] || Globe;
  const date = new Date(mention.publishedAt);
  const formattedDate =
    date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' +
    date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto h-[95vh] flex flex-col p-0 gap-0">
        <DialogHeader className="flex flex-row items-center justify-center px-4 py-3 border-b border-[#e3e8f3] shrink-0">
          <DialogTitle className="text-base font-medium">Контекст згадки</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Root Post */}
          <div className="p-4 bg-[#f9f9fc] border-b border-[#e3e8f3]">
            <div className="flex items-center gap-2 mb-2">
              <SourceIcon className="size-5 text-[#5a5e79]" />
              <span className="text-xs text-[#5a5e79]">Пост</span>
              <span className="text-xs text-[#8086ab]">&middot; {formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-black">{rootPost.author.name}</span>
              <span className="text-xs text-[#8086ab]">{formatAudience(rootPost.author.audience)}</span>
            </div>
            <p className="text-sm text-[#3c3e53] leading-[1.4] mb-3">{rootPost.body}</p>
            <div className="flex items-center gap-4 text-xs text-[#5a5e79]">
              <div className="flex items-center gap-1">
                <Megaphone className="size-3.5" />
                <span>{formatMetric(rootPost.metrics.reach)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="size-3.5" />
                <span>{formatMetric(rootPost.metrics.likes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="size-3.5" />
                <span>{formatMetric(rootPost.metrics.comments)}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="gap-0">
            <div className="flex items-center border-b border-[#e3e8f3] px-4">
              <TabsList className="flex-1 rounded-none h-10 bg-white p-0 w-auto">
                <TabsTrigger
                  value="comments"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#420c8d] data-[state=active]:text-[#420c8d] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[#8086ab]"
                >
                  Коментарі ({comments.length})
                </TabsTrigger>
                <TabsTrigger
                  value="reposts"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#420c8d] data-[state=active]:text-[#420c8d] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[#8086ab]"
                >
                  Репости
                </TabsTrigger>
              </TabsList>
              <button type="button" className="size-8 flex items-center justify-center rounded-full hover:bg-[#f5f6fa]">
                <ArrowUpDown className="size-4 text-[#8086ab]" />
              </button>
            </div>

            <TabsContent value="comments" className="p-0 mt-0">
              <div className="flex flex-col">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    ref={comment.isHighlighted ? highlightRef : undefined}
                    className={cn(
                      'px-4 py-3 border-b border-[#e3e8f3] transition-colors',
                      comment.isHighlighted && 'bg-[#faf5ff] border-l-2 border-l-[#420c8d]',
                    )}
                    style={{ paddingLeft: `${16 + comment.depth * 24}px` }}
                  >
                    {comment.depth > 0 && (
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-[#e3e8f3]" />
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-black">{comment.author}</span>
                      <span className="text-xs text-[#8086ab]">{formatAudience(comment.audience)}</span>
                    </div>
                    <p className="text-sm text-[#3c3e53] leading-[1.4] mb-1.5">{comment.text}</p>
                    <div className="flex items-center gap-3 text-xs text-[#8086ab]">
                      <span>{comment.date}</span>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="size-3" />
                        <span>{comment.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reposts" className="p-4 mt-0">
              <p className="text-sm text-[#8086ab] text-center py-8">Репостів не знайдено</p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
