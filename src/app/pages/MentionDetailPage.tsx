import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  ExternalLink,
  Share2,
  Users,
  Globe,
  Coins,
  Copy,
  Eye,
  TrendingUp,
  Megaphone,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Smile,
  Meh,
  Frown,
  Tag,
  Trash2,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Newspaper,
  MessagesSquare,
  GitBranch,
  Star,
  AlertCircle,
  Bell,
  BellOff,
  CircleCheckBig,
  CirclePlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import type { Mention, Sentiment, SourcePlatform } from '../types/mentions';
import { MOCK_MENTIONS, MOCK_SEARCH_PROFILES } from '../data/mock-mentions';
import { MOCK_SYSTEM_TAGS } from '../data/mock-tags';
import { highlightKeywords, formatAudience, formatMetric } from '../components/mobile-feed/utils';
import { TagsBottomSheet } from '../components/mobile-feed/TagsBottomSheet';
import { MentionContextDialog } from '../components/mobile-feed/MentionContextDialog';
import { KeywordReportDialog } from '../components/mobile-feed/KeywordReportDialog';
import { SentimentPopover } from '../components/mobile-feed/SentimentPopover';
import { Plus } from 'lucide-react';

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

const SENTIMENT_CONFIG: Record<Sentiment, { label: string; Icon: typeof Smile; color: string; bg: string }> = {
  positive: { label: 'Позитивна', Icon: Smile, color: 'text-[#00cc87]', bg: 'bg-green-50' },
  neutral: { label: 'Нейтральна', Icon: Meh, color: 'text-[#8086ab]', bg: 'bg-gray-50' },
  negative: { label: 'Негативна', Icon: Frown, color: 'text-[#fa248c]', bg: 'bg-pink-50' },
};

const tagColorMap = Object.fromEntries(MOCK_SYSTEM_TAGS.map((t) => [t.name, t.color]));

// --- Keyword Sentiment Section ---
function KeywordSentimentSection({
  keywords,
  onReportKeyword,
}: {
  keywords: string[];
  onReportKeyword: () => void;
}) {
  const [sentiments, setSentiments] = useState<Record<string, Sentiment>>(() =>
    Object.fromEntries(keywords.map((kw) => [kw, 'neutral' as Sentiment])),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#8086ab] uppercase tracking-wide">
          Ключові слова в публікації
        </p>
        <button
          type="button"
          onClick={onReportKeyword}
          className="size-7 flex items-center justify-center rounded-full hover:bg-[#f5f6fa]"
        >
          <AlertCircle className="size-4 text-[#8086ab]" />
        </button>
      </div>
      {keywords.map((kw) => (
        <div key={kw} className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2">
            <mark className="text-sm font-medium text-[#fa248c] bg-pink-50 rounded-sm px-1">
              {kw}
            </mark>
            <span className="text-xs text-[#8086ab]">Головна</span>
          </div>
          <SentimentPopover
            value={sentiments[kw] || 'neutral'}
            onChange={(s) => setSentiments((prev) => ({ ...prev, [kw]: s }))}
          />
        </div>
      ))}
    </div>
  );
}

