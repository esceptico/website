'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/theme';

export default function Navigation() {
  const { mode, colorScheme } = useThemeStore();
  const pathname = usePathname();
  const isDark = colorScheme === 'dark';
  
  if (pathname === '/') return null;

  const links = mode === 'mle' 
    ? [{ href: '/projects', label: 'Projects' }, { href: '/about', label: 'About' }]
    : [{ href: '/portfolio', label: 'Portfolio' }, { href: '/about', label: 'About' }];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${
      isDark 
        ? 'bg-gray-950/80 border-gray-800' 
        : 'bg-white/80 border-gray-200'
    } backdrop-blur-sm border-b`}>
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <ul className="flex items-center gap-6">
          <li>
            <Link 
              href="/" 
              className={`text-sm transition-colors duration-200 ${
                isDark
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
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
                      ? isDark ? 'text-indigo-400' : 'text-indigo-600'
                      : isDark ? 'text-orange-400' : 'text-orange-600'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-900'
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