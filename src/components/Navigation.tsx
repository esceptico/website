'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/theme';

export default function Navigation() {
  const mode = useThemeStore(state => state.mode);
  const pathname = usePathname();

  if (pathname === '/') return null;

  const modeLinks = mode === 'mle' 
    ? [
        { href: '/projects', label: 'Projects' }, 
        { href: '/blog/mle', label: 'Blog' }, 
        { href: '/about', label: 'About' }
      ]
    : [
        { href: '/portfolio', label: 'Portfolio' }, 
        { href: '/blog/photography', label: 'Blog' }, 
        { href: '/about', label: 'About' }
      ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm border-b border-[var(--theme-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors"
              >
                ← Home
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {modeLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === href || (pathname.startsWith('/blog/') && href.startsWith('/blog/'))
                    ? 'text-[var(--theme-accent-primary)]'
                    : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
} 