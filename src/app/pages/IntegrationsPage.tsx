import { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router';
import {
  Plug,
  Unplug,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Clock,
  Search,
  ExternalLink,
  Key,
  Copy,
  Check,
  Trash2,
  ShieldAlert,
  MoreVertical,
  Plus,
  ArrowUpDown,
} from 'lucide-react';
import { format, formatDistanceToNow, subHours, subMinutes, subDays } from 'date-fns';
import svgPaths from '../../imports/svg-c0qqninfof';

/* ─── Types ─── */
type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'needs_reconnect';

interface Integration {
  id: string;
  name: string;
  handle: string;
  description: string;
  icon: string;
  type: string;
  status: IntegrationStatus;
  lastSyncAt?: string;
  connectedAt?: string;
  expiresAt?: string;
  errorMessage?: string;
  avatarUrl?: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'connected' | 'reconnected' | 'revoked' | 'error_detected' | 'api_token.created' | 'api_token.revoked';
  integrationName: string;
  actor: string;
}

interface OutletCtx {
  user: { role: string; full_name: string };
  org: { id: string; name: string };
}

/* ─── Mock data ─── */
const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'int_1',
    name: 'Kyiv Coffee Culture',
    handle: '@kyiv.coffee.culture',
    description: 'Track website traffic and user behavior metrics.',
    icon: '☕',
    type: 'Instagram',
    status: 'connected',
    lastSyncAt: subMinutes(new Date(), 12).toISOString(),
    connectedAt: '2025-11-20',
    expiresAt: '2026-11-20',
  },
  {
    id: 'int_2',
    name: 'Slack',
    handle: '@slack_workspace',
    description: 'Receive real-time notifications and alerts.',
    icon: '💬',
    type: 'Messaging',
    status: 'connected',
    lastSyncAt: subMinutes(new Date(), 3).toISOString(),
    connectedAt: '2025-11-20',
    expiresAt: '2026-11-20',
  },
  {
    id: 'int_3',
    name: 'Urban Style UA',
    handle: '@urban.style.ua',
    description: 'Import backlink data and domain ratings.',
    icon: '👗',
    type: 'Instagram',
    status: 'disconnected',
  },
  {
    id: 'int_4',
    name: 'Travel Ukraine',
    handle: '@travel_ukraine_blog',
    description: 'Monitor search performance and indexing.',
    icon: '✈️',
    type: 'Instagram',
    status: 'error',
    lastSyncAt: subHours(new Date(), 6).toISOString(),
    connectedAt: '2025-09-15',
    expiresAt: '2026-09-15',
    errorMessage: 'OAuth token expired.',
  },
  {
    id: 'int_5',
    name: 'Telegram',
    handle: '@telegram_bot',
    description: 'Get alerts via Telegram bot.',
    icon: '📱',
    type: 'Messaging',
    status: 'disconnected',
  },
  {
    id: 'int_6',
    name: 'Fitness Hub Lviv',
    handle: '@fitness.hub.lviv',
    description: 'Sync keyword rankings and competitive analysis.',
    icon: '💪',
    type: 'Instagram',
    status: 'needs_reconnect',
    lastSyncAt: subDays(new Date(), 3).toISOString(),
    connectedAt: '2025-06-01',
    expiresAt: '2026-06-01',
    errorMessage: 'API credentials changed.',
  },
];

const MAX_INTEGRATIONS = 10;

const INITIAL_AUDIT: AuditEntry[] = [
  { id: 'ia_1', timestamp: subMinutes(new Date(), 12).toISOString(), action: 'connected', integrationName: 'Kyiv Coffee Culture', actor: 'Alice Admin' },
  { id: 'ia_2', timestamp: subDays(new Date(), 1).toISOString(), action: 'error_detected', integrationName: 'Travel Ukraine', actor: 'System' },
  { id: 'ia_3', timestamp: subDays(new Date(), 3).toISOString(), action: 'reconnected', integrationName: 'Slack', actor: 'Alice Admin' },
];

