import { useOutletContext, useNavigate } from 'react-router';
import { CreditCard, Download, RefreshCw, ArrowUpRight } from 'lucide-react';
import { MOCK_INVOICES } from '../data/mock';
import type { Organization } from '../data/mock';
import { format } from 'date-fns';

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-primary/10 text-primary border-primary/20',
  open: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  void: 'bg-muted/20 text-muted-foreground border-border',
};

export function BillingPage() {
  const { user, org } = useOutletContext<{ user: { role: string }; org: Organization }>();
  const isAdmin = user.role === 'Admin';
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }} className="text-foreground">
          Білінг
        </h2>
        <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-sm)' }}>
          Керуйте підпискою та платіжними даними.
        </p>
      </div>

      {/* Plan + Payment cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Current plan */}
        <div
          className="bg-card border border-border p-6"
          style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
        >
          <div className="flex items-start justify-between mb-4">
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }} className="text-foreground">
              Поточний план
            </h3>
            {isAdmin && (
              <button
                onClick={() => navigate('/plans')}
                className="flex items-center gap-1.5 text-accent hover:underline cursor-pointer"
                style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
              >
                <ArrowUpRight className="w-3.5 h-3.5" /> Змінити план
              </button>
            )}
          </div>
          <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }} className="text-foreground">
            {org.plan_name}
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)' }}>
              <span className="text-muted-foreground">Статус</span>
              <span className="text-primary" style={{ fontWeight: 'var(--font-weight-medium)' }}>Активний</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)' }}>
              <span className="text-muted-foreground">Продовження</span>
              <span className="text-foreground">{format(new Date(org.renewal_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)' }}>
              <span className="text-muted-foreground">Автопродовження</span>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                <span className="text-foreground">Увімкнено</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div
          className="bg-card border border-border p-6"
          style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
        >
          <div className="flex items-start justify-between mb-4">
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }} className="text-foreground">
              Спосіб оплати
            </h3>
            {isAdmin && (
              <button
                className="flex items-center gap-1.5 text-accent hover:underline"
                style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Оновити
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-secondary flex items-center justify-center" style={{ borderRadius: 'var(--radius)' }}>
              <CreditCard className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                •••• •••• •••• 4242
              </p>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                Дійсна до 12/2027
              </p>
            </div>
          </div>
          {!isAdmin && (
            <p className="text-muted-foreground italic mt-4" style={{ fontSize: 'var(--text-xs)' }}>
              Тільки адміністратори можуть оновлювати способи оплати
            </p>
          )}
        </div>
      </div>

      {/* Invoices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }} className="text-foreground">
            Рахунки
          </h3>
        </div>
        <div
          className="bg-card border border-border overflow-hidden"
          style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                    Рахунок
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                    Дата
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                    Сума
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                    Статус
                  </th>
                  <th className="text-right px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-4 py-3 text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {inv.id}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(inv.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      ${inv.amount.toFixed(2)} {inv.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 border ${STATUS_STYLES[inv.status]}`}
                        style={{ borderRadius: 'var(--radius-button)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={inv.pdf_url}
                        className="inline-flex items-center gap-1.5 text-accent hover:underline"
                        style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}