import { useMemo, useState } from 'react';
import { Download, Calendar, ChevronDown, ArrowDownUp, LogIn, Settings, KeyRound, ShieldAlert, Database } from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '../data/mock';
import { format, subDays } from 'date-fns';
import { uk } from 'date-fns/locale';

/* ── Constants ── */
const ALL_LABEL = 'Всі';

/* ── Category icon map (reuses icons from AccountOverview Last Activity) ── */
const CATEGORY_ICON: Record<string, React.ReactNode> = {
  'Вхід': <LogIn className="w-4 h-4" />,
  'Події безпеки': <ShieldAlert className="w-4 h-4" />,
  'Налаштування': <Settings className="w-4 h-4" />,
  'Дані': <Database className="w-4 h-4" />,
};

/* ── Helper: generate initials with color ── */
function getInitialsColor(name: string) {
  const colors = [
    { bg: '#E91E63', fg: '#fff' },
    { bg: '#9C27B0', fg: '#fff' },
    { bg: '#3F51B5', fg: '#fff' },
    { bg: '#009688', fg: '#fff' },
    { bg: '#FF9800', fg: '#fff' },
    { bg: '#4CAF50', fg: '#fff' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/* ── Filter Dropdown ── */
function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border hover:border-accent/40 transition-colors cursor-pointer"
        style={{
          borderRadius: 'var(--radius)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-weight-medium)',
          fontFamily: "'Roboto', sans-serif",
          color: 'var(--foreground)',
        }}
      >
        <span className="text-muted-foreground" style={{ fontWeight: 'var(--font-weight-normal)' }}>
          {label}
        </span>
        <span>{value}</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1 z-50 bg-card border border-border py-1 min-w-[140px]"
            style={{
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--elevation-md)',
            }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-secondary/40 transition-colors cursor-pointer ${
                  opt === value ? 'bg-accent/10 text-accent' : 'text-foreground'
                }`}
                style={{
                  fontSize: 'var(--text-xs)',
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Sort direction type ── */
type SortDir = 'desc' | 'asc';

/* ── Main Page ── */
export function AuditLogPage() {
  /* Filters */
  const [categoryFilter, setCategoryFilter] = useState(ALL_LABEL);
  const [eventFilter, setEventFilter] = useState(ALL_LABEL);
  const [actorFilter, setActorFilter] = useState(ALL_LABEL);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  /* Date range (last 30 days for demo) */
  const dateFrom = subDays(new Date(), 30);
  const dateTo = new Date();

  /* Derive unique filter options */
  const categories = useMemo(
    () => [ALL_LABEL, ...Array.from(new Set(MOCK_AUDIT_LOGS.map((e) => e.category)))],
    []
  );
  const events = useMemo(
    () => [ALL_LABEL, ...Array.from(new Set(MOCK_AUDIT_LOGS.map((e) => e.action_type)))],
    []
  );
  const actors = useMemo(
    () => [ALL_LABEL, ...Array.from(new Set(MOCK_AUDIT_LOGS.map((e) => e.actor_name)))],
    []
  );

  /* Filter + sort */
  const filtered = useMemo(() => {
    let list = [...MOCK_AUDIT_LOGS];

    if (categoryFilter !== ALL_LABEL) {
      list = list.filter((e) => e.category === categoryFilter);
    }
    if (eventFilter !== ALL_LABEL) {
      list = list.filter((e) => e.action_type === eventFilter);
    }
    if (actorFilter !== ALL_LABEL) {
      list = list.filter((e) => e.actor_name === actorFilter);
    }

    list.sort((a, b) => {
      const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return sortDir === 'desc' ? -diff : diff;
    });

    return list;
  }, [categoryFilter, eventFilter, actorFilter, sortDir]);

  return (
    <div className="space-y-5" style={{ fontFamily: "'Roboto', sans-serif" }}>
      {/* ── Header row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2
          className="text-foreground"
          style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}
        >
          Аудит
        </h2>

        <div className="flex items-center gap-3">
          {/* Date range badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-card border border-border"
            style={{
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-xs)',
              color: 'var(--foreground)',
            }}
          >
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>
              {format(dateFrom, 'yyyy-MM-dd')} - {format(dateTo, 'yyyy-MM-dd')}
            </span>
          </div>

          {/* Export button */}
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border hover:border-accent/40 transition-colors cursor-pointer"
            style={{
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--foreground)',
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Експорт
          </button>
        </div>
      </div>

      {/* ── Filters row ── */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Категорія"
          value={categoryFilter}
          options={categories}
          onChange={setCategoryFilter}
        />
        <FilterDropdown
          label="Подія"
          value={eventFilter}
          options={events}
          onChange={setEventFilter}
        />
        <FilterDropdown
          label="Хто виконав"
          value={actorFilter}
          options={actors}
          onChange={setActorFilter}
        />
      </div>

      {/* ── Table ── */}
      <div
        className="bg-card border border-border overflow-hidden"
        style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
      >
        {/* Table header */}
        <div
          className="grid items-center px-5 py-3 border-b border-border"
          style={{
            gridTemplateColumns: '1fr 1.4fr 1.2fr 1.5fr',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span>Категорія</span>
          <span>Подія</span>
          <button
            className="inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--muted-foreground)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: "'Roboto', sans-serif",
            }}
            onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
          >
            Дата зміни
            <ArrowDownUp className="w-3 h-3" />
          </button>
          <span>Хто виконав</span>
        </div>

        {/* Table body */}
        <div className="divide-y divide-border">
          {filtered.map((evt) => {
            const initials = getInitials(evt.actor_name);
            const avatarColor = getInitialsColor(evt.actor_name);

            return (
              <div
                key={evt.id}
                className="grid items-center px-5 py-3.5 hover:bg-secondary/10 transition-colors"
                style={{
                  gridTemplateColumns: '1fr 1.4fr 1.2fr 1.5fr',
                }}
              >
                {/* Category */}
                <span
                  className="text-foreground inline-flex items-center gap-2"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-normal)',
                  }}
                >
                  <span className="text-muted-foreground shrink-0">
                    {CATEGORY_ICON[evt.category] ?? <KeyRound className="w-4 h-4" />}
                  </span>
                  {evt.category}
                </span>

                {/* Event / action */}
                <span
                  className="text-foreground"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-normal)',
                  }}
                >
                  {evt.action_type}
                </span>

                {/* Date */}
                <span
                  className="text-foreground"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-normal)',
                  }}
                >
                  {format(new Date(evt.timestamp), 'd LLL, yyyy HH:mm', { locale: uk })}
                </span>

                {/* Actor */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: avatarColor.bg,
                      color: avatarColor.fg,
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-bold)',
                    }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <p
                      className="text-foreground truncate"
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        lineHeight: '1.3',
                      }}
                    >
                      {evt.actor_name}
                    </p>
                    <p
                      className="text-muted-foreground truncate"
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-weight-normal)',
                        lineHeight: '1.3',
                      }}
                    >
                      {evt.actor_email}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div
              className="py-16 text-center text-muted-foreground"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Немає подій за обраними фільтрами.
            </div>
          )}
        </div>
      </div>

      {/* ── Footer info ── */}
      <div className="flex items-center justify-between">
        <span
          className="text-muted-foreground"
          style={{ fontSize: 'var(--text-xs)' }}
        >
          Показано {filtered.length} з {MOCK_AUDIT_LOGS.length} записів
        </span>
        <span
          className="text-muted-foreground"
          style={{ fontSize: 'var(--text-xs)' }}
        >
          Зберігання: 180 днів
        </span>
      </div>
    </div>
  );
}