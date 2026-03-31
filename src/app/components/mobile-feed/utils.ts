import { createElement, type ReactNode } from 'react';

export function highlightKeywords(text: string, keywords: string[]): ReactNode {
  if (!keywords.length) return text;

  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    if (pattern.test(part)) {
      return createElement(
        'mark',
        {
          key: i,
          className: 'text-[#fa248c] bg-pink-50 font-medium rounded-sm px-0.5',
        },
        part,
      );
    }
    return part;
  });
}

export function formatAudience(n: number): string {
  if (n >= 1_000_000) {
    const val = n / 1_000_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} млн`;
  }
  if (n >= 1_000) {
    const val = n / 1_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} тис`;
  }
  return String(n);
}

export function formatMetric(n: number): string {
  if (n === 0) return '0';
  return n.toLocaleString('uk-UA').replace(/,/g, ' ');
}
