import { useState } from 'react';
import { useOutletContext, Link } from 'react-router';
import {
  CheckCircle2,
  Calendar,
  Users,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Blocks,
  CreditCard,
  Clock,
  Settings,
  KeyRound,
  LogIn,
  XCircle,
  Loader2,
  Info,
} from 'lucide-react';
import type { Organization } from '../data/mock';
import { MOCK_USERS, MOCK_AUDIT_LOGS } from '../data/mock';
import { format, formatDistanceToNow } from 'date-fns';

/* ─── Types ─── */
interface OutletCtx {
  user: { role: string; full_name: string };
  org: Organization;
}

/* ─── Mock integrations summary ─── */
const INTEGRATIONS_SUMMARY = {
  connected: 2,
  error: 1,
  needsReconnect: 0,
  total: 5,
};

/* ─── Billing status mock ─── */
type BillingHealth = 'ok' | 'past_due' | 'failed';
const BILLING_STATUS: BillingHealth = 'ok';

/* ─── Helper: derive last-activity entries from audit log ─── */
function deriveLastActivity() {
  const lastLogin = MOCK_AUDIT_LOGS.find((e) => e.category === 'Вхід');
  const lastSettingsChange = MOCK_AUDIT_LOGS.find(
    (e) => e.category === 'Налаштування'
  );
  const lastKeywordChange = MOCK_AUDIT_LOGS.find(
    (e) => e.object_type === 'keyword' || e.object_type === 'keywords'
  );
  return { lastLogin, lastSettingsChange, lastKeywordChange };
}

/* ═══════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════ */

