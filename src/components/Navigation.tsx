'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/theme';
import ColorSchemeToggle from '@/components/ColorSchemeToggle';
import { Mode } from '@/types/theme';

interface RouteConfig {
  path: string;
  label: string;
  modes: Mode[];
  getPath: (mode: Mode) => string;
}

const routes: RouteConfig[] = [
  {
    path: '/projects',
    label: 'Projects',
    modes: ['mle'],
    getPath: () => '/projects'
  },
  {
    path: '/portfolio',
    label: 'Portfolio',
    modes: ['photography'],
    getPath: () => '/portfolio'
  },
  {
    path: '/blog',
    label: 'Posts',
    modes: ['mle', 'photography'],
    getPath: (mode) => `/blog/${mode}`
  },
  {
    path: '/about',
    label: 'About',
    modes: ['mle', 'photography'],
    getPath: (mode) => `/about/${mode}`
  }
];

export default function Navigation() {
  const mode = useThemeStore(state => state.mode);
  const pathname = usePathname();

  if (pathname === '/') return null;

  const isActiveLink = (route: RouteConfig) => {
    const currentPath = route.getPath(mode);
    if (pathname === currentPath) return true;
    
    // Handle nested routes
    if (pathname.startsWith(route.path + '/')) {
      const currentMode = pathname.split('/')[2];
      return currentMode === mode;
    }
    
    return false;
  };

  const availableRoutes = routes.filter(route => route.modes.includes(mode));

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
            {availableRoutes.map((route) => (
              <Link
                key={route.path}
                href={route.getPath(mode)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActiveLink(route)
                    ? 'text-[var(--theme-accent-primary)]'
                    : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]'
                }`}
              >
                {route.label}
              </Link>
            ))}
            <div className="ml-2">
              <ColorSchemeToggle variant="nav" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 