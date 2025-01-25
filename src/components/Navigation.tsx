'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/theme';
import ThemeToggle from './ThemeToggle';
import { motion } from 'framer-motion';

const mleLinks = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/publications', label: 'Publications' },
];

const photographyLinks = [
  { href: '/about', label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
  { href: '/behind-the-scenes', label: 'Stories' },
];

export default function Navigation() {
  const { mode } = useThemeStore();
  const pathname = usePathname();
  const links = mode === 'mle' ? mleLinks : photographyLinks;
  const activeColor = mode === 'mle' ? 'rgb(79, 70, 229)' : 'rgb(217, 119, 6)';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto px-4 sm:px-8 lg:px-12">
        <div className="h-20 flex items-center justify-between">
          <Link
            href="/"
            className="text-base font-light tracking-wide hover:opacity-70 transition-opacity"
          >
            <span className="hidden sm:inline">Firstname</span>
            <span className="sm:hidden">F.</span>
            {' '}
            <span className="font-normal">Lastname</span>
          </Link>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <span>{link.label}</span>
                  {pathname === link.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute left-0 right-0 bottom-0 h-px"
                      style={{ backgroundColor: activeColor }}
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            <div className="h-8 w-px bg-gray-200 hidden md:block" />
            
            <ThemeToggle />
          </div>
        </div>
      </nav>
      
      {/* Gradient border effect */}
      <div 
        className="h-px w-full opacity-25"
        style={{
          background: mode === 'mle'
            ? 'linear-gradient(90deg, transparent 0%, rgb(79, 70, 229) 50%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgb(217, 119, 6) 50%, transparent 100%)'
        }}
      />
    </header>
  );
} 