/* ── Usage bar row ── */
function UsageRow({
  label,
  used,
  limit,
  resetLabel,
  tooltip,
}: {
  label: string;
  used: number;
  limit: number;
  resetLabel?: string;
  tooltip?: string;
}) {
  const pct = Math.min((used / limit) * 100, 100);
  const isHigh = pct > 85;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-foreground inline-flex items-center gap-1"
          style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
        >
          {label}
          {tooltip && (
            <span
              className="relative inline-flex"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info
                className="w-3.5 h-3.5 text-muted-foreground cursor-help hover:text-foreground transition-colors"
              />
              {showTooltip && (
                <span
                  className="absolute left-1/2 bottom-full mb-2 z-50 pointer-events-none"
                  style={{
                    transform: 'translateX(-50%)',
                    width: 'max-content',
                    maxWidth: '260px',
                  }}
                >
                  <span
                    className="block bg-foreground text-background px-3 py-2"
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-normal)',
                      fontFamily: "'Roboto', sans-serif",
                      lineHeight: '1.4',
                      borderRadius: 'var(--radius)',
                      boxShadow: 'var(--elevation-md)',
                    }}
                  >
                    {tooltip}
                  </span>
                  {/* Arrow */}
                  <span
                    className="absolute left-1/2 top-full"
                    style={{
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: '5px solid var(--foreground)',
                    }}
                  />
                </span>
              )}
            </span>
          )}
        </span>
        <span style={{ fontSize: 'var(--text-xs)' }}>
          <span className="text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            {used.toLocaleString()}
          </span>
          <span className="text-muted-foreground"> / {limit.toLocaleString()}</span>
        </span>
      </div>
      <div
        className="w-full bg-secondary h-1.5 overflow-hidden"
        style={{ borderRadius: 'var(--radius-button)' }}
      >
        <div
          className={isHigh ? 'bg-destructive' : 'bg-primary'}
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 'var(--radius-button)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
          {pct.toFixed(0)}% використано
        </span>
        {resetLabel && (
          <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
            Скидається {resetLabel}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Card wrapper ── */
function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-card border border-border ${className}`}
      style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
    >
      {children}
    </div>
  );
}

/* ── Section title ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-foreground mb-4"
      style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
    >
      {children}
    </h3>
  );
}

/* ═══════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════ */
export function AccountOverview() {
  const { user, org } = useOutletContext<OutletCtx>();
  const isAdmin = user.role === 'Admin';

  /* Simulated loading / error state for usage */
  const [usageError, setUsageError] = useState(false);
  const [usageLoading, setUsageLoading] = useState(false);

  const handleRetry = () => {
    setUsageLoading(true);
    setTimeout(() => {
      setUsageLoading(false);
      setUsageError(false);
    }, 1200);
  };

  const { lastLogin, lastSettingsChange, lastKeywordChange } = deriveLastActivity();

  /* Status helpers */
  const statusColor: Record<string, string> = {
    active: 'text-primary',
    trial: 'text-chart-3',
    past_due: 'text-destructive',
    canceled: 'text-muted-foreground',
  };
  const statusIcon: Record<string, React.ReactNode> = {
    active: <CheckCircle2 className="w-4 h-4 text-primary" />,
    trial: <Clock className="w-4 h-4 text-chart-3" />,
    past_due: <AlertTriangle className="w-4 h-4 text-destructive" />,
    canceled: <XCircle className="w-4 h-4 text-muted-foreground" />,
  };

  const billingColor: Record<BillingHealth, { bg: string; text: string; label: string }> = {
    ok: { bg: 'bg-primary/10', text: 'text-primary', label: 'ОК' },
    past_due: { bg: 'bg-chart-3/10', text: 'text-chart-3', label: 'Прострочено' },
    failed: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Помилка' },
  };

  const renewalLabel =
    org.subscription_status === 'trial' ? 'Тріал закінчується' : 'Продовження';

  return (
    <div className="space-y-8">
      {/* ──── 1. Subscription Plan ──── */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <SectionTitle>Підписка</SectionTitle>
          {isAdmin && (
            <Link
              to="/plans"
              className="inline-flex items-center gap-1.5 text-accent hover:underline shrink-0"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Змінити план <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Plan */}
          <div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
              План
            </p>
            <p
              className="text-foreground mt-0.5"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}
            >
              {org.plan_name}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
              Статус
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {statusIcon[org.subscription_status]}
              <span
                className={statusColor[org.subscription_status]}
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {org.subscription_status.charAt(0).toUpperCase() +
                  org.subscription_status.slice(1).replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Renewal / trial end */}
          <div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
              {renewalLabel}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                {format(new Date(org.renewal_date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* Seats */}
          <div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
              Місця
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className="text-foreground"
                style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {org.seats.used}
              </span>
              <span
                className="text-muted-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-normal)' }}
              >
                / {org.seats.total}
              </span>
            </div>
            {isAdmin && (
              <Link
                to="/users"
                className="inline-flex items-center gap-1 text-accent hover:underline mt-1"
                style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
              >
                <Users className="w-3 h-3" /> Керувати місцями
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* ──── 2. Usage Summary ──── */}
      <div>
        <SectionTitle>Використання</SectionTitle>

        {usageError ? (
          /* Error state */
          <Card className="p-8 flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <p
              className="text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Не вдалося завантажити дані
            </p>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
              Перевірте з'єднання та спробуйте ще раз.
            </p>
            <button
              onClick={handleRetry}
              disabled={usageLoading}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
              style={{
                borderRadius: 'var(--radius-button)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              {usageLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Повторити
            </button>
          </Card>
        ) : usageLoading ? (
          /* Loading state */
          <Card className="p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </Card>
        ) : (
          /* Normal state */
          <Card className="p-6">
            <div className="divide-y divide-border">
              <UsageRow
                label="Згадки"
                used={org.usage.mentions_used}
                limit={org.limits.mentions}
                resetLabel="щомісяця"
                tooltip="Кількість згадок, зібраних системою моніторингу за поточний місяць. Лічильник скидається 1-го числа кожного місяця."
              />
              <UsageRow
                label="AI Кодинг"
                used={org.usage.ai_coding_used}
                limit={org.limits.ai_coding}
                resetLabel="щомісяця"
                tooltip="Кількість запитів до AI-кодингу (генерація, рефакторинг, автодоповнення). Рахується кожен окремий виклик API."
              />
              <UsageRow
                label="AI Асистенти"
                used={org.usage.ai_assistants_used}
                limit={org.limits.ai_assistants}
                tooltip="Загальна кількість запитів до AI-асистентів (Q Insight тощо). Ліміт діє на весь період підписки."
              />
              <UsageRow
                label="Сторінки"
                used={org.usage.pages_used}
                limit={org.limits.pages}
                tooltip="Кількість створених сторінок моніторингу та аналітичних дашбордів. Ліміт діє на весь період підписки."
              />
              <UsageRow
                label="Ключові слова"
                used={org.usage.keywords_count}
                limit={org.limits.keywords}
                tooltip="Активні ключові слова та фрази для моніторингу. Рахуються лише унікальні ключові слова по всіх темах."
              />
            </div>

            {/* Simulate error for demo */}
            <button
              onClick={() => setUsageError(true)}
              className="mt-4 text-muted-foreground hover:text-foreground hover:underline"
              style={{ fontSize: 'var(--text-xs)' }}
            >
              Симулювати помилку
            </button>
          </Card>
        )}
      </div>

      {/* ──── 3. Quick Status Row: Integrations + Billing ──── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Integrations summary */}
        <Card className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 text-accent rounded-full">
                <Blocks className="w-4 h-4" />
              </div>
              <span
                className="text-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Інтеграції
              </span>
            </div>
            <Link
              to="/integrations"
              className="inline-flex items-center gap-1 text-accent hover:underline"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Переглянути <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p
                className="text-primary"
                style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {INTEGRATIONS_SUMMARY.connected}
              </p>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                Підключено
              </p>
            </div>
            <div className="text-center">
              <p
                className={INTEGRATIONS_SUMMARY.error > 0 ? 'text-destructive' : 'text-foreground'}
                style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {INTEGRATIONS_SUMMARY.error}
              </p>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                Помилки
              </p>
            </div>
            <div className="text-center">
              <p
                className={
                  INTEGRATIONS_SUMMARY.needsReconnect > 0 ? 'text-chart-3' : 'text-foreground'
                }
                style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {INTEGRATIONS_SUMMARY.needsReconnect}
              </p>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                Переєднання
              </p>
            </div>
          </div>

          {INTEGRATIONS_SUMMARY.error > 0 && (
            <div
              className="mt-4 flex items-center gap-2 bg-destructive/5 px-3 py-2"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
              <span className="text-destructive" style={{ fontSize: 'var(--text-xs)' }}>
                {INTEGRATIONS_SUMMARY.error} {INTEGRATIONS_SUMMARY.error > 1 ? 'інтеграцій потребують' : 'інтеграція потребує'} уваги
              </span>
            </div>
          )}
        </Card>

        {/* Billing status */}
        <Card className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 text-primary rounded-full">
                <CreditCard className="w-4 h-4" />
              </div>
              <span
                className="text-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Білінг
              </span>
            </div>
            <Link
              to="/billing"
              className="inline-flex items-center gap-1 text-accent hover:underline"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Деталі <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 border ${billingColor[BILLING_STATUS].bg} ${billingColor[BILLING_STATUS].text}`}
              style={{
                borderRadius: 'var(--radius-button)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                borderColor: 'transparent',
              }}
            >
              {BILLING_STATUS === 'ok' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              {billingColor[BILLING_STATUS].label}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)' }}>
              <span className="text-muted-foreground">Спосіб оплати</span>
              <span className="text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                •••• 4242
              </span>
            </div>
            <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)' }}>
              <span className="text-muted-foreground">Наступний платіж</span>
              <span className="text-foreground">
                {format(new Date(org.renewal_date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          {BILLING_STATUS !== 'ok' && isAdmin && (
            <Link
              to="/billing"
              className="mt-4 inline-flex items-center gap-1.5 bg-destructive text-destructive-foreground px-4 py-2 hover:bg-destructive/90 transition-colors"
              style={{
                borderRadius: 'var(--radius-button)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Вирішити проблему оплати <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </Card>
      </div>

      {/* ──── 4. Last Activity ──── */}
      <div>
        <SectionTitle>Остання активність</SectionTitle>
        <Card className="divide-y divide-border">
          {/* Last login */}
          <ActivityRow
            icon={<LogIn className="w-4 h-4" />}
            label="Останній вхід"
            value={
              lastLogin
                ? `${lastLogin.actor_name} — ${formatDistanceToNow(new Date(lastLogin.timestamp), { addSuffix: true })}`
                : undefined
            }
          />
          {/* Last settings change */}
          <ActivityRow
            icon={<Settings className="w-4 h-4" />}
            label="Остання зміна налаштувань"
            value={
              lastSettingsChange
                ? `${lastSettingsChange.summary} — ${formatDistanceToNow(new Date(lastSettingsChange.timestamp), { addSuffix: true })}`
                : undefined
            }
          />
          {/* Last keyword change */}
          <ActivityRow
            icon={<KeyRound className="w-4 h-4" />}
            label="Остання зміна ключових слів"
            value={
              lastKeywordChange
                ? `${lastKeywordChange.summary} — ${formatDistanceToNow(new Date(lastKeywordChange.timestamp), { addSuffix: true })}`
                : undefined
            }
            linkTo="/audit"
          />
        </Card>
      </div>

      {/* ──── 5. Quick Actions (admin only shown, user can navigate) ──── */}
      <div>
        <SectionTitle>Швидкі дії</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickAction
            to="/billing"
            icon={<CreditCard className="w-5 h-5" />}
            title={isAdmin ? 'Змінити план' : 'Переглянути білінг'}
            description={isAdmin ? 'Змінити або оновити вашу підписку' : 'Переглянути деталі білінгу та рахунки'}
          />
          <QuickAction
            to="/users"
            icon={<Users className="w-5 h-5" />}
            title={isAdmin ? 'Керувати місцями' : 'Переглянути користувачів'}
            description={isAdmin ? 'Запросити користувачів та керувати доступом' : 'Переглянути учасників організації'}
          />
          <QuickAction
            to="/limits"
            icon={<RefreshCw className="w-5 h-5" />}
            title="Дані та ліміти"
            description="Детальне використання ресурсів"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Activity Row ── */
function ActivityRow({
  icon,
  label,
  value,
  linkTo,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  linkTo?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 px-5 py-4">
      <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
          {label}
        </p>
        <p
          className="text-foreground mt-0.5 truncate"
          style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-normal)' }}
        >
          {value || 'Даних ще немає'}
        </p>
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-accent hover:underline shrink-0 self-center"
          style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
        >
          Журнал
        </Link>
      )}
    </div>
  );

  return content;
}

/* ── Quick Action Card ── */
function QuickAction({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="bg-card border border-border p-4 flex items-start gap-3 hover:border-accent/40 transition-colors group"
      style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
    >
      <div className="p-2 bg-accent/10 text-accent rounded-full shrink-0 group-hover:bg-accent/20 transition-colors">
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className="text-foreground group-hover:text-accent transition-colors"
          style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
        >
          {title}
        </p>
        <p className="text-muted-foreground mt-0.5" style={{ fontSize: 'var(--text-xs)' }}>
          {description}
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent shrink-0 mt-1 transition-colors" />
    </Link>
  );
}