/* ─── Status config ─── */
const STATUS_CONFIG: Record<IntegrationStatus, { label: string; dotClass: string; textClass: string }> = {
  connected: { label: 'Підключено', dotClass: 'bg-primary', textClass: 'text-primary' },
  disconnected: { label: 'Відключено', dotClass: 'bg-muted', textClass: 'text-muted-foreground' },
  error: { label: 'Помилка', dotClass: 'bg-destructive', textClass: 'text-destructive' },
  needs_reconnect: { label: 'Переєднати', dotClass: 'bg-chart-3', textClass: 'text-chart-3' },
};

const AUDIT_ACTION_LABELS: Record<string, { label: string; color: string }> = {
  connected: { label: 'Підключено', color: 'text-primary' },
  reconnected: { label: 'Переєднано', color: 'text-accent' },
  revoked: { label: 'Відключено', color: 'text-destructive' },
  error_detected: { label: 'Виявлено помилку', color: 'text-chart-3' },
  'api_token.created': { label: 'Токен створено', color: 'text-primary' },
  'api_token.revoked': { label: 'Токен відкликано', color: 'text-destructive' },
};

/* ─── API Token types ─── */
interface ApiToken {
  maskedValue: string;
  createdAt: string;
  createdBy: string;
  lastUsedAt?: string;
}

/* ─── Instagram icon from Figma ─── */
function InstagramIcon() {
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 0C8.74 0 8.33.01 7.05.07 5.78.12 4.9.3 4.14.57c-.79.28-1.47.71-2.12 1.37S.85 3.35.57 4.14C.3 4.9.12 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.05 1.27.23 2.15.5 2.91.28.79.71 1.47 1.37 2.12.65.66 1.33 1.09 2.12 1.37.76.27 1.64.45 2.91.5C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.05 2.15-.23 2.91-.5.79-.28 1.47-.71 2.12-1.37.66-.65 1.09-1.33 1.37-2.12.27-.76.45-1.64.5-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.05-1.27-.23-2.15-.5-2.91a5.89 5.89 0 0 0-1.37-2.12A5.89 5.89 0 0 0 19.86.57C19.1.3 18.22.12 16.95.07 15.67.01 15.26 0 12 0zm0 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07zM12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" fill="#E4405F" />
    </svg>
  );
}

/* ─── Check circle from Figma ─── */
function FigmaCheckCircle() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
      <path d={svgPaths.pfbfd380} fill="var(--color-primary, #00AF85)" />
    </svg>
  );
}

