import { Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';

/* ── Plan data ── */
interface PlanSpec {
  label: string;
  value: string;
}

interface PlanFeature {
  text: string;
}

interface Addon {
  name: string;
  price: string;
}

interface Plan {
  name: string;
  price: string;
  recommended?: boolean;
  specs: PlanSpec[];
  features: PlanFeature[];
  addons: Addon[];
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: '11 400',
    specs: [
      { label: 'Кількість згадок в стрічці новин', value: '10 000 / міс' },
      { label: 'Загальна кількість тем моніторингу', value: '3' },
      { label: 'Користувачі', value: '5' },
      { label: 'Автоматичні теги', value: '15' },
      { label: 'AI-асистент Q Insight', value: '20 запитів' },
    ],
    features: [
      { text: 'Соціальні медіа (форуми, блоги)' },
      { text: 'Традиційні ЗМІ (інтернет, преса, ТВ, радіо)' },
      { text: 'Інтерактивні дашборди' },
      { text: 'Медіаархів 1 місяць' },
      { text: 'Автоматичні звіти' },
      { text: 'Алерти (E-mail, Telegram)' },
      { text: 'Самостійне формування запитів/тем' },
      { text: 'Налаштування кабінету' },
      { text: 'Технічна підтримка' },
    ],
    addons: [
      { name: 'ШІ-маркування згадок: тональність, роль + видалення нерелевантного контенту згідно з ТЗ клієнта', price: '2 500 грн/міс' },
      { name: 'ШІ-визначення та присвоєння категорій згідно з ТЗ клієнта (з аналітичним дашбордом)', price: '2 500 грн/міс' },
      { name: 'Розширена технічна підтримка', price: '5 000 грн/міс' },
      { name: 'Дашборд з аналітикою власних та сторінок конкурентів', price: '1 500 грн/міс' },
      { name: 'Моніторинг міжнародних ЗМІ та соцмереж для 1 теми', price: '2 000 грн/міс' },
    ],
  },
  {
    name: 'Master',
    price: '18 900',
    recommended: true,
    specs: [
      { label: 'Кількість згадок в стрічці новин', value: '30 000 / міс' },
      { label: 'Загальна кількість тем моніторингу', value: '7' },
      { label: 'Користувачі', value: '10' },
      { label: 'Автоматичні теги', value: '25' },
      { label: 'AI-асистент Q Insight', value: '30 запитів' },
    ],
    features: [
      { text: 'Наповнення "Starter"' },
      { text: 'ШІ видалення нерелевантного контенту' },
      { text: 'Smart Alert про репутаційні ризики' },
      { text: 'Медіаархів 2 місяці' },
      { text: 'Перевірка пошукових запитів' },
      { text: 'Розширена технічна підтримка' },
    ],
    addons: [
      { name: 'ШІ-маркування згадок: тональність, роль', price: '5 000 грн/міс' },
      { name: 'ШІ-визначення та присвоєння категорій згідно з ТЗ клієнта (з аналітичним дашбордом)', price: '2 500 грн/міс' },
      { name: 'Персональний менеджер', price: '5 000 грн/міс' },
      { name: 'Дашборд з аналітикою власних та сторінок конкурентів', price: '2 000 грн/міс' },
      { name: 'Моніторинг міжнародних ЗМІ та соцмереж для 1 теми', price: '2 000 грн/міс' },
      { name: 'AI-асистент Q Insight, 50 запитів', price: '1 500 грн/міс' },
    ],
  },
  {
    name: 'Professional',
    price: '44 100',
    specs: [
      { label: 'Кількість згадок в стрічці новин', value: '100 000 / міс' },
      { label: 'Загальна кількість тем моніторингу', value: '21' },
      { label: 'Користувачі', value: 'Необмежено' },
      { label: 'Автоматичні теги', value: '50' },
      { label: 'AI-асистент Q Insight', value: '50 запитів' },
    ],
    features: [
      { text: 'Наповнення "Master"' },
      { text: 'Smart Alert про репутаційні ризики' },
      { text: 'Медіаархів 6 місяців' },
      { text: 'API інтеграція' },
      { text: 'Допомога у формуванні запитів/тем' },
      { text: 'Персональний менеджер проєкту' },
      { text: 'Налаштування кабінету під проєкт' },
      { text: 'Функція "Швидкий пошук" — прямий пошук по базі ЗМІ та соцмереж глибиною в 1 рік' },
    ],
    addons: [
      { name: 'ШІ-маркування згадок: тональність, роль', price: '15 000 грн/міс' },
      { name: 'ШІ-визначення та присвоєння категорій згідно з ТЗ клієнта (з аналітичним дашбордом)', price: '2 500 грн/міс' },
      { name: 'Дашборд з аналітикою власних та сторінок конкурентів', price: '2 500 грн/міс' },
      { name: 'Моніторинг міжнародних ЗМІ та соцмереж для 1 теми', price: '2 000 грн/міс' },
      { name: 'AI-асистент Q Insight, 50 запитів', price: '1 500 грн/міс' },
    ],
  },
];

