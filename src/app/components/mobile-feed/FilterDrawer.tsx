import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { Switch } from '@/app/components/ui/switch';
import { ChevronDown, X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedFilters, SourcePlatform, TagFilter } from '../../types/mentions';
import { FilterSelectDrawer } from './FilterSelectDrawer';
import { TagSelectorDrawer } from './TagSelectorDrawer';

const SOURCE_OPTIONS: { value: SourcePlatform; label: string }[] = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'web', label: 'Веб-сайти' },
  { value: 'news', label: 'Новини' },
  { value: 'forum', label: 'Форуми' },
];

const LANGUAGE_OPTIONS = ['Українська', 'Англійська', 'Російська', 'Польська', 'Німецька', 'Французька'];
const COUNTRY_OPTIONS = ['Україна', 'Польща', 'Німеччина', 'США', 'Великобританія', 'Франція', 'Канада', 'Австрія', 'Чехія', 'Словаччина', 'Румунія'];
const SENTIMENT_OPTIONS = ['Позитивна', 'Нейтральна', 'Негативна'];
const ROLE_OPTIONS = ['Автор', 'Коментатор', 'Згадка'];
const MENTION_TYPE_OPTIONS = ['Пост', 'Коментар', 'Відео', 'Стаття', 'Сторіз', 'Твіт'];

type SubDrawer = 'sources' | 'languages' | 'countries' | 'sentiment' | 'role' | 'mentionType' | 'tags' | null;

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FeedFilters;
  onApply: (filters: FeedFilters) => void;
  onReset: () => void;
  totalCount?: number;
}

function FieldButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[#8086ab] uppercase tracking-wide">{label}</span>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-between h-10 px-3 rounded-lg border border-[#d4d9e7] bg-white text-left"
      >
        <span className="text-sm text-[#3c3e53] truncate">{value}</span>
        <ChevronDown className="size-4 text-[#8086ab] shrink-0" />
      </button>
    </div>
  );
}