/* ══════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════ */
export function IntegrationsPage() {
  const { user } = useOutletContext<OutletCtx>();
  const isAdmin = user.role === 'Admin';

  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(INITIAL_AUDIT);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: 'connect' | 'reconnect' | 'revoke';
    integration: Integration;
  } | null>(null);

  /* ── API Token state ── */
  const [apiToken, setApiToken] = useState<ApiToken | null>(null);
  const [tokenCreateConfirm, setTokenCreateConfirm] = useState(false);
  const [tokenRevokeConfirm, setTokenRevokeConfirm] = useState(false);
  const [tokenResultModal, setTokenResultModal] = useState<string | null>(null);

  /* ── Sorting ── */
  const [sortField, setSortField] = useState<'name' | 'connectedAt'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  /* ── Derived ── */
  const connectedCount = integrations.filter((i) => i.status === 'connected').length;

  /* ── Filtered + sorted ── */
  const filtered = integrations
    .filter((i) => {
      if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.handle.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'All' && i.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      const aD = a.connectedAt ? new Date(a.connectedAt).getTime() : 0;
      const bD = b.connectedAt ? new Date(b.connectedAt).getTime() : 0;
      return sortDir === 'asc' ? aD - bD : bD - aD;
    });

  /* ── Audit helper ── */
  const addAudit = useCallback(
    (action: AuditEntry['action'], integrationName: string) => {
      setAuditLog((prev) => [
        { id: `ia_${Date.now()}`, timestamp: new Date().toISOString(), action, integrationName, actor: user.full_name },
        ...prev,
      ]);
    },
    [user.full_name]
  );

  /* ── Token actions ── */
  const handleCreateToken = useCallback(() => {
    const fullToken = `tok_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`;
    const masked = `****${fullToken.slice(-4).toUpperCase()}`;
    setApiToken({ maskedValue: masked, createdAt: new Date().toISOString(), createdBy: user.full_name });
    addAudit('api_token.created', 'API Token');
    setTokenCreateConfirm(false);
    setTokenResultModal(fullToken);
  }, [user.full_name, addAudit]);

  const handleRevokeToken = useCallback(() => {
    setApiToken(null);
    addAudit('api_token.revoked', 'API Token');
    setTokenRevokeConfirm(false);
  }, [addAudit]);

  /* ── Integration actions ── */
  const handleConfirm = useCallback(() => {
    if (!confirmModal) return;
    const { type, integration } = confirmModal;
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.id !== integration.id) return i;
        switch (type) {
          case 'connect':
            return { ...i, status: 'connected' as IntegrationStatus, connectedAt: format(new Date(), 'yyyy-MM-dd'), expiresAt: format(new Date(Date.now() + 365 * 86400000), 'yyyy-MM-dd'), lastSyncAt: new Date().toISOString(), errorMessage: undefined };
          case 'reconnect':
            return { ...i, status: 'connected' as IntegrationStatus, lastSyncAt: new Date().toISOString(), errorMessage: undefined };
          case 'revoke':
            return { ...i, status: 'disconnected' as IntegrationStatus, lastSyncAt: undefined, connectedAt: undefined, expiresAt: undefined, errorMessage: undefined };
          default:
            return i;
        }
      })
    );
    const auditAction = type === 'connect' ? 'connected' : type === 'reconnect' ? 'reconnected' : 'revoked';
    addAudit(auditAction, integration.name);
    setConfirmModal(null);
  }, [confirmModal, addAudit]);

  const toggleSort = (field: 'name' | 'connectedAt') => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  /* ── Progress bar for usage ── */
  const usagePct = Math.min((connectedCount / MAX_INTEGRATIONS) * 100, 100);

  return (
    <div className="space-y-6">
      {/* ──── Header row (Figma-style) ──── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2
              className="text-foreground"
              style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-normal)' }}
            >
              Інтеграції
            </h2>
            <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-normal)' }}>
              {connectedCount} інтеграцій /{MAX_INTEGRATIONS} доступних
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 w-full bg-border h-2 overflow-hidden" style={{ borderRadius: 'var(--radius)' }}>
            <div
              className="bg-primary h-full"
              style={{ width: `${usagePct}%`, borderRadius: 'var(--radius-button)', transition: 'width 0.3s ease' }}
            />
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => {}}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-1.5 flex items-center gap-2 transition-colors shrink-0 self-start sm:self-auto"
            style={{ borderRadius: 'var(--radius-button)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
          >
            Додати нову інтеграцію
          </button>
        )}
      </div>

      {/* ──── Filters ──── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Пошук інтеграцій…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['All', 'connected', 'disconnected', 'error', 'needs_reconnect'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 transition-colors border ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-secondary'
              }`}
              style={{ borderRadius: 'var(--radius-button)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
            >
              {s === 'All' ? 'Всі' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* ──── Table ──── */}
      <div
        className="bg-card border border-border overflow-hidden"
        style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr className="bg-secondary/30 border-b border-border">
                <ThCell className="w-16">
                  <button onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 hover:text-foreground">
                    № <ArrowUpDown className="w-3 h-3" />
                  </button>
                </ThCell>
                <ThCell>Сторінка</ThCell>
                <ThCell className="w-20">Тип</ThCell>
                <ThCell className="hidden md:table-cell w-32">
                  <button onClick={() => toggleSort('connectedAt')} className="inline-flex items-center gap-1 hover:text-foreground">
                    Підключено <ArrowUpDown className="w-3 h-3" />
                  </button>
                </ThCell>
                <ThCell className="hidden lg:table-cell w-32">Працює до</ThCell>
                <ThCell className="w-40">Статус</ThCell>
                <ThCell className="w-16 text-right">Дії</ThCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((intg, idx) => {
                const cfg = STATUS_CONFIG[intg.status];
                return (
                  <tr key={intg.id} className="hover:bg-secondary/10 transition-colors bg-card">
                    {/* № */}
                    <td className="px-6 py-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {idx + 1}
                    </td>

                    {/* Сторінка — avatar + name + handle */}
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-secondary"
                          style={{ fontSize: 'var(--text-lg)' }}
                        >
                          {intg.avatarUrl ? (
                            <img src={intg.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{intg.icon}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground truncate" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-normal)' }}>
                            {intg.name}
                          </p>
                          <p className="text-accent truncate" style={{ fontSize: '10px', fontWeight: 'var(--font-weight-medium)' }}>
                            {intg.handle}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Тип */}
                    <td className="px-2 py-3">
                      {intg.type === 'Instagram' ? (
                        <InstagramIcon />
                      ) : intg.type === 'Messaging' && intg.name === 'Slack' ? (
                        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
                          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
                          <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.527 2.527 0 0 1 2.521 2.521 2.527 2.527 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
                          <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.527 2.527 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.522-2.521V2.522A2.527 2.527 0 0 1 15.164 0a2.527 2.527 0 0 1 2.522 2.522v6.312z" fill="#2EB67D"/>
                          <path d="M15.164 18.956a2.528 2.528 0 0 1 2.522 2.522A2.528 2.528 0 0 1 15.164 24a2.527 2.527 0 0 1-2.522-2.522v-2.522h2.522zm0-1.27a2.527 2.527 0 0 1-2.522-2.522 2.527 2.527 0 0 1 2.522-2.522h6.314A2.528 2.528 0 0 1 24 15.164a2.528 2.528 0 0 1-2.522 2.522h-6.314z" fill="#ECB22E"/>
                        </svg>
                      ) : intg.type === 'Messaging' && intg.name === 'Telegram' ? (
                        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="12" fill="#229ED9"/>
                          <path d="M5.43 11.87l11.22-4.33c.52-.19.97.13.8.9l-1.91 9c-.14.64-.52.8-.86.6l-2.67-1.97-1.29 1.24c-.14.14-.26.26-.54.26l.19-2.72 4.95-4.47c.22-.19-.05-.3-.33-.11L8.38 14.4l-2.59-.81c-.56-.18-.57-.56.12-.83z" fill="white"/>
                        </svg>
                      ) : (
                        <InstagramIcon />
                      )}
                    </td>

                    {/* Підключено */}
                    <td className="px-2 py-3 hidden md:table-cell text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-normal)' }}>
                      {intg.connectedAt ? format(new Date(intg.connectedAt), 'dd.MM.yyyy') : '—'}
                    </td>

                    {/* Працює до */}
                    <td className="px-2 py-3 hidden lg:table-cell text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-normal)' }}>
                      {intg.expiresAt ? format(new Date(intg.expiresAt), 'dd.MM.yyyy') : '—'}
                    </td>

                    {/* Статус */}
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        {intg.status === 'connected' ? (
                          <FigmaCheckCircle />
                        ) : intg.status === 'error' ? (
                          <XCircle className="w-5 h-5 text-destructive" />
                        ) : intg.status === 'needs_reconnect' ? (
                          <AlertTriangle className="w-5 h-5 text-chart-3" />
                        ) : (
                          <Unplug className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className={cfg.textClass} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-normal)' }}>
                          {cfg.label}
                        </span>
                      </div>
                    </td>

                    {/* Дії */}
                    <td className="px-6 py-3 text-right relative">
                      <button
                        disabled={!isAdmin}
                        onClick={() => setOpenMenu(openMenu === intg.id ? null : intg.id)}
                        className="p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ borderRadius: 'var(--radius)' }}
                        title={!isAdmin ? 'Only admins can manage integrations' : undefined}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {openMenu === intg.id && isAdmin && (
                        <div
                          className="absolute right-6 top-full mt-1 bg-popover border border-border py-1 z-20 min-w-[160px]"
                          style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
                        >
                          {intg.status === 'disconnected' && (
                            <MenuBtn
                              icon={<Plug className="w-3.5 h-3.5" />}
                              label="Підключити"
                              onClick={() => { setConfirmModal({ type: 'connect', integration: intg }); setOpenMenu(null); }}
                            />
                          )}
                          {(intg.status === 'error' || intg.status === 'needs_reconnect') && (
                            <MenuBtn
                              icon={<RefreshCw className="w-3.5 h-3.5" />}
                              label="Переєднати"
                              onClick={() => { setConfirmModal({ type: 'reconnect', integration: intg }); setOpenMenu(null); }}
                            />
                          )}
                          {intg.status !== 'disconnected' && (
                            <>
                              <div className="border-t border-border my-1" />
                              <MenuBtn
                                icon={<Unplug className="w-3.5 h-3.5" />}
                                label="Відключити"
                                destructive
                                onClick={() => { setConfirmModal({ type: 'revoke', integration: intg }); setOpenMenu(null); }}
                              />
                            </>
                          )}
                          <MenuBtn
                            icon={<ExternalLink className="w-3.5 h-3.5" />}
                            label="Документація"
                            onClick={() => setOpenMenu(null)}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            Інтеграцій не знайдено.
          </div>
        )}

        {/* Info text under table (Figma) */}
        <div className="px-6 py-6 text-center border-t border-border">
          <p className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-normal)' }}>
            Інтеграції дозволяють збирати аналітику, керувати кількома сторінками та працювати з контентом у хабі.
          </p>
          <p className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-normal)' }}>
            Після підключення ви зможете бачити розширені метрики, планувати публікації та отримувати статуси постів.
          </p>
        </div>
      </div>

      {/* ──── API Token Section ──── */}
      <ApiTokenSection
        token={apiToken}
        isAdmin={isAdmin}
        onCreateClick={() => setTokenCreateConfirm(true)}
        onRevokeClick={() => setTokenRevokeConfirm(true)}
      />

      {/* ──── Recent Activity ──── */}
      <div>
        <h3
          className="text-foreground mb-4"
          style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
        >
          Остання активність
        </h3>
        <div
          className="bg-card border border-border divide-y divide-border"
          style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
        >
          {auditLog.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              Немає активності.
            </div>
          ) : (
            auditLog.slice(0, 8).map((entry) => {
              const actionCfg = AUDIT_ACTION_LABELS[entry.action];
              return (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                  <span className={`shrink-0 ${actionCfg.color}`} style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                    {actionCfg.label}
                  </span>
                  <span className="text-foreground truncate" style={{ fontSize: 'var(--text-sm)' }}>
                    {entry.integrationName}
                  </span>
                  <span className="text-muted-foreground ml-auto shrink-0" style={{ fontSize: 'var(--text-xs)' }}>
                    {entry.actor} · {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ════════════════ Modals ════════════════ */}

      {confirmModal && (
        <ConfirmModal type={confirmModal.type} integration={confirmModal.integration} onConfirm={handleConfirm} onCancel={() => setConfirmModal(null)} />
      )}

      {tokenCreateConfirm && (
        <ModalOverlay onClose={() => setTokenCreateConfirm(false)}>
          <ModalCard>
            <ModalHeader title="Створити API токен" onClose={() => setTokenCreateConfirm(false)} />
            <p className="text-muted-foreground mb-5" style={{ fontSize: 'var(--text-sm)' }}>
              Буде згенеровано новий API токен для вашої організації. Повний токен можна побачити лише один раз — обов'язково збережіть його.
            </p>
            <div className="flex justify-end gap-2">
              <SecondaryBtn onClick={() => setTokenCreateConfirm(false)}>Скасувати</SecondaryBtn>
              <PrimaryBtn onClick={handleCreateToken} icon={<Key className="w-4 h-4" />}>Створити токен</PrimaryBtn>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}

      {tokenRevokeConfirm && (
        <ModalOverlay onClose={() => setTokenRevokeConfirm(false)}>
          <ModalCard>
            <ModalHeader title="Відкликати API токен" onClose={() => setTokenRevokeConfirm(false)} />
            <p className="text-muted-foreground mb-5" style={{ fontSize: 'var(--text-sm)' }}>
              Це негайно анулює поточний API токен. Будь-які сервіси, що використовують цей токен, перестануть працювати.
            </p>
            <div className="flex justify-end gap-2">
              <SecondaryBtn onClick={() => setTokenRevokeConfirm(false)}>Скасувати</SecondaryBtn>
              <DestructiveBtn onClick={handleRevokeToken} icon={<Trash2 className="w-4 h-4" />}>Відкликати</DestructiveBtn>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}

      {tokenResultModal && <TokenResultModal token={tokenResultModal} onClose={() => setTokenResultModal(null)} />}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════ */

function ThCell({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`text-left px-2 py-3 text-muted-foreground first:pl-6 last:pr-6 ${className}`} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
      {children}
    </th>
  );
}

function MenuBtn({ icon, label, onClick, destructive }: { icon: React.ReactNode; label: string; onClick: () => void; destructive?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 flex items-center gap-2 transition-colors ${destructive ? 'text-destructive hover:bg-destructive/10' : 'text-popover-foreground hover:bg-secondary'}`}
      style={{ fontSize: 'var(--text-sm)' }}
    >
      {icon} {label}
    </button>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function ModalCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border w-full max-w-sm p-6" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}>
      {children}
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>{title}</h3>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>
    </div>
  );
}

function SecondaryBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="border border-border bg-card text-foreground hover:bg-secondary px-4 py-2 transition-colors" style={{ borderRadius: 'var(--radius-button)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
      {children}
    </button>
  );
}

function PrimaryBtn({ onClick, children, icon }: { onClick: () => void; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <button onClick={onClick} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 flex items-center gap-2 transition-colors" style={{ borderRadius: 'var(--radius-button)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
      {icon}{children}
    </button>
  );
}

function DestructiveBtn({ onClick, children, icon }: { onClick: () => void; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <button onClick={onClick} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 flex items-center gap-2 transition-colors" style={{ borderRadius: 'var(--radius-button)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
      {icon}{children}
    </button>
  );
}

function ConfirmModal({ type, integration, onConfirm, onCancel }: { type: 'connect' | 'reconnect' | 'revoke'; integration: Integration; onConfirm: () => void; onCancel: () => void }) {
  const config: Record<string, { title: string; description: string; confirmLabel: string; destructive: boolean }> = {
    connect: { title: `Підключити ${integration.name}`, description: `Це дозволить ${integration.name} синхронізувати дані з вашою організацією. Ви можете відключити доступ у будь-який момент.`, confirmLabel: 'Підключити', destructive: false },
    reconnect: { title: `Переєднати ${integration.name}`, description: `Це повторно авторизує ${integration.name} і спробує відновити синхронізацію даних.`, confirmLabel: 'Переєднати', destructive: false },
    revoke: { title: `Відключити ${integration.name}`, description: `Це відключить ${integration.name} і зупинить синхронізацію даних. Ви можете підключити повторно пізніше.`, confirmLabel: 'Відключити', destructive: true },
  };
  const c = config[type];
  return (
    <ModalOverlay onClose={onCancel}>
      <ModalCard>
        <ModalHeader title={c.title} onClose={onCancel} />
        <p className="text-muted-foreground mb-5" style={{ fontSize: 'var(--text-sm)' }}>{c.description}</p>
        <div className="flex justify-end gap-2">
          <SecondaryBtn onClick={onCancel}>Скасувати</SecondaryBtn>
          {c.destructive ? (
            <DestructiveBtn onClick={onConfirm}>{c.confirmLabel}</DestructiveBtn>
          ) : (
            <PrimaryBtn onClick={onConfirm}>{c.confirmLabel}</PrimaryBtn>
          )}
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}

/* ── API Token Section ── */
function ApiTokenSection({ token, isAdmin, onCreateClick, onRevokeClick }: { token: ApiToken | null; isAdmin: boolean; onCreateClick: () => void; onRevokeClick: () => void }) {
  return (
    <div>
      <h3 className="text-foreground mb-4" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
        API Token
      </h3>
      <div className="bg-card border border-border p-5 flex flex-col gap-4" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 text-accent rounded-full"><Key className="w-5 h-5" /></div>
          <div>
            <p className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
              Organization API Token
            </p>
            <span className={`inline-flex items-center gap-1.5 ${token ? 'text-primary' : 'text-muted-foreground'}`} style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${token ? 'bg-primary' : 'bg-muted'}`} />
              {token ? 'Активний' : 'Немає токена'}
            </span>
          </div>
        </div>

        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
          Використовуйте цей токен для автентифікації API-запитів до вашої організації.
        </p>

        {token && (
          <>
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50" style={{ borderRadius: 'var(--radius)' }}>
              <Key className="w-4 h-4 text-foreground shrink-0" />
              <span className="text-foreground tracking-widest" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', fontFamily: "'Roboto', monospace" }}>
                {token.maskedValue}
              </span>
            </div>
            <div className="space-y-1.5" style={{ fontSize: 'var(--text-xs)' }}>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Створив</span>
                <span className="text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>{token.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Створено</span>
                <span className="text-foreground">{format(new Date(token.createdAt), 'MMM d, yyyy · HH:mm')}</span>
              </div>
              {token.lastUsedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Востаннє використано</span>
                  <span className="text-foreground">{formatDistanceToNow(new Date(token.lastUsedAt), { addSuffix: true })}</span>
                </div>
              )}
            </div>
          </>
        )}

        {!token && !isAdmin && (
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50" style={{ borderRadius: 'var(--radius)' }}>
            <ShieldAlert className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>API токен не створено. Зверніться до адміністратора.</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1 border-t border-border mt-auto">
          {!token && (
            <button
              onClick={onCreateClick}
              disabled={!isAdmin}
              title={!isAdmin ? 'Тільки адміністратори можуть керувати API токенами' : undefined}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderRadius: 'var(--radius-button)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <Key className="w-3.5 h-3.5" /> Створити токен
            </button>
          )}
          {token && (
            <button
              onClick={onRevokeClick}
              disabled={!isAdmin}
              title={!isAdmin ? 'Тільки адміністратори можуть керувати API токенами' : undefined}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderRadius: 'var(--radius-button)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Відкликати токен
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Token Result Modal ── */
function TokenResultModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(token); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <ModalOverlay onClose={() => {}}>
      <div className="bg-card border border-border w-full max-w-md p-6" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}>
        <h3 className="text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>API токен створено</h3>

        <div className="flex items-start gap-2 px-3 py-2.5 bg-chart-3/10 border border-chart-3/30 mb-4" style={{ borderRadius: 'var(--radius)' }}>
          <AlertTriangle className="w-4 h-4 text-chart-3 shrink-0 mt-0.5" />
          <span className="text-foreground" style={{ fontSize: 'var(--text-xs)' }}>Збережіть цей токен зараз. Він більше не буде показаний після закриття цього вікна.</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary/50 border border-border" style={{ borderRadius: 'var(--radius)' }}>
          <Key className="w-4 h-4 text-foreground shrink-0" />
          <code className="text-foreground flex-1 break-all" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>{token}</code>
          <button onClick={handleCopy} className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors" title="Копіювати">
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {copied && <p className="text-primary mt-2" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>Скопійовано</p>}

        <div className="flex justify-end mt-5">
          <PrimaryBtn onClick={onClose}>Токен збережено</PrimaryBtn>
        </div>
      </div>
    </ModalOverlay>
  );
}