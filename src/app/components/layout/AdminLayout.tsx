import {
  LayoutDashboard,
  Users,
  Blocks,
  CreditCard,
  FileText,
  BarChart3,
  FileClock,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useScenario } from '../../context/ScenarioContext';
import { MOCK_ORG } from '../../data/mock';
import { useState } from 'react';
import { AppHeader } from './AppHeader';

const NAV_SECTIONS = [
  {
    title: 'Організація',
    items: [
      { label: 'Акаунт', icon: LayoutDashboard, path: '/' },
      { label: 'Користувачі', icon: Users, path: '/users' },
      { label: 'Інтеграції', icon: Blocks, path: '/integrations' },
    ],
  },
  {
    title: 'Фінанси та документи',
    items: [
      { label: 'Білінг', icon: CreditCard, path: '/billing' },
      { label: 'Документи', icon: FileText, path: '/documents' },
    ],
  },
  {
    title: 'Безпека та контроль',
    items: [
      { label: 'Дані та ліміти', icon: BarChart3, path: '/limits' },
      { label: 'Аудит', icon: FileClock, path: '/audit' },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

export function AdminLayout() {
  const location = useLocation();
  const { user, toggleRole } = useAuth();
  const { getOrgWithScenario } = useScenario();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLabel =
    ALL_NAV_ITEMS.find((item) => item.path === location.pathname)?.label || 'Admin';

  // Get organization data with current scenario applied
  const org = getOrgWithScenario(MOCK_ORG);

  return (
    <div className="flex flex-col min-h-screen bg-background" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <AppHeader />
      <div className="flex flex-1">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          style={{ top: '56px' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col fixed left-0 z-30 transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ top: '56px', bottom: 0 }}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <div
              className="w-8 h-8 flex items-center justify-center text-sidebar-primary-foreground bg-sidebar-primary"
              style={{ borderRadius: 'var(--radius-card)' }}
            >
              {MOCK_ORG.name.substring(0, 1)}
            </div>
            <span className="text-sidebar-foreground" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
              {MOCK_ORG.name}
            </span>
          </div>
          <button className="lg:hidden text-muted-foreground" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-4">
              <p
                className="px-3 py-1.5 text-muted-foreground uppercase tracking-wider"
                style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {section.title}
              </p>
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-foreground'
                      )
                    }
                    style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', borderRadius: 'var(--radius)' }}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div
              className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
            >
              {user.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sidebar-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                {user.full_name}
              </p>
              <p className="truncate text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                {user.role}
              </p>
            </div>
            <button className="text-muted-foreground hover:text-sidebar-foreground">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={toggleRole}
            className="w-full text-left text-primary hover:underline px-1"
            style={{ fontSize: 'var(--text-xs)' }}
          >
            Switch to {user.role === 'Admin' ? 'User' : 'Admin'} view
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Header */}
        <header className="h-16 border-b border-border bg-background px-6 lg:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
              style={{ borderRadius: 'var(--radius)' }}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-foreground" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
              {currentLabel}
            </h2>
          </div>

          
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet context={{ user, org }} />
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}