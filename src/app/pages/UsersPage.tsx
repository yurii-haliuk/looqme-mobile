import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router';
import {
  Search,
  UserPlus,
  MoreVertical,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Mail,
  Download,
  ArrowUpDown,
  X,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { MOCK_USERS } from '../data/mock';
import type { User, UserRole, UserStatus, Organization } from '../data/mock';
import { format, formatDistanceToNow } from 'date-fns';

/* ─── Outlet context ─── */
interface OutletCtx {
  user: { role: string; full_name: string };
  org: Organization;
}

/* ─── Sort config ─── */
type SortField = 'last_seen';
type SortDir = 'asc' | 'desc';

/* ─── Badge style maps ─── */
const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-primary/10 text-primary border-primary/20',
  Invited: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  Suspended: 'bg-destructive/10 text-destructive border-destructive/20',
  Removed: 'bg-muted/20 text-muted-foreground border-border',
};
const STATUS_DOT: Record<string, string> = {
  Active: 'bg-primary',
  Invited: 'bg-chart-3',
  Suspended: 'bg-destructive',
  Removed: 'bg-muted',
};
const ROLE_STYLES: Record<string, string> = {
  Admin: 'bg-accent/10 text-accent border-accent/20',
  User: 'bg-secondary text-secondary-foreground border-border',
};

