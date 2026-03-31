import { useCallback, useRef } from 'react';
import {
  Youtube,
  Globe,
  Facebook,
  Instagram,
  MessageCircle as TelegramIcon,
  Twitter,
  Newspaper,
  MessagesSquare,
  Users,
  CircleCheckBig,
  CirclePlus,
  Megaphone,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Tag,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/app/components/ui/card';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Separator } from '@/app/components/ui/separator';
import type { Mention, Sentiment, SourcePlatform } from '../../types/mentions';
import { SentimentPopover } from './SentimentPopover';
import { highlightKeywords, formatAudience, formatMetric } from './utils';
import { cn } from '@/lib/utils';

const SENTIMENT_COLORS: Record<Sentiment, string> = {
  positive: 'bg-[#00cc87]',
  neutral: 'bg-[#e3e8f3]',
  negative: 'bg-[#fa248c]',
};

const SOURCE_ICONS: Record<SourcePlatform, typeof Globe> = {
  youtube: Youtube,
  facebook: Facebook,
  instagram: Instagram,
  telegram: TelegramIcon,
  twitter: Twitter,
  web: Globe,
  news: Newspaper,
  forum: MessagesSquare,
};

interface MentionCardProps {
  mention: Mention;
  keywords: string[];
  selectionMode: boolean;
  isSelected: boolean;
  onSentimentChange: (id: string, sentiment: Sentiment) => void;
  onToggleProcessed: (id: string) => void;
  onToggleSelected: (id: string) => void;
  onLongPress: (id: string) => void;
  onOpenSourceMenu: (mention: Mention) => void;
  onOpenDetail: (id: string) => void;
  onOpenAuthor: (mention: Mention) => void;
  onOpenTags: (mention: Mention) => void;
  tagColors?: Record<string, string>;
}

export function MentionCard({
  mention,
  keywords,
  selectionMode,
  isSelected,
  onSentimentChange,
  onToggleProcessed,
  onToggleSelected,
  onLongPress,
  onOpenSourceMenu,
  onOpenDetail,
  onOpenAuthor,
  onOpenTags,
  tagColors = {},
}: MentionCardProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const isLongPress = useRef(false);

  const handlePointerDown = useCallback(() => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress(mention.id);
    }, 500);
  }, [mention.id, onLongPress]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleContentClick = useCallback(() => {
    if (isLongPress.current) return;
    if (selectionMode) {
      onToggleSelected(mention.id);
    } else {
      onOpenDetail(mention.id);
    }
  }, [selectionMode, mention.id, onToggleSelected, onOpenDetail]);

  const SourceIcon = SOURCE_ICONS[mention.sourceType] || Globe;
  const date = new Date(mention.publishedAt);
  const formattedDate =
    date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' +
    date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  const { reach, likes, comments, reposts } = mention.metrics;

  return (
    <Card
      className={cn(
        'gap-0 border-[#d4d9e7] rounded-[6px] overflow-hidden transition-transform duration-150',
        isSelected && 'border-[#420c8d] bg-[#faf5ff]',
        selectionMode && 'scale-[0.97]',
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* === CardHeader: Zone A (Source) + Date === */}
      <CardHeader className="px-2 pt-2 pb-0 gap-2 grid-rows-none flex flex-col">
        <div className="flex items-center gap-2 w-full">
          {/* Zone C: Selection checkbox */}
          {selectionMode && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelected(mention.id)}
              className="shrink-0"
            />
          )}
          <div className="flex items-center justify-between flex-1 min-w-0">
            {/* Zone A: Source (opens context menu) */}
            <button
              type="button"
              className="flex gap-1.5 items-center min-w-0 active:opacity-70 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSourceMenu(mention);
              }}
            >
              <SourceIcon className="size-5 shrink-0 text-[#5a5e79]" />
              <span className="text-xs text-black truncate">{mention.sourceLabel}</span>
              <ChevronDown className="size-3 text-[#8086ab] shrink-0" />
            </button>
            <span className="text-xs text-[#8086ab] whitespace-nowrap ml-2">{formattedDate}</span>
          </div>
        </div>

        {/* Sentiment color line */}
        <div className={cn('w-full h-[2px] rounded-[18px]', SENTIMENT_COLORS[mention.sentiment])} />

        {/* Zone B + E: Author/Audience + Sentiment + Quick Action */}
        <div className="flex items-center justify-between w-full">
          {/* Zone E: Author & Audience */}
          <button
            type="button"
            className="flex gap-2 items-center min-w-0 active:opacity-70 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAuthor(mention);
            }}
          >
            <div className="bg-[#e3e8f3] rounded-full px-2 py-0.5 flex items-center gap-1 shrink-0">
              <Users className="size-4 text-[#5a5e79]" />
              <span className="text-[13px] font-medium text-[#5a5e79] whitespace-nowrap">
                {formatAudience(mention.author.audience)}
              </span>
            </div>
            <span className="text-[13px] font-medium text-black truncate">
              {mention.author.name}
            </span>
          </button>

          <div className="flex gap-3 items-center shrink-0">
            {/* Zone B: Sentiment */}
            <SentimentPopover
              value={mention.sentiment}
              onChange={(s) => onSentimentChange(mention.id, s)}
            />
            {/* Zone C: Quick Action / Processed toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleProcessed(mention.id);
              }}
              className="shrink-0 active:scale-90 transition-transform"
            >
              {mention.isProcessed ? (
                <CircleCheckBig className="size-5 text-[#00cc87]" />
              ) : (
                <CirclePlus className="size-5 text-[#8086ab]" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>

      {/* === CardContent: Zone D (tappable content area) === */}
      <CardContent
        className="px-2 pt-3 pb-0 cursor-pointer active:bg-[#f9f9fc] transition-colors"
        onClick={handleContentClick}
      >
        <div className="flex flex-col gap-2 w-full">
          {mention.thumbnailUrl && (
            <div className="w-full rounded-md overflow-hidden aspect-video">
              <img
                alt=""
                className="w-full h-full object-cover"
                src={mention.thumbnailUrl}
                loading="lazy"
              />
            </div>
          )}
          <h3 className="font-bold text-lg leading-[1.2] text-black line-clamp-2 w-full">
            {mention.title}
          </h3>
          <p className="text-sm leading-[1.3] text-black line-clamp-4 w-full">
            {highlightKeywords(mention.body, keywords)}
          </p>
        </div>
      </CardContent>

      {/* === Tags section === */}
      <div className="px-2 pt-1 pb-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {mention.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTags(mention);
              }}
              className="text-xs font-medium px-2.5 py-0.5 rounded-full text-white truncate max-w-[120px]"
              style={{ backgroundColor: tagColors[tag] || '#420c8d' }}
            >
              {tag}
            </button>
          ))}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTags(mention);
            }}
            className="flex items-center gap-0.5 text-xs text-[#420c8d] font-medium px-2 py-0.5 rounded-full border border-[#420c8d]/30 hover:bg-[#f8edff] transition-colors"
          >
            {mention.tags.length === 0 && <Tag className="size-3" />}
            <Plus className="size-3" />
            {mention.tags.length === 0 && <span>Додати тег</span>}
          </button>
        </div>
      </div>

      {/* === CardFooter: Engagement metrics === */}
      <CardFooter className="px-2 pb-3 pt-0 flex-col gap-2 items-stretch">
        <Separator className="bg-[#d4d9e7]" />
        <div className="flex items-center justify-between w-full">
          {reach > 0 && (
            <div className="flex items-center gap-[2px]">
              <Megaphone className="size-[14px] text-[#3c3e53]" />
              <span className="text-[13px] font-medium text-[#3c3e53]">{formatMetric(reach)}</span>
            </div>
          )}
          {likes > 0 && (
            <div className="flex items-center gap-[2px]">
              <ThumbsUp className="size-[14px] text-[#3c3e53]" />
              <span className="text-[13px] font-medium text-[#3c3e53]">{formatMetric(likes)}</span>
            </div>
          )}
          {comments > 0 && (
            <div className="flex items-center gap-[2px]">
              <MessageCircle className="size-[14px] text-[#3c3e53]" />
              <span className="text-[13px] font-medium text-[#3c3e53]">
                {formatMetric(comments)}
              </span>
            </div>
          )}
          {reposts > 0 && (
            <div className="flex items-center gap-[2px]">
              <Repeat2 className="size-[14px] text-[#3c3e53]" />
              <span className="text-[13px] font-medium text-[#3c3e53]">
                {formatMetric(reposts)}
              </span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
