'use client';

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';

// Color palette
const colorMap: Record<string, { light: string; dark: string }> = {
  blue:   { light: '#2563eb', dark: '#60a5fa' },
  red:    { light: '#dc2626', dark: '#f87171' },
  green:  { light: '#059669', dark: '#34d399' },
  purple: { light: '#7c3aed', dark: '#a78bfa' },
  amber:  { light: '#d97706', dark: '#fbbf24' },
  pink:   { light: '#db2777', dark: '#f472b6' },
  cyan:   { light: '#0891b2', dark: '#22d3ee' },
};

function hashColor(id: string) {
  const names = Object.keys(colorMap);
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorMap[names[Math.abs(hash) % names.length]!]!;
}

const TermContext = createContext<{
  register: (id: string, color?: string) => void;
}>({ register: () => {} });

export function LinkedFormula({ children }: { children: ReactNode }) {
  const [terms, setTerms] = useState<Map<string, { light: string; dark: string }>>(new Map());

  const register = (id: string, color?: string) => {
    setTerms(prev => {
      if (prev.has(id)) return prev;
      const next = new Map(prev);
      const c = color && colorMap[color] ? colorMap[color] : hashColor(id);
      next.set(id, c);
      return next;
    });
  };

  // One-way: hover text → highlight formula
  const termStyles = Array.from(terms.entries()).map(([id, c]) => `
    .linked-formula:has([data-term="${id}"]:hover) .term-${id} {
      color: ${c.light} !important;
    }
    :root.dark .linked-formula:has([data-term="${id}"]:hover) .term-${id} {
      color: ${c.dark} !important;
    }
    .linked-formula [data-term="${id}"]:hover {
      color: ${c.light} !important;
      text-decoration-color: ${c.light} !important;
      text-decoration-style: solid !important;
    }
    :root.dark .linked-formula [data-term="${id}"]:hover {
      color: ${c.dark} !important;
      text-decoration-color: ${c.dark} !important;
    }
  `).join('\n');

  return (
    <TermContext.Provider value={{ register }}>
      <div className="linked-formula my-6">
        <style>{`
          .linked-formula [data-term] {
            cursor: pointer;
            text-decoration: underline;
            text-decoration-style: dotted;
            text-decoration-color: var(--theme-text-secondary);
            text-underline-offset: 3px;
            transition: color 0.15s, text-decoration-color 0.15s;
          }
          .linked-formula .katex [class*="term-"] {
            transition: color 0.15s;
          }
          ${termStyles}
        `}</style>
        {children}
      </div>
    </TermContext.Provider>
  );
}

export function Term({ id, color, children }: { id: string; color?: string; children: ReactNode }) {
  const { register } = useContext(TermContext);
  
  useEffect(() => {
    register(id, color);
  }, [id, color, register]);

  return <span data-term={id}>{children}</span>;
}