// --- Content Tab ---
function ContentTab({
  mention,
  keywords,
  onOpenTags,
  onReportKeyword,
}: {
  mention: Mention;
  keywords: string[];
  onOpenTags: () => void;
  onReportKeyword: () => void;
}) {
  const SourceIcon = SOURCE_ICONS[mention.sourceType] || Globe;
  const date = new Date(mention.publishedAt);
  const formattedDate =
    date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ', ' +
    date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Meta header */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-[#e3e8f3] flex items-center justify-center shrink-0">
          <SourceIcon className="size-5 text-[#5a5e79]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-black truncate">{mention.author.name}</span>
          <span className="text-xs text-[#8086ab]">
            {mention.sourceLabel} &middot; {formattedDate}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 flex-wrap">
        {mention.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={onOpenTags}
            className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
            style={{ backgroundColor: tagColorMap[tag] || '#420c8d' }}
          >
            {tag}
          </button>
        ))}
        <button
          type="button"
          onClick={onOpenTags}
          className="flex items-center gap-0.5 text-xs text-[#420c8d] font-medium px-2.5 py-1 rounded-full border border-[#420c8d]/30 hover:bg-[#f8edff] transition-colors"
        >
          <Plus className="size-3" />
          {mention.tags.length === 0 ? 'Додати тег' : ''}
        </button>
      </div>

      {/* Image */}
      {mention.thumbnailUrl && (
        <div className="w-full rounded-lg overflow-hidden aspect-video">
          <img
            alt=""
            className="w-full h-full object-cover"
            src={mention.thumbnailUrl}
          />
        </div>
      )}

      {/* Full text with keyword highlighting */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-black leading-[1.3]">{mention.title}</h2>
        <div className="text-sm leading-[1.6] text-black whitespace-pre-line">
          {highlightKeywords(mention.body, keywords)}
        </div>
      </div>

      <Separator />

      {/* Original engagement stats */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-[#8086ab] uppercase tracking-wide">Оригінальна залученість</p>
        <div className="flex items-center gap-4">
          {mention.metrics.reach > 0 && (
            <div className="flex items-center gap-1">
              <Megaphone className="size-4 text-[#5a5e79]" />
              <span className="text-sm text-[#3c3e53]">{formatMetric(mention.metrics.reach)}</span>
            </div>
          )}
          {mention.metrics.likes > 0 && (
            <div className="flex items-center gap-1">
              <ThumbsUp className="size-4 text-[#5a5e79]" />
              <span className="text-sm text-[#3c3e53]">{formatMetric(mention.metrics.likes)}</span>
            </div>
          )}
          {mention.metrics.comments > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="size-4 text-[#5a5e79]" />
              <span className="text-sm text-[#3c3e53]">{formatMetric(mention.metrics.comments)}</span>
            </div>
          )}
          {mention.metrics.reposts > 0 && (
            <div className="flex items-center gap-1">
              <Repeat2 className="size-4 text-[#5a5e79]" />
              <span className="text-sm text-[#3c3e53]">{formatMetric(mention.metrics.reposts)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Keywords section */}
      {keywords.length > 0 && (
        <>
          <Separator />
          <KeywordSentimentSection keywords={keywords} onReportKeyword={onReportKeyword} />
        </>
      )}
    </div>
  );
}

// --- Metrics Tab ---
function MetricsTab({ mention }: { mention: Mention }) {
  // Mock deep analytics
  const metrics = [
    {
      icon: Users,
      label: 'Аудиторія автора',
      value: formatAudience(mention.author.audience),
    },
    {
      icon: Globe,
      label: 'Аудиторія джерела',
      value: formatAudience(mention.author.audience * 3.2),
    },
    {
      icon: Coins,
      label: 'AVE (Рекламний еквівалент)',
      value: `₴${formatMetric(Math.floor(mention.metrics.reach * 0.8))}`,
    },
    {
      icon: Copy,
      label: 'Дублі (передруки)',
      value: String(Math.floor(Math.random() * 8)),
      clickable: true,
    },
    {
      icon: Eye,
      label: 'Потенційні перегляди',
      value: formatMetric(mention.metrics.reach * 2),
    },
    {
      icon: TrendingUp,
      label: 'Залученість (Engagement Rate)',
      value: `${((mention.metrics.likes + mention.metrics.comments) / Math.max(mention.metrics.reach, 1) * 100).toFixed(2)}%`,
    },
  ];

  return (
    <div className="flex flex-col divide-y divide-[#e3e8f3] pb-24">
      {metrics.map(({ icon: Icon, label, value, clickable }) => (
        <div
          key={label}
          className={cn(
            'flex items-center justify-between py-4',
            clickable && 'cursor-pointer active:bg-[#f5f6fa]',
          )}
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-[#f5f6fa] flex items-center justify-center shrink-0">
              <Icon className="size-4 text-[#5a5e79]" />
            </div>
            <span className="text-sm text-[#3c3e53]">{label}</span>
          </div>
          <span className="text-sm font-bold text-black">{value}</span>
        </div>
      ))}
    </div>
  );
}

// --- Sentiment Selector for Bottom Bar ---
function SentimentSelector({
  value,
  onChange,
}: {
  value: Sentiment;
  onChange: (s: Sentiment) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = SENTIMENT_CONFIG[value];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-1.5', current.bg, 'border-0')}
        >
          <current.Icon className={cn('size-4', current.color)} />
          <span className={cn('text-xs font-medium', current.color)}>{current.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start" side="top" sideOffset={8}>
        {Object.entries(SENTIMENT_CONFIG).map(([key, { label, Icon, color }]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              onChange(key as Sentiment);
              setOpen(false);
            }}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[#f5f6fa] transition-colors',
              key === value && 'bg-[#f5f6fa] font-medium',
            )}
          >
            <Icon className={cn('size-4', color)} />
            <span>{label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// --- Main Detail Page ---
export default function MentionDetailPage() {
  const { mentionId } = useParams<{ mentionId: string }>();
  const navigate = useNavigate();

  const [mention, setMention] = useState<Mention | null>(() =>
    MOCK_MENTIONS.find((m) => m.id === mentionId) ?? null,
  );
  const [activeTab, setActiveTab] = useState<string>('content');
  const [tagsSheetOpen, setTagsSheetOpen] = useState(false);
  const [contextDialogOpen, setContextDialogOpen] = useState(false);
  const [keywordReportOpen, setKeywordReportOpen] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubscribedDuplicates, setIsSubscribedDuplicates] = useState(false);

  const profile = MOCK_SEARCH_PROFILES[0];

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleOpenOriginal = useCallback(() => {
    if (mention) window.open(mention.sourceUrl, '_blank', 'noopener');
  }, [mention]);

  const handleShare = useCallback(async () => {
    if (!mention) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: mention.title,
          url: mention.sourceUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(mention.sourceUrl);
      toast.success('Посилання скопійовано');
    }
  }, [mention]);

  const handleSentimentChange = useCallback((sentiment: Sentiment) => {
    setMention((prev) => (prev ? { ...prev, sentiment } : prev));
    toast.success('Тональність змінено');
  }, []);

  const handleDelete = useCallback(() => {
    toast.success('Згадку видалено');
    navigate(-1);
  }, [navigate]);

  const handleOpenTags = useCallback(() => {
    setTagsSheetOpen(true);
  }, []);

  const handleApplyTags = useCallback((tags: string[]) => {
    setMention((prev) => (prev ? { ...prev, tags } : prev));
  }, []);

  const handleToggleTranslate = useCallback(async () => {
    if (isTranslated) {
      setIsTranslated(false);
      toast.success('Оригінал');
    } else {
      setIsTranslating(true);
      await new Promise((r) => setTimeout(r, 800));
      setIsTranslating(false);
      setIsTranslated(true);
      toast.success('Перекладено');
    }
  }, [isTranslated]);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite((prev) => {
      toast.success(prev ? 'Видалено з обраного' : 'Додано у обрані');
      return !prev;
    });
  }, []);

  const handleToggleSubscribeDuplicates = useCallback(() => {
    setIsSubscribedDuplicates((prev) => {
      toast.success(
        prev
          ? 'Підписку на дублі скасовано'
          : 'Ви підписалися на дублі цієї публікації',
      );
      return !prev;
    });
  }, []);

  const handleToggleProcessed = useCallback(() => {
    setMention((prev) => {
      if (!prev) return prev;
      const next = { ...prev, isProcessed: !prev.isProcessed };
      toast.success(
        next.isProcessed
          ? 'Публікацію позначено як оброблену'
          : 'Позначку "оброблено" знято',
      );
      return next;
    });
  }, []);

  if (!mention) {
    return (
      <div className="max-w-md mx-auto min-h-dvh bg-white flex items-center justify-center">
        <p className="text-[#8086ab]">Згадку не знайдено</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-dvh bg-white relative flex flex-col">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#e3e8f3]">
        <div className="flex items-center justify-between h-12 px-3">
          <button
            type="button"
            onClick={handleBack}
            className="size-9 flex items-center justify-center rounded-full hover:bg-[#f5f6fa] transition-colors"
          >
            <ArrowLeft className="size-5 text-[#3c3e53]" />
          </button>
          <span className="text-sm font-medium text-[#3c3e53] truncate mx-1">Деталі</span>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setContextDialogOpen(true)}
              className="size-9 flex items-center justify-center rounded-full hover:bg-[#f5f6fa] transition-colors"
              title="Контекст згадки"
            >
              <GitBranch className="size-4 text-[#5a5e79]" />
            </button>
            <button
              type="button"
              onClick={handleToggleTranslate}
              className={cn(
                'size-9 flex items-center justify-center rounded-full hover:bg-[#f5f6fa] transition-colors',
                isTranslating && 'animate-pulse',
              )}
              title="Переклад"
            >
              <Globe className={cn('size-4', isTranslated ? 'text-[#420c8d]' : 'text-[#5a5e79]')} />
            </button>
            <button
              type="button"
              onClick={handleToggleFavorite}
              className="size-9 flex items-center justify-center rounded-full hover:bg-[#f5f6fa] transition-colors"
              title="Обране"
            >
              <Star
                className={cn('size-4', isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-[#5a5e79]')}
              />
            </button>
            <button
              type="button"
              onClick={handleOpenOriginal}
              className="size-9 flex items-center justify-center rounded-full hover:bg-[#f5f6fa] transition-colors"
              title="Оригінал"
            >
              <ExternalLink className="size-4 text-[#00cc87]" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-0">
          <TabsList className="w-full rounded-none h-10 bg-white border-b border-[#e3e8f3] p-0">
            <TabsTrigger
              value="content"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#420c8d] data-[state=active]:text-[#420c8d] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[#8086ab]"
            >
              Вміст
            </TabsTrigger>
            <TabsTrigger
              value="metrics"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#420c8d] data-[state=active]:text-[#420c8d] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[#8086ab]"
            >
              Показники
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Scrollable content with animated tab switch */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'content' ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.15 }}
            >
              <ContentTab
                mention={mention}
                keywords={profile.keywords}
                onOpenTags={handleOpenTags}
                onReportKeyword={() => setKeywordReportOpen(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
            >
              <MetricsTab mention={mention} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white border-t border-[#e3e8f3] px-4 py-3 pb-8">
        <div className="flex items-center justify-between">
          {/* Left: Sentiment selector */}
          <SentimentSelector value={mention.sentiment} onChange={handleSentimentChange} />

          {/* Right: Quick actions */}
          <div className="flex items-center gap-1">
            {/* Subscribe to duplicates */}
            <button
              type="button"
              onClick={handleToggleSubscribeDuplicates}
              className="size-9 flex items-center justify-center rounded-full hover:bg-[#f5f6fa] transition-colors"
              title="Підписка на дублі"
            >
              {isSubscribedDuplicates ? (
                <Bell className="size-4 text-[#420c8d] fill-[#420c8d]" />
              ) : (
                <BellOff className="size-4 text-[#8086ab]" />
              )}
            </button>

            {/* Mark as processed */}
            <button
              type="button"
              onClick={handleToggleProcessed}
              className="size-9 flex items-center justify-center rounded-full hover:bg-[#f5f6fa] transition-colors"
              title="Оброблено"
            >
              {mention.isProcessed ? (
                <CircleCheckBig className="size-4 text-[#420c8d]" />
              ) : (
                <CirclePlus className="size-4 text-[#8086ab]" />
              )}
            </button>

            {/* Tags */}
            <button
              type="button"
              onClick={handleOpenTags}
              className="size-9 flex items-center justify-center rounded-full hover:bg-[#f5f6fa] transition-colors relative"
              title="Теги"
            >
              <Tag className="size-4 text-[#5a5e79]" />
              {mention.tags.length > 0 && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-[#420c8d]" />
              )}
            </button>

            {/* Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="size-9 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                  title="Видалити"
                >
                  <Trash2 className="size-4 text-red-500" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Видалити публікацію?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ви впевнені, що хочете видалити цю згадку зі стрічки? Вона
                    переміститься у видалені.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Скасувати</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Видалити
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Tags Bottom Sheet */}
      <TagsBottomSheet
        open={tagsSheetOpen}
        onOpenChange={setTagsSheetOpen}
        mentionTags={mention.tags}
        onApply={handleApplyTags}
      />

      {/* Mention Context Dialog */}
      <MentionContextDialog
        open={contextDialogOpen}
        onOpenChange={setContextDialogOpen}
        mention={mention}
      />

      {/* Keyword Report Dialog */}
      <KeywordReportDialog
        open={keywordReportOpen}
        onOpenChange={setKeywordReportOpen}
        keywords={profile.keywords}
      />

      <Toaster />
    </div>
  );
}
