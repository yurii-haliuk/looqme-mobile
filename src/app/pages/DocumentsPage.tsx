import { useState } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import { MOCK_DOCUMENTS } from '../data/mock';

const TYPE_ICON_BG: Record<string, string> = {
  Contract: 'bg-accent/10 text-accent',
  Invoice: 'bg-primary/10 text-primary',
  Act: 'bg-chart-3/10 text-chart-3',
  Other: 'bg-secondary text-secondary-foreground',
};

const STATUS_STYLES: Record<string, string> = {
  signed: 'bg-primary/10 text-primary border-primary/20',
  Signed: 'bg-primary/10 text-primary border-primary/20',
  pending: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  Pending: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  archived: 'bg-muted/20 text-muted-foreground border-border',
  Paid: 'bg-primary/10 text-primary border-primary/20',
};

export function DocumentsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const types = ['All', ...Array.from(new Set(MOCK_DOCUMENTS.map((d) => d.type)))];

  const filtered = MOCK_DOCUMENTS.filter((d) => {
    const matchType = typeFilter === 'All' || d.type === typeFilter;
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }} className="text-foreground">
          Документи
        </h2>
        <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-sm)' }}>
          Договори, рахунки та акти генеруються автоматично. Тільки перегляд.
        </p>
      </div>

      <div
        className="bg-card border border-border overflow-hidden"
        style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--elevation-sm)' }}
      >
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Пошук документів…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
            />
          </div>
          <div className="flex gap-1.5">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 border transition-colors ${
                  typeFilter === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                }`}
                style={{ borderRadius: 'var(--radius-button)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-border">
          {filtered.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/10 transition-colors">
              <div
                className={`w-10 h-10 flex items-center justify-center ${TYPE_ICON_BG[doc.type] || TYPE_ICON_BG.Other}`}
                style={{ borderRadius: 'var(--radius)' }}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground truncate" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  {doc.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                    {doc.type}
                  </span>
                  <span className="text-border">·</span>
                  <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                    {doc.date}
                  </span>
                  {'period' in doc && doc.period && (
                    <>
                      <span className="text-border">·</span>
                      <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                        {doc.period}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <span
                className={`hidden sm:inline-flex px-2 py-0.5 border ${STATUS_STYLES[doc.status] || 'bg-secondary text-secondary-foreground border-border'}`}
                style={{ borderRadius: 'var(--radius-button)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {typeof doc.status === 'string' ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1) : doc.status}
              </span>
              <a
                href={doc.url}
                className="flex items-center gap-1 text-accent hover:underline shrink-0"
                style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Завантажити</span>
              </a>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              Документів не знайдено.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
