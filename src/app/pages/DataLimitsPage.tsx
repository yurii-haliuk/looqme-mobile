import { useState } from 'react';
import { useOutletContext, Link } from 'react-router';
import { Calendar, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import type { Organization } from '../data/mock';

// ── Types ──

type LimitStatus = 'normal' | 'warning' | 'exhausted';

interface LimitMetric {
  id: string;
  label: string;
  unit: string;
  current: number;
  max: number;
  percentage: number;
  status: LimitStatus;
  tooltipText: string;
  consequenceText: string;
  severity: 'critical' | 'medium' | 'low';
  type: 'monthly' | 'permanent';
}

// ── Constants ──

const LIMIT_COLORS = {
  normal: {
    bar: '#10B981',
    badge: '#10B981',
    badgeBg: '#ECFDF5',
    text: '#065F46',
  },
  warning: {
    bar: '#F59E0B',
    badge: '#F59E0B',
    badgeBg: '#FFFBEB',
    text: '#92400E',
  },
  exhausted: {
    bar: '#EF4444',
    badge: '#EF4444',
    badgeBg: '#FEF2F2',
    text: '#991B1B',
  },
} as const;

const METRIC_CONFIG: Record<
  string,
  {
    tooltipText: string;
    consequenceText: string;
    unit: string;
    severity: 'critical' | 'medium' | 'low';
    type: 'monthly' | 'permanent';
  }
> = {
  mentions: {
    tooltipText:
      'Публікації в медіа та соцмережах, де згадується ваш бренд або конкуренти. Кожна стаття, пост, ТВ-сюжет = 1 згадка.',
    consequenceText: 'Нові згадки не збиратимуться до оновлення ліміту',
    unit: 'згадок',
    severity: 'critical',
    type: 'monthly',
  },
  ai_coding: {
    tooltipText:
      'Автоматичний AI-аналіз згадок: визначення тональності (позитивна/негативна/нейтральна), ролі бренду та контексту.',
    consequenceText: 'AI-аналіз призупинено, ручне кодування доступне',
    unit: 'згадок',
    severity: 'medium',
    type: 'monthly',
  },
  ai_assistants: {
    tooltipText:
      'Запити до AI-асистента для підсумків згадок, виділення ключових наративів та генерації інсайтів. Кожна сесія = 1 запит.',
    consequenceText: 'Запити до AI-асистента недоступні',
    unit: 'запитів',
    severity: 'low',
    type: 'monthly',
  },
  pages: {
    tooltipText:
      'Кастомні дашборди зі звітними віджетами. Кожен дашборд можна налаштувати під бренд, конкурента або PR-кампанію.',
    consequenceText: 'Створення нових дашбордів недоступне. Видаліть непотрібні або запросіть збільшення.',
    unit: 'дашбордів',
    severity: 'medium',
    type: 'permanent',
  },
  keywords: {
    tooltipText: 'Пошукові запити для моніторингу брендів, конкурентів та тем (Keyword Builder).',
    consequenceText: 'Додавання нових ключових слів недоступне. Видаліть непотрібні або запросіть збільшення.',
    unit: '',
    severity: 'medium',
    type: 'permanent',
  },
};

// ── Utilities ──

function pluralizeUk(count: number, one: string, few: string, many: string): string {
  const abs = Math.abs(count);
  const lastTwo = abs % 100;
  const lastOne = abs % 10;
  if (lastTwo >= 11 && lastTwo <= 19) return many;
  if (lastOne === 1) return one;
  if (lastOne >= 2 && lastOne <= 4) return few;
  return many;
}

function formatDateUk(date: Date): string {
  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getCountdown(targetDate: Date): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'сьогодні';
  if (diffDays === 1) return 'завтра';
  return `через ${diffDays} ${pluralizeUk(diffDays, 'день', 'дні', 'днів')}`;
}

function getLimitStatus(current: number, max: number): LimitStatus {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
  if (percentage >= 100) return 'exhausted';
  if (percentage >= 75) return 'warning';
  return 'normal';
}

function buildMetric(id: string, label: string, current: number, max: number): LimitMetric {
  const config = METRIC_CONFIG[id];
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
  return {
    id,
    label,
    unit: config.unit,
    current,
    max,
    percentage,
    status: getLimitStatus(current, max),
    tooltipText: config.tooltipText,
    consequenceText: config.consequenceText,
    severity: config.severity,
    type: config.type,
  };
}

// ── Components ──

function InfoTooltip({ text, label }: { text: string; label: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={() => setShow((prev) => !prev)}
        className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        style={{ minWidth: '24px', minHeight: '24px' }}
        tabIndex={0}
        aria-label={`Інформація про ${label}`}
      >
        <Info className="w-4 h-4" />
      </button>
      {show && (
        <div
          className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-1 w-64 bg-popover border border-border text-popover-foreground p-2 shadow-lg"
          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

function LimitsBanner({
  planName,
  nextResetDate,
  overallStatus,
  exhaustedCount,
}: {
  planName: string;
  nextResetDate: Date;
  overallStatus: LimitStatus;
  exhaustedCount: number;
  warningCount: number;
}) {
  const formattedDate = formatDateUk(nextResetDate);
  const countdown = getCountdown(nextResetDate);

  let icon: React.ReactNode;
  let mainText: string;
  let bgClass = '';
  let customBg: Record<string, string> = {};

  switch (overallStatus) {
    case 'exhausted':
      icon = <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: LIMIT_COLORS.exhausted.bar }} />;
      mainText = `${planName} · ${exhaustedCount} ${pluralizeUk(exhaustedCount, 'ліміт', 'ліміти', 'лімітів')} вичерпано`;
      customBg = { backgroundColor: '#FEF2F2', border: '1px solid #EF444433' };
      break;
    case 'warning':
      icon = <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: LIMIT_COLORS.warning.bar }} />;
      mainText = `${planName} · Деякі ліміти наближаються до завершення`;
      customBg = { backgroundColor: '#FFFBEB', border: '1px solid #F59E0B33' };
      break;
    default:
      icon = <Calendar className="w-5 h-5 text-accent shrink-0 mt-0.5" />;
      mainText = `${planName} · Ліміти оновлюються щомісяця`;
      bgClass = 'bg-accent/10 border border-accent/20';
  }

  const dateColor =
    overallStatus === 'normal'
      ? 'var(--accent)'
      : overallStatus === 'warning'
        ? LIMIT_COLORS.warning.text
        : LIMIT_COLORS.exhausted.text;

  return (
    <div className={bgClass} style={{ borderRadius: 'var(--radius-card)', padding: '1rem', ...customBg }}>
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <p
            className="text-foreground"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
          >
            {mainText}
          </p>
          <p className="text-muted-foreground mt-0.5" style={{ fontSize: 'var(--text-sm)' }}>
            Наступне оновлення:{' '}
            <span style={{ fontWeight: 'var(--font-weight-medium)', color: dateColor }}>{formattedDate}</span>{' '}
            <span className="text-muted-foreground">({countdown})</span>
          </p>
          <div className="mt-2 flex items-center gap-3">
            {overallStatus === 'exhausted' && (
              <button
                onClick={() => alert('Запит на збільшення лімітів надіслано до служби підтримки.')}
                className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                style={{
                  borderRadius: 'var(--radius-button)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Запросити збільшення
              </button>
            )}
            <Link
              to="/plans"
              className="text-primary hover:underline"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Змінити план →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LimitRow({ metric, showInlineCta }: { metric: LimitMetric; showInlineCta?: boolean }) {
  const { status, percentage, current, max, unit, label, tooltipText, consequenceText } = metric;
  const remaining = max - current;
  const colors = LIMIT_COLORS[status];

  return (
    <div className="py-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        {/* Label + tooltip */}
        <div className="sm:w-40 shrink-0 flex items-center gap-1.5">
          <p
            className="text-foreground"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
          >
            {label}
          </p>
          <InfoTooltip text={tooltipText} label={label} />
        </div>

        {/* Progress bar */}
        <div className="flex-1">
          <div
            className="w-full bg-secondary h-2 overflow-hidden"
            style={{ borderRadius: 'var(--radius-button)' }}
            role="progressbar"
            aria-valuenow={current}
            aria-valuemax={max}
            aria-label={`${label}: ${current} з ${max} (${percentage}%)`}
          >
            <div
              style={{
                width: `${Math.min(percentage, 100)}%`,
                height: '100%',
                borderRadius: 'var(--radius-button)',
                transition: 'width 0.3s',
                backgroundColor: colors.bar,
              }}
            />
          </div>
        </div>

        {/* Values + badge */}
        <div className="sm:w-48 text-right shrink-0">
          <span
            className="text-foreground"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
          >
            {current.toLocaleString()}
          </span>
          <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            {' '}/ {max.toLocaleString()}
            {unit ? ` ${unit}` : ''}
          </span>
          <span
            className="ml-2 inline-flex px-1.5 py-0.5"
            style={{
              borderRadius: 'var(--radius-button)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-medium)',
              color: colors.badge,
              backgroundColor: colors.badgeBg,
              border: `1px solid ${colors.badge}33`,
            }}
          >
            {percentage}%
            <span className="sr-only">
              {' '}— Статус: {status === 'normal' ? 'нормальний' : status === 'warning' ? 'попередження' : 'вичерпано'}
            </span>
          </span>
        </div>
      </div>

      {/* Status text below the row */}
      {status === 'exhausted' && (
        <div className="mt-2 flex items-center justify-between">
          <p
            style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: colors.text }}
          >
            🔴 {consequenceText}
          </p>
          {showInlineCta && (
            <button
              onClick={() => alert(`Запит на збільшення ліміту "${label}" надіслано до служби підтримки.`)}
              className="shrink-0 ml-3 px-3 py-1.5 bg-secondary text-foreground border border-border hover:bg-secondary/80 transition-colors"
              style={{
                borderRadius: 'var(--radius-button)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Запросити збільшення
            </button>
          )}
        </div>
      )}
      {status === 'warning' && (
        <p
          className="mt-2"
          style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: colors.text }}
        >
          {percentage >= 90
            ? `⚠ Залишилось лише ${remaining.toLocaleString()}${unit ? ` ${unit}` : ''}`
            : `Залишилось: ${remaining.toLocaleString()}${unit ? ` ${unit}` : ''}`}
        </p>
      )}
      {status === 'normal' && percentage >= 50 && (
        <p className="mt-2 text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
          Залишилось: {remaining.toLocaleString()}
        </p>
      )}
    </div>
  );
}

// ── Page Component ──

export function DataLimitsPage() {
  const { org } = useOutletContext<{ user: { role: string }; org: Organization }>();

  const nextResetDate = new Date(org.renewal_date);

  const metrics: LimitMetric[] = [
    buildMetric('mentions', 'Згадки', org.usage.mentions_used, org.limits.mentions),
    buildMetric('ai_coding', 'ШІ кодування', org.usage.ai_coding_used, org.limits.ai_coding),
    buildMetric('ai_assistants', 'AI асистент', org.usage.ai_assistants_used, org.limits.ai_assistants),
    buildMetric('pages', 'PageTracker', org.usage.pages_used, org.limits.pages),
    buildMetric('keywords', 'Ключові слова', org.usage.keywords_count, org.limits.keywords),
  ];

  const monthlyMetrics = metrics.filter((m) => m.type === 'monthly');
  const permanentMetrics = metrics.filter((m) => m.type === 'permanent');

  // Banner status based ONLY on monthly limits
  const monthlyExhaustedCount = monthlyMetrics.filter((m) => m.status === 'exhausted').length;
  const monthlyWarningCount = monthlyMetrics.filter((m) => m.status === 'warning').length;
  const bannerStatus: LimitStatus =
    monthlyExhaustedCount > 0 ? 'exhausted' : monthlyWarningCount > 0 ? 'warning' : 'normal';

  const seatsPct = org.seats.total > 0 ? (org.seats.used / org.seats.total) * 100 : 0;
  const seatsFull = org.seats.used >= org.seats.total;

  return (
    <div className="space-y-6">
      {/* Plan name line */}
      <p
        className="text-muted-foreground"
        style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
      >
        {org.plan_name} · Поточний період
      </p>

      {/* Card 1: Monthly limits */}
      <div
        className="bg-card border border-border p-6"
        style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
      >
        <LimitsBanner
          planName={org.plan_name}
          nextResetDate={nextResetDate}
          overallStatus={bannerStatus}
          exhaustedCount={monthlyExhaustedCount}
          warningCount={monthlyWarningCount}
        />
        <div className="divide-y divide-border mt-4">
          {monthlyMetrics.map((metric) => (
            <LimitRow key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* Card 2: Permanent limits */}
      <div
        className="bg-card border border-border p-6"
        style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
      >
        <h3
          style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          className="text-foreground"
        >
          Ліміти елементів
        </h3>
        <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-sm)' }}>
          Залежать від кількості створених обʼєктів. Не скидаються щомісяця.
        </p>
        <div className="divide-y divide-border mt-4">
          {permanentMetrics.map((metric) => (
            <LimitRow key={metric.id} metric={metric} showInlineCta />
          ))}
        </div>
      </div>

      {/* Seats */}
      <div
        className="bg-card border border-border p-6"
        style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <h3
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
              className="text-foreground"
            >
              Місця
            </h3>
            <InfoTooltip
              text="Активні облікові записи користувачів вашої організації. Запрошені, але не активовані користувачі не займають місця."
              label="Місця"
            />
          </div>
          <Link
            to="/users"
            className="text-primary hover:underline"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
          >
            Керувати місцями →
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div
              className="w-full bg-secondary h-2 overflow-hidden"
              style={{ borderRadius: 'var(--radius-button)' }}
              role="progressbar"
              aria-valuenow={org.seats.used}
              aria-valuemax={org.seats.total}
              aria-label={`Місця: ${org.seats.used} з ${org.seats.total}`}
            >
              <div
                className="bg-accent"
                style={{
                  width: `${seatsPct}%`,
                  height: '100%',
                  borderRadius: 'var(--radius-button)',
                }}
              />
            </div>
          </div>
          <span
            className="text-foreground shrink-0"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
          >
            {org.seats.used} / {org.seats.total} активних місць
          </span>
        </div>
        {seatsFull ? (
          <div className="mt-2">
            <p
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-medium)',
                color: LIMIT_COLORS.warning.text,
              }}
            >
              Всі місця зайняті. Деактивуйте користувача або запросіть збільшення.
            </p>
            <div className="mt-2 flex items-center gap-3">
              <Link
                to="/users"
                className="inline-flex px-3 py-1.5 bg-accent text-white hover:bg-accent/90 transition-colors"
                style={{
                  borderRadius: 'var(--radius-button)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Керувати місцями
              </Link>
              <button
                onClick={() => alert('Запит на збільшення місць надіслано до служби підтримки.')}
                className="px-3 py-1.5 bg-secondary text-foreground border border-border hover:bg-secondary/80 transition-colors"
                style={{
                  borderRadius: 'var(--radius-button)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Запросити збільшення
              </button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground mt-2" style={{ fontSize: 'var(--text-xs)' }}>
            Запрошені користувачі не займають місця, поки не активуються.
          </p>
        )}
      </div>
    </div>
  );
}
