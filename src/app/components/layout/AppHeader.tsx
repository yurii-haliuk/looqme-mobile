import svgPaths from '../../../imports/svg-hdmjzo2sdo';
import { useScenario } from '../../context/ScenarioContext';
import type { ScenarioType } from '../../context/ScenarioContext';

const MENU_ITEMS = ['Згадування', 'Дашборди', 'Пошук', 'Сповіщення', 'Завантаження'];

export function AppHeader() {
  const { scenario, setScenario } = useScenario();

  const scenarios: { value: ScenarioType; label: string; color: string }[] = [
    { value: 'normal', label: 'Нормальне', color: '#10b981' },
    { value: 'warning', label: 'Попередження', color: '#f59e0b' },
    { value: 'exhausted', label: 'Вичерпано', color: '#ef4444' },
  ];

  return (
    <header
      className="flex items-center justify-between px-6 w-full shrink-0 relative"
      style={{
        backgroundColor: '#420c8d',
        height: '56px',
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      {/* Left Side */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="h-[14px] w-[84px] relative shrink-0">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84.001 14">
            <g>
              <path clipRule="evenodd" d={svgPaths.p30ab6c80} fill="#F8EDFF" fillRule="evenodd" />
              <path d={svgPaths.p335f7800} fill="#F8EDFF" />
              <path clipRule="evenodd" d={svgPaths.p4fb5900} fill="#FF94A9" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p8f3ce00} fill="#F8EDFF" fillRule="evenodd" />
              <path d={svgPaths.p9f24900} fill="#F8EDFF" />
            </g>
          </svg>
        </div>

        {/* Menu */}
        <nav className="hidden md:flex items-center">
          {MENU_ITEMS.map((item) => (
            <button
              key={item}
              className="px-8 py-4 cursor-pointer bg-transparent border-none"
              style={{
                color: '#e5cbf7',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                lineHeight: '24px',
                fontFamily: "'Roboto', sans-serif",
                whiteSpace: 'nowrap',
              }}
            >
              {item}
            </button>
          ))}
          {/* More icon */}
          <button className="p-4 cursor-pointer bg-transparent border-none flex items-center justify-center">
            <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
              <path d={svgPaths.p3f25c480} fill="#E5CBF7" />
            </svg>
          </button>
        </nav>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Help */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            backgroundColor: '#6936a6',
            borderRadius: '24px',
            width: '32px',
            height: '32px',
          }}
        >
          <svg width="10" height="18" viewBox="0 0 9.99167 17.4167" fill="none">
            <path d={svgPaths.p3ae3b600} fill="#E5CBF7" />
          </svg>
        </div>

        {/* Account */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            borderRadius: '32px',
            width: '32px',
            height: '32px',
            border: '1px solid #6936a6',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 14.6667 14.6667" fill="none">
            <path d={svgPaths.p3f9d6a80} fill="#E5CBF7" />
          </svg>
        </div>
      </div>

      {/* Floating Scenario Switcher */}
      <div
        className="absolute top-full left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card border border-border shadow-lg px-3 py-2 z-50"
        style={{
          marginTop: '12px',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--elevation-md)',
        }}
      >
        <span
          className="text-muted-foreground shrink-0"
          style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
        >
          Сценарій:
        </span>
        {scenarios.map((s) => (
          <button
            key={s.value}
            onClick={() => setScenario(s.value)}
            className={`px-3 py-1.5 border transition-all ${
              scenario === s.value
                ? 'border-primary shadow-sm'
                : 'border-border hover:border-border/80'
            }`}
            style={{
              borderRadius: 'var(--radius-button)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-medium)',
              backgroundColor: scenario === s.value ? s.color + '15' : 'var(--background)',
              color: scenario === s.value ? s.color : 'var(--muted-foreground)',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </header>
  );
}