'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/theme';

export default function Navigation() {
  const { mode } = useThemeStore();
  const pathname = usePathname();
  
  if (pathname === '/') return null;

  const links = mode === 'mle' 
    ? [{ href: '/projects', label: 'Projects' }, { href: '/about', label: 'About' }]
    : [{ href: '/portfolio', label: 'Portfolio' }, { href: '/about', label: 'About' }];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <ul className="flex items-center gap-6">
          <li>
            <Link 
              href="/" 
              className="text-sm text-gray-400 transition-colors duration-200 hover:text-gray-600"
            >
              ← Home
            </Link>
          </li>
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm transition-colors duration-200 ${
                  pathname === href
                    ? mode === 'mle'
                      ? 'text-indigo-600'
                      : 'text-amber-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
} 