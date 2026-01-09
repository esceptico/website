'use client';

import ColorSchemeToggle from "@/components/theme/ColorSchemeToggle";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

function getTimestamps() {
  const now = new Date();
  const utc = now.toISOString().slice(11, 19) + ' UTC';
  const pst = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Los_Angeles'
  }).format(now) + ' PST';
  return { utc, pst };
}

function getSlugFromPath(pathname: string): string | null {
  if (pathname.startsWith('/log/') && pathname !== '/log') {
    return pathname.replace('/log/', '');
  }
  return null;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [timestamps, setTimestamps] = useState({ utc: '', pst: '' });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    setTimestamps(getTimestamps());
    const interval = setInterval(() => setTimestamps(getTimestamps()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isHome = pathname === '/';
  const isLog = pathname === '/log';
  const isBlogPost = pathname.startsWith('/log/') && pathname !== '/log';
  const slug = getSlugFromPath(pathname);

  return (
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--theme-bg-primary)] focus:text-[var(--theme-text-primary)]"
      >
        Skip to main content
      </a>
      
      <div className="min-h-screen relative blueprint-grid">
        {/* Top gradient fade */}
        <div 
          className="fixed top-0 left-0 right-0 h-24 z-40 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, var(--theme-bg-primary) 0%, var(--theme-bg-primary) 30%, transparent 100%)'
          }}
        />
        
        {/* Top bar */}
        <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-5">
          {/* Dynamic breadcrumb navigation */}
          <nav className="flex items-center gap-2 min-w-0">
            <Link 
              href="/" 
              className={`nav-item ${isHome ? 'nav-item--active' : ''}`}
            >
              index
            </Link>
            
            {(isLog || isBlogPost) && (
              <>
                <span className="text-[var(--theme-text-muted)] text-xs">/</span>
                <Link 
                  href="/log" 
                  className={`nav-item ${isLog ? 'nav-item--active' : ''}`}
                >
                  log
                </Link>
              </>
            )}
            
            {isBlogPost && slug && (
              <>
                <span className="text-[var(--theme-text-muted)] text-xs">/</span>
                <span className="nav-item nav-item--active truncate max-w-[150px] sm:max-w-[250px] lg:max-w-[400px]">
                  {slug}
                </span>
              </>
            )}
          </nav>

          {/* Theme toggle */}
          <ColorSchemeToggle />
        </header>

        {/* Corner info - hide on blog posts */}
        {!isBlogPost && (
          <>
            {/* Bottom left: timestamps */}
            <div 
              className="fixed bottom-4 left-5 hidden md:flex flex-col items-start gap-0.5 select-none z-40 font-mono text-[10px] tracking-wider text-[var(--theme-text-muted)]" 
              aria-hidden="true"
            >
              <span>{timestamps.utc}</span>
              <span>{timestamps.pst}</span>
            </div>

            {/* Bottom right: cursor position (column) */}
            <div 
              className="fixed bottom-4 right-5 hidden md:flex flex-col items-end gap-0.5 select-none z-40 font-mono text-[10px] tracking-wider text-[var(--theme-text-muted)]" 
              aria-hidden="true"
            >
              <span>x:{cursorPos.x.toString().padStart(4, '0')}</span>
              <span>y:{cursorPos.y.toString().padStart(4, '0')}</span>
            </div>
          </>
        )}

        {/* Main */}
        <motion.main
          id="main-content"
          className="pt-12 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {children}
        </motion.main>
      </div>
    </>
  );
}