/* ═══════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════ */
export function UsersPage() {
  const { user: currentUser, org } = useOutletContext<OutletCtx>();
  const isAdmin = currentUser.role === 'Admin';

  /* ── Local user state (mutable copy for actions) ── */
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  /* ── Filters ── */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [tfaFilter, setTfaFilter] = useState<string>('All');

  /* ── Sort ── */
  const [sortField, setSortField] = useState<SortField>('last_seen');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  /* ── Menus / Modals ── */
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    type: 'suspend' | 'remove' | 'revoke' | 'reactivate';
    userId: string;
  } | null>(null);

  /* ── Invite form ── */
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('User');
  const [inviteName, setInviteName] = useState('');
  const [inviteError, setInviteError] = useState('');

  /* ── Close context menu on outside click ── */
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    if (openMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu]);

  /* ── Derived counts ── */
  const activeCount = users.filter((u) => u.status === 'Active').length;
  const seatsUsed = activeCount;
  const seatsTotal = org.seats.total;
  const seatsFull = seatsUsed >= seatsTotal;
  const adminCount = users.filter((u) => u.role === 'Admin' && u.status !== 'Removed').length;

  /* ── Filtered + sorted list ── */
  const filtered = useMemo(() => {
    let list = users.filter((u) => u.status !== 'Removed');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') list = list.filter((u) => u.status === statusFilter);
    if (roleFilter !== 'All') list = list.filter((u) => u.role === roleFilter);
    if (tfaFilter !== 'All') {
      const want = tfaFilter === 'On';
      list = list.filter((u) => u.two_fa_enabled === want);
    }

    list = [...list].sort((a, b) => {
      const aDate = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
      const bDate = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
      return sortDir === 'asc' ? aDate - bDate : bDate - aDate;
    });

    return list;
  }, [users, search, statusFilter, roleFilter, tfaFilter, sortField, sortDir]);

  /* ── Actions ── */
  const handleInvite = useCallback(() => {
    if (!inviteEmail.trim()) {
      setInviteError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setInviteError('Invalid email');
      return;
    }
    if (users.some((u) => u.email === inviteEmail && u.status !== 'Removed')) {
      setInviteError('User already exists');
      return;
    }
    const newUser: User = {
      id: `u_${Date.now()}`,
      email: inviteEmail.trim(),
      full_name: inviteName.trim() || inviteEmail.split('@')[0],
      role: inviteRole,
      status: 'Invited',
      invited_at: new Date().toISOString(),
      two_fa_enabled: false,
    };
    setUsers((prev) => [...prev, newUser]);
    setInviteOpen(false);
    setInviteEmail('');
    setInviteName('');
    setInviteRole('User');
    setInviteError('');
  }, [inviteEmail, inviteRole, inviteName, users]);

  const handleChangeRole = useCallback(
    (userId: string) => {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          if (u.role === 'Admin' && adminCount <= 1) return u; // protect last admin
          return { ...u, role: u.role === 'Admin' ? 'User' : 'Admin' } as User;
        })
      );
      setOpenMenu(null);
    },
    [adminCount]
  );

  const handleConfirmAction = useCallback(() => {
    if (!confirmModal) return;
    const { type, userId } = confirmModal;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        switch (type) {
          case 'suspend':
            if (u.role === 'Admin' && adminCount <= 1) return u;
            return { ...u, status: 'Suspended' as UserStatus, suspended_at: new Date().toISOString() };
          case 'reactivate':
            if (seatsFull) return u;
            return { ...u, status: 'Active' as UserStatus, suspended_at: undefined };
          case 'remove':
            if (u.role === 'Admin' && adminCount <= 1) return u;
            return { ...u, status: 'Removed' as UserStatus };
          case 'revoke':
            return { ...u, status: 'Removed' as UserStatus };
          default:
            return u;
        }
      })
    );
    setConfirmModal(null);
    setOpenMenu(null);
  }, [confirmModal, adminCount, seatsFull]);

  /* ── CSV Export (respects filters) ── */
  const handleExport = useCallback(() => {
    const header = ['Name', 'Email', 'Role', 'Status', '2FA', 'Last Seen'];
    const rows = filtered.map((u) => [
      u.full_name,
      u.email,
      u.role,
      u.status,
      u.two_fa_enabled ? 'Yes' : 'No',
      u.last_seen_at ? format(new Date(u.last_seen_at), 'yyyy-MM-dd HH:mm') : '',
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  /* ── Sort toggle ── */
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  /* ── Can protect last admin? ── */
  const isLastAdmin = (u: User) => u.role === 'Admin' && adminCount <= 1;

  return (
    <div className="space-y-6">
      {/* ──── Header ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2
            className="text-foreground"
            style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}
          >
            Користувачі
          </h2>
          <p className="text-muted-foreground mt-0.5" style={{ fontSize: 'var(--text-sm)' }}>
            {seatsUsed} / {seatsTotal} місць зайнято · {users.filter((u) => u.status !== 'Removed').length} всього
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          {/* Export — all roles */}
          <button
            onClick={handleExport}
            className="border border-border bg-card text-foreground hover:bg-secondary px-3 py-2 flex items-center gap-1.5 transition-colors"
            style={{
              borderRadius: 'var(--radius-button)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            <Download className="w-4 h-4" />
            Експорт
          </button>

          {/* Invite — admin only */}
          {isAdmin ? (
            <button
              onClick={() => (seatsFull ? setUpsellOpen(true) : setInviteOpen(true))}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 flex items-center gap-2 transition-colors"
              style={{
                borderRadius: 'var(--radius-button)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              <UserPlus className="w-4 h-4" />
              Запросити
            </button>
          ) : (
            <span className="text-muted-foreground italic" style={{ fontSize: 'var(--text-sm)' }}>
              Тільки адміністратори можуть запрошувати
            </span>
          )}
        </div>
      </div>

      {/* ──── Seats warning ──── */}
      {seatsFull && (
        <div
          className="flex items-center gap-3 bg-chart-3/10 border border-chart-3/30 px-4 py-3"
          style={{ borderRadius: 'var(--radius-card)' }}
        >
          <AlertTriangle className="w-4 h-4 text-chart-3 shrink-0" />
          <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            Всі місця зайняті ({seatsUsed}/{seatsTotal}). Оновіть план, щоб додати більше користувачів.
          </span>
          {isAdmin && (
            <Link
              to="/billing"
              className="ml-auto text-accent hover:underline shrink-0 flex items-center gap-1"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Оновити <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* ──── Table Card ──── */}
      <div
        className="bg-card border border-border overflow-hidden"
        style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
      >
        {/* Filters bar */}
        <div className="p-4 border-b border-border flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Пошук за ім'ям або email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
            />
          </div>

          {/* Status chips */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Active', 'Invited', 'Suspended'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 transition-colors border ${
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                }`}
                style={{
                  borderRadius: 'var(--radius-button)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {s === 'All' ? 'Всі' : s === 'Active' ? 'Активні' : s === 'Invited' ? 'Запрошені' : 'Призупинені'}
              </button>
            ))}
          </div>

          {/* Role filter */}
          <FilterDropdown
            label="Роль"
            value={roleFilter}
            options={['All', 'Admin', 'User']}
            onChange={setRoleFilter}
          />

          {/* 2FA filter */}
          <FilterDropdown
            label="2FA"
            value={tfaFilter}
            options={['All', 'On', 'Off']}
            onChange={setTfaFilter}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <ThCell>User</ThCell>
                <ThCell>Role</ThCell>
                <ThCell>Status</ThCell>
                <ThCell className="hidden md:table-cell">2FA</ThCell>
                <ThCell className="hidden lg:table-cell">
                  <button
                    onClick={() => toggleSort('last_seen')}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    Востаннє
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </ThCell>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border" ref={menuRef}>
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/10 transition-colors">
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0"
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        {u.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p
                          className="text-foreground"
                          style={{ fontWeight: 'var(--font-weight-medium)' }}
                        >
                          {u.full_name}
                        </p>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Role */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 border ${ROLE_STYLES[u.role]}`}
                      style={{
                        borderRadius: 'var(--radius-button)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${STATUS_STYLES[u.status]}`}
                      style={{
                        borderRadius: 'var(--radius-button)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[u.status]}`} />
                      {u.status}
                    </span>
                  </td>
                  {/* 2FA */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {u.two_fa_enabled ? (
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    ) : (
                      <ShieldOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </td>
                  {/* Last Seen */}
                  <td
                    className="px-4 py-3 text-muted-foreground hidden lg:table-cell"
                    style={{ fontSize: 'var(--text-xs)' }}
                  >
                    {u.last_seen_at
                      ? formatDistanceToNow(new Date(u.last_seen_at), { addSuffix: true })
                      : '—'}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3 text-right relative">
                    <button
                      disabled={!isAdmin}
                      onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                      className="p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenu === u.id && isAdmin && (
                      <div
                        className="absolute right-4 top-full mt-1 bg-popover border border-border py-1 z-20 min-w-[160px]"
                        style={{
                          borderRadius: 'var(--radius-card)',
                          boxShadow: 'var(--elevation-sm)',
                        }}
                      >
                        {/* Change role */}
                        <MenuButton
                          onClick={() => handleChangeRole(u.id)}
                          disabled={isLastAdmin(u)}
                          icon={u.role === 'Admin' ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                          label={u.role === 'Admin' ? 'Змінити на User' : 'Змінити на Admin'}
                          tooltip={isLastAdmin(u) ? 'Не можна змінити останнього адміна' : undefined}
                        />

                        {/* Resend / Revoke for Invited */}
                        {u.status === 'Invited' && (
                          <>
                            <MenuButton
                              onClick={() => { setOpenMenu(null); }}
                              icon={<Mail className="w-3.5 h-3.5" />}
                              label="Надіслати повторно"
                            />
                            <MenuButton
                              onClick={() => { setConfirmModal({ type: 'revoke', userId: u.id }); setOpenMenu(null); }}
                              icon={<X className="w-3.5 h-3.5" />}
                              label="Скасувати запрошення"
                              destructive
                            />
                          </>
                        )}

                        {/* Suspend for Active */}
                        {u.status === 'Active' && (
                          <MenuButton
                            onClick={() => { setConfirmModal({ type: 'suspend', userId: u.id }); setOpenMenu(null); }}
                            disabled={isLastAdmin(u)}
                            icon={<ShieldOff className="w-3.5 h-3.5" />}
                            label="Призупинити"
                            tooltip={isLastAdmin(u) ? 'Не можна призупинити останнього адміна' : undefined}
                          />
                        )}

                        {/* Reactivate for Suspended */}
                        {u.status === 'Suspended' && (
                          <MenuButton
                            onClick={() => {
                              if (seatsFull) {
                                setUpsellOpen(true);
                                setOpenMenu(null);
                              } else {
                                setConfirmModal({ type: 'reactivate', userId: u.id });
                                setOpenMenu(null);
                              }
                            }}
                            icon={<RefreshCw className="w-3.5 h-3.5" />}
                            label="Відновити"
                          />
                        )}

                        {/* Remove */}
                        <div className="border-t border-border my-1" />
                        <MenuButton
                          onClick={() => { setConfirmModal({ type: 'remove', userId: u.id }); setOpenMenu(null); }}
                          disabled={isLastAdmin(u)}
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          label="Видалити"
                          destructive
                          tooltip={isLastAdmin(u) ? 'Не можна видалити останнього адміна' : undefined}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div
            className="py-12 text-center text-muted-foreground"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Користувачів за обраними фільтрами не знайдено.
          </div>
        )}
      </div>

      {/* ════════════════ Modals ════════════════ */}

      {/* ── Invite Modal ── */}
      {inviteOpen && (
        <ModalOverlay onClose={() => setInviteOpen(false)}>
          <div
            className="bg-card border border-border w-full max-w-md p-6"
            style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                className="text-foreground"
                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Запросити користувача
              </h3>
              <button
                onClick={() => setInviteOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label
                  className="text-foreground mb-1 block"
                  style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                />
              </div>

              {/* Role */}
              <div>
                <label
                  className="text-foreground mb-1 block"
                  style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Роль <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  {(['User', 'Admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setInviteRole(r)}
                      className={`flex-1 px-3 py-2 border transition-colors ${
                        inviteRole === r
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                      }`}
                      style={{
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name (optional) */}
              <div>
                <label
                  className="text-muted-foreground mb-1 block"
                  style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-normal)' }}
                >
                  Повне ім'я (необов'язково)
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2 bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                />
              </div>

              {inviteError && (
                <p className="text-destructive" style={{ fontSize: 'var(--text-xs)' }}>
                  {inviteError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setInviteOpen(false)}
                className="border border-border bg-card text-foreground hover:bg-secondary px-4 py-2 transition-colors"
                style={{
                  borderRadius: 'var(--radius-button)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Скасувати
              </button>
              <button
                onClick={handleInvite}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 flex items-center gap-2 transition-colors"
                style={{
                  borderRadius: 'var(--radius-button)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                <Mail className="w-4 h-4" />
                Надіслати запрошення
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── Upsell Modal ── */}
      {upsellOpen && (
        <ModalOverlay onClose={() => setUpsellOpen(false)}>
          <div
            className="bg-card border border-border w-full max-w-sm p-6 text-center"
            style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
          >
            <div className="mx-auto mb-4 w-12 h-12 bg-chart-3/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-chart-3" />
            </div>
            <h3
              className="text-foreground mb-2"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Ліміт місць вичерпано
            </h3>
            <p className="text-muted-foreground mb-5" style={{ fontSize: 'var(--text-sm)' }}>
              Ви використали всі {seatsTotal} місць. Оновіть план, щоб запросити більше користувачів.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setUpsellOpen(false)}
                className="border border-border bg-card text-foreground hover:bg-secondary px-4 py-2 transition-colors"
                style={{
                  borderRadius: 'var(--radius-button)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Закрити
              </button>
              <Link
                to="/billing"
                onClick={() => setUpsellOpen(false)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 flex items-center gap-2 transition-colors"
                style={{
                  borderRadius: 'var(--radius-button)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                Оновити план <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ── Confirm Modal (suspend / remove / revoke / reactivate) ── */}
      {confirmModal && (
        <ConfirmActionModal
          type={confirmModal.type}
          user={users.find((u) => u.id === confirmModal.userId)!}
          seatsFull={seatsFull}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════ */

/* ── Table Header Cell ── */
function ThCell({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`text-left px-4 py-3 text-muted-foreground ${className}`}
      style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
    >
      {children}
    </th>
  );
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
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-card border border-border text-foreground pl-3 pr-8 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
        style={{
          borderRadius: 'var(--radius-button)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-weight-medium)',
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === 'All' ? `${label}: Всі` : o}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
    </div>
  );
}

/* ── Context Menu Button ── */
function MenuButton({
  onClick,
  icon,
  label,
  disabled,
  destructive,
  tooltip,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  destructive?: boolean;
  tooltip?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`w-full text-left px-3 py-1.5 flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-popover-foreground hover:bg-secondary'
      }`}
      style={{ fontSize: 'var(--text-sm)' }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ── Modal Overlay ── */
function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ── Confirm Action Modal ── */
function ConfirmActionModal({
  type,
  user,
  seatsFull,
  onConfirm,
  onCancel,
}: {
  type: 'suspend' | 'remove' | 'revoke' | 'reactivate';
  user: User;
  seatsFull: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const config: Record<string, { title: string; description: string; confirmLabel: string; destructive: boolean }> = {
    suspend: {
      title: 'Призупинити користувача',
      description: `Ви впевнені, що хочете призупинити ${user.full_name}? Користувач втратить доступ до платформи негайно.`,
      confirmLabel: 'Призупинити',
      destructive: true,
    },
    remove: {
      title: 'Видалити користувача',
      description: `Ви впевнені, що хочете видалити ${user.full_name}? Цю дію неможливо скасувати.`,
      confirmLabel: 'Видалити',
      destructive: true,
    },
    revoke: {
      title: 'Скасувати запрошення',
      description: `Скасувати запрошення для ${user.email}? Посилання більше не працюватиме.`,
      confirmLabel: 'Скасувати',
      destructive: true,
    },
    reactivate: {
      title: 'Відновити користувача',
      description: seatsFull
        ? `Не можна відновити ${user.full_name} — всі місця зайняті. Спочатку оновіть план.`
        : `Відновити ${user.full_name}? Користувач отримає доступ до платформи.`,
      confirmLabel: seatsFull ? 'Оновити план' : 'Відновити',
      destructive: false,
    },
  };

  const c = config[type];

  return (
    <ModalOverlay onClose={onCancel}>
      <div
        className="bg-card border border-border w-full max-w-sm p-6"
        style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
      >
        <h3
          className="text-foreground mb-2"
          style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
        >
          {c.title}
        </h3>
        <p className="text-muted-foreground mb-5" style={{ fontSize: 'var(--text-sm)' }}>
          {c.description}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="border border-border bg-card text-foreground hover:bg-secondary px-4 py-2 transition-colors"
            style={{
              borderRadius: 'var(--radius-button)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            Скасувати
          </button>
          {type === 'reactivate' && seatsFull ? (
            <Link
              to="/billing"
              onClick={onCancel}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 flex items-center gap-2 transition-colors"
              style={{
                borderRadius: 'var(--radius-button)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Оновити план <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={onConfirm}
              className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                c.destructive
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              style={{
                borderRadius: 'var(--radius-button)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              {c.confirmLabel}
            </button>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}