export function FilterDrawer({
  open,
  onOpenChange,
  filters,
  onApply,
  onReset,
  totalCount = 1596,
}: FilterDrawerProps) {
  const [local, setLocal] = useState<FeedFilters>({ ...filters });
  const [subDrawer, setSubDrawer] = useState<SubDrawer>(null);

  const updateLocal = <K extends keyof FeedFilters>(key: K, value: FeedFilters[K]) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const formatSelected = (arr: string[], allLabel: string) =>
    arr.length === 0 ? allLabel : `Вибрано ${arr.length}`;

  const handleApply = () => {
    onApply(local);
    onOpenChange(false);
  };

  const handleReset = () => {
    onReset();
    onOpenChange(false);
  };

  // Dynamically compute count (mock: reduce from total based on filter count)
  const activeFilterCount =
    local.sources.length +
    local.languages.length +
    local.countries.length +
    local.authors.length +
    local.tags.included.length +
    local.tags.excluded.length +
    local.mentionType.length +
    local.role.length +
    (local.geographyEnabled ? 1 : 0) +
    (local.ratingRange ? 1 : 0) +
    (local.audienceRange ? 1 : 0);
  const estimatedCount = Math.max(1, totalCount - activeFilterCount * 80);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md mx-auto h-[95vh] flex flex-col p-0 gap-0">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-[#e3e8f3] shrink-0">
            <button type="button" onClick={() => onOpenChange(false)}>
              <X className="size-5 text-[#5a5e79]" />
            </button>
            <DialogTitle className="text-base font-medium">Фільтри</DialogTitle>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-[#420c8d] font-medium"
            >
              Скинути
            </button>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 flex flex-col gap-5">
            {/* Source */}
            <FieldButton
              label="Тип джерела"
              value={formatSelected(local.sources, 'Всі джерела')}
              onClick={() => setSubDrawer('sources')}
            />

            {/* Sentiment */}
            <FieldButton
              label="Тональність"
              value={local.sentiment ? SENTIMENT_OPTIONS[['positive', 'neutral', 'negative'].indexOf(local.sentiment)] : 'Всі тональності'}
              onClick={() => setSubDrawer('sentiment')}
            />

            {/* Language */}
            <FieldButton
              label="Мова"
              value={formatSelected(local.languages, 'Всі мови')}
              onClick={() => setSubDrawer('languages')}
            />

            {/* Role */}
            <FieldButton
              label="Роль"
              value={formatSelected(local.role, 'Всі ролі')}
              onClick={() => setSubDrawer('role')}
            />

            {/* Mention Type */}
            <FieldButton
              label="Тип згадки"
              value={formatSelected(local.mentionType, 'Всі типи')}
              onClick={() => setSubDrawer('mentionType')}
            />

            <Separator />

            {/* Tags */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[#8086ab] uppercase tracking-wide">Теги</span>
              <button
                type="button"
                onClick={() => setSubDrawer('tags')}
                className="flex items-center justify-between h-10 px-3 rounded-lg border border-[#d4d9e7] bg-white text-left"
              >
                <span className="text-sm text-[#3c3e53]">
                  {local.tags.included.length + local.tags.excluded.length > 0
                    ? `Вибрано ${local.tags.included.length + local.tags.excluded.length} тегів`
                    : 'Всі теги'}
                </span>
                <Tag className="size-4 text-[#8086ab]" />
              </button>
              {local.tags.included.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {local.tags.included.map((t) => (
                    <span key={t} className="text-xs bg-green-50 text-[#00cc87] px-2 py-0.5 rounded-full">
                      + {t}
                    </span>
                  ))}
                </div>
              )}
              {local.tags.excluded.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {local.tags.excluded.map((t) => (
                    <span key={t} className="text-xs bg-pink-50 text-[#fa248c] px-2 py-0.5 rounded-full">
                      − {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Geography toggle */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#8086ab] uppercase tracking-wide">Географія</span>
                <Switch
                  checked={local.geographyEnabled}
                  onCheckedChange={(checked) => updateLocal('geographyEnabled', checked)}
                />
              </div>
              {local.geographyEnabled && (
                <FieldButton
                  label="Країна"
                  value={formatSelected(local.countries, 'Всі країни')}
                  onClick={() => setSubDrawer('countries')}
                />
              )}
            </div>

            <Separator />

            {/* Rating range */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[#8086ab] uppercase tracking-wide">
                Рейтинг місця публікації
              </span>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  placeholder="Від"
                  value={local.ratingRange?.min ?? ''}
                  onChange={(e) =>
                    updateLocal('ratingRange', {
                      min: Number(e.target.value) || 0,
                      max: local.ratingRange?.max ?? 5,
                    })
                  }
                  className="flex-1 h-10 px-3 rounded-lg border border-[#d4d9e7] text-sm focus:outline-none focus:ring-2 focus:ring-[#420c8d]/30"
                />
                <span className="text-[#8086ab]">—</span>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  placeholder="До"
                  value={local.ratingRange?.max ?? ''}
                  onChange={(e) =>
                    updateLocal('ratingRange', {
                      min: local.ratingRange?.min ?? 0,
                      max: Number(e.target.value) || 5,
                    })
                  }
                  className="flex-1 h-10 px-3 rounded-lg border border-[#d4d9e7] text-sm focus:outline-none focus:ring-2 focus:ring-[#420c8d]/30"
                />
              </div>
            </div>

            {/* Audience range */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[#8086ab] uppercase tracking-wide">
                Аудиторія згадки
              </span>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Від"
                  value={local.audienceRange?.min ?? ''}
                  onChange={(e) =>
                    updateLocal('audienceRange', {
                      min: Number(e.target.value) || 0,
                      max: local.audienceRange?.max ?? 0,
                    })
                  }
                  className="flex-1 h-10 px-3 rounded-lg border border-[#d4d9e7] text-sm focus:outline-none focus:ring-2 focus:ring-[#420c8d]/30"
                  inputMode="numeric"
                />
                <span className="text-[#8086ab]">—</span>
                <input
                  type="number"
                  placeholder="До"
                  value={local.audienceRange?.max ?? ''}
                  onChange={(e) =>
                    updateLocal('audienceRange', {
                      min: local.audienceRange?.min ?? 0,
                      max: Number(e.target.value) || 0,
                    })
                  }
                  className="flex-1 h-10 px-3 rounded-lg border border-[#d4d9e7] text-sm focus:outline-none focus:ring-2 focus:ring-[#420c8d]/30"
                  inputMode="numeric"
                />
              </div>
            </div>

            <Separator />

            {/* Action links */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#8086ab]">⊕ Використано 24/25 ключових слів</p>
              <button type="button" className="text-sm text-[#420c8d] font-medium text-left">
                ⊕ Запропонувати джерело
              </button>
              <button type="button" className="text-sm text-[#420c8d] font-medium text-left">
                Популярні слова →
              </button>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-[#e3e8f3]">
            <Button
              className="w-full h-12 bg-[#420c8d] hover:bg-[#350a73] text-white text-base font-medium"
              onClick={handleApply}
            >
              Показати {estimatedCount} публікацій
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-drawers for multi-select fields */}
      <FilterSelectDrawer
        open={subDrawer === 'sources'}
        onOpenChange={(o) => !o && setSubDrawer(null)}
        title="Тип джерела"
        options={SOURCE_OPTIONS.map((s) => s.label)}
        selected={local.sources.map((s) => SOURCE_OPTIONS.find((o) => o.value === s)?.label ?? s)}
        onApply={(selected) => {
          updateLocal(
            'sources',
            selected
              .map((label) => SOURCE_OPTIONS.find((o) => o.label === label)?.value)
              .filter(Boolean) as SourcePlatform[],
          );
          setSubDrawer(null);
        }}
      />

      <FilterSelectDrawer
        open={subDrawer === 'languages'}
        onOpenChange={(o) => !o && setSubDrawer(null)}
        title="Мова"
        options={LANGUAGE_OPTIONS}
        selected={local.languages}
        onApply={(s) => { updateLocal('languages', s); setSubDrawer(null); }}
      />

      <FilterSelectDrawer
        open={subDrawer === 'countries'}
        onOpenChange={(o) => !o && setSubDrawer(null)}
        title="Країна"
        options={COUNTRY_OPTIONS}
        selected={local.countries}
        onApply={(s) => { updateLocal('countries', s); setSubDrawer(null); }}
      />

      <FilterSelectDrawer
        open={subDrawer === 'sentiment'}
        onOpenChange={(o) => !o && setSubDrawer(null)}
        title="Тональність"
        options={SENTIMENT_OPTIONS}
        selected={local.sentiment ? [SENTIMENT_OPTIONS[['positive', 'neutral', 'negative'].indexOf(local.sentiment)]] : []}
        onApply={(s) => {
          const idx = SENTIMENT_OPTIONS.indexOf(s[0]);
          updateLocal('sentiment', idx >= 0 ? (['positive', 'neutral', 'negative'] as const)[idx] : null);
          setSubDrawer(null);
        }}
      />

      <FilterSelectDrawer
        open={subDrawer === 'role'}
        onOpenChange={(o) => !o && setSubDrawer(null)}
        title="Роль"
        options={ROLE_OPTIONS}
        selected={local.role}
        onApply={(s) => { updateLocal('role', s); setSubDrawer(null); }}
      />

      <FilterSelectDrawer
        open={subDrawer === 'mentionType'}
        onOpenChange={(o) => !o && setSubDrawer(null)}
        title="Тип згадки"
        options={MENTION_TYPE_OPTIONS}
        selected={local.mentionType}
        onApply={(s) => { updateLocal('mentionType', s); setSubDrawer(null); }}
      />

      <TagSelectorDrawer
        open={subDrawer === 'tags'}
        onOpenChange={(o) => !o && setSubDrawer(null)}
        value={local.tags}
        onApply={(tags) => { updateLocal('tags', tags); setSubDrawer(null); }}
      />
    </>
  );
}