/* ── Plan Card ── */
function PlanCard({ plan }: { plan: Plan }) {
  const isRecommended = plan.recommended;
  const { user } = useAuth();
  const isAdmin = user.role === 'Admin';

  return (
    <div
      className="flex flex-col gap-4 items-center px-6 py-8 relative w-full"
      style={{
        backgroundColor: isRecommended ? 'var(--accent, #9a61d2)' : 'var(--card)',
        borderRadius: '24px',
        border: isRecommended ? '1px solid var(--accent)' : '1px solid var(--border)',
        boxShadow: isRecommended
          ? '0px 8px 32px rgba(74,85,104,0.08), 0px 4px 16px rgba(74,85,104,0.12)'
          : '0px 4px 16px rgba(74,85,104,0.04), 0px 2px 8px rgba(74,85,104,0.08)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <h2
          style={{
            fontSize: '28px',
            lineHeight: '32px',
            fontWeight: 'var(--font-weight-bold)',
            color: isRecommended ? 'var(--accent-foreground)' : 'var(--secondary-foreground)',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          {plan.name}
        </h2>
        {isRecommended && (
          <span
            className="text-white uppercase"
            style={{
              backgroundColor: '#fa248c',
              borderRadius: '20px',
              padding: '4px 8px',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-medium)',
              lineHeight: '16px',
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            Рекомендуємо
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-end gap-1 w-full">
        <span
          style={{
            fontSize: '32px',
            lineHeight: '40px',
            fontWeight: 'var(--font-weight-bold)',
            color: isRecommended ? 'var(--accent-foreground)' : 'var(--accent)',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          {plan.price}
        </span>
        <span
          style={{
            fontSize: 'var(--text-base)',
            lineHeight: '24px',
            fontWeight: 'var(--font-weight-medium)',
            color: isRecommended ? 'var(--accent-foreground)' : 'var(--secondary-foreground)',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          грн/міс
        </span>
      </div>

      {/* Specs Box */}
      <div
        className="w-full p-4"
        style={{
          backgroundColor: isRecommended ? 'rgba(255,255,255,0.15)' : 'var(--secondary)',
          borderRadius: '8px',
        }}
      >
        <div className="flex flex-col gap-2">
          {plan.specs.map((spec, i) => (
            <div
              key={spec.label}
              className="flex items-center justify-between pb-2"
              style={{
                borderBottom:
                  i < plan.specs.length - 1
                    ? `1px solid ${isRecommended ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`
                    : 'none',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-normal)',
                  lineHeight: '20px',
                  color: isRecommended ? 'rgba(255,255,255,0.8)' : 'var(--foreground)',
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                {spec.label}
              </span>
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  lineHeight: '20px',
                  color: isRecommended ? 'var(--accent-foreground)' : 'var(--secondary-foreground)',
                  textAlign: 'right',
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="w-full pb-4">
        <p
          style={{
            fontSize: '20px',
            lineHeight: '30px',
            fontWeight: 'var(--font-weight-medium)',
            color: isRecommended ? 'var(--accent-foreground)' : 'var(--secondary-foreground)',
            fontFamily: "'Roboto', sans-serif",
            marginBottom: '8px',
          }}
        >
          Пакет містить:
        </p>
        <div className="flex flex-col gap-2">
          {plan.features.map((f) => (
            <div key={f.text} className="flex items-start gap-1 w-full">
              <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                <Check
                  className="w-4 h-4"
                  style={{
                    color: isRecommended ? 'var(--accent-foreground)' : 'var(--accent)',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-normal)',
                  lineHeight: '20px',
                  color: isRecommended ? 'rgba(255,255,255,0.8)' : 'var(--muted-foreground)',
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      {isAdmin && (
        <button
          className="w-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
          style={{
            height: '56px',
            borderRadius: 'var(--radius-button)',
            backgroundColor: isRecommended ? 'var(--primary)' : 'transparent',
            border: isRecommended ? 'none' : '1px solid var(--accent)',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '20px',
            lineHeight: '24px',
            fontWeight: 'var(--font-weight-medium)',
            color: isRecommended ? 'var(--primary-foreground)' : 'var(--accent)',
          }}
        >
          Обрати план
        </button>
      )}

      {/* Addons */}
      <div className="w-full p-4" style={{ borderRadius: '8px' }}>
        <p
          style={{
            fontSize: '20px',
            lineHeight: '30px',
            fontWeight: 'var(--font-weight-medium)',
            color: isRecommended ? 'var(--accent-foreground)' : 'var(--secondary-foreground)',
            fontFamily: "'Roboto', sans-serif",
            marginBottom: '16px',
          }}
        >
          Ви також можете додати:
        </p>
        <div className="flex flex-col gap-2">
          {plan.addons.map((addon) => (
            <div key={addon.name} className="flex gap-2 items-start justify-between w-full pb-2">
              <span
                className="flex-1"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-normal)',
                  lineHeight: '20px',
                  color: isRecommended ? 'rgba(255,255,255,0.8)' : 'var(--foreground)',
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                {addon.name}
              </span>
              <span
                className="shrink-0 text-right"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  lineHeight: '20px',
                  color: isRecommended ? 'var(--accent-foreground)' : 'var(--secondary-foreground)',
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                {addon.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export function PlansPage() {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-accent hover:underline"
        style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', fontFamily: "'Roboto', sans-serif" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Назад до огляду
      </Link>

      {/* Heading */}
      <div className="text-center space-y-2">
        <h1
          style={{
            fontSize: '32px',
            lineHeight: '40px',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--secondary-foreground)',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          Доступні тарифи
        </h1>
        <p
          className="text-muted-foreground"
          style={{
            fontSize: '20px',
            lineHeight: '30px',
            fontWeight: 'var(--font-weight-normal)',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          Оберіть тарифний план, який найкраще відповідає вашим потребам.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>
    </div>
  );
}