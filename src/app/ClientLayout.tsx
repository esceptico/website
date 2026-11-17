'use client';

import ColorSchemeToggle from "@/components/theme/ColorSchemeToggle";
import HeaderGradientBg from "@/components/layout/HeaderGradientBg";
import CornerBuddy from "@/components/layout/CornerBuddy";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

function getTimestamps() {
  const now = new Date();
  const utc = now.toISOString().slice(11, 19) + ' UTC';
  // Let Intl pick PST/PDT instead of hardcoding the zone abbreviation.
  const pst = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short',
  }).format(now);
  return { utc, pst };
}

function getSlugFromPath(pathname: string): string | null {
  if (pathname.startsWith('/log/') && pathname !== '/log') {
    return pathname.replace('/log/', '');
  }
  return null;
}

// The clock owns its state so the 1s tick re-renders only itself,
// not the whole layout (header, nav, main).
function CornerClock() {
  const [timestamps, setTimestamps] = useState({ utc: '', pst: '' });
  useEffect(() => {
    setTimestamps(getTimestamps());
    const interval = setInterval(() => setTimestamps(getTimestamps()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed bottom-4 left-5 hidden md:flex flex-col items-start gap-0.5 select-none z-40 font-mono text-[10px] tracking-wider text-[var(--theme-text-muted)]"
      aria-hidden="true"
    >
      <span>{timestamps.utc}</span>
      <span>{timestamps.pst}</span>
    </div>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isLog = pathname === '/log';
  const isBlogPost = pathname.startsWith('/log/') && pathname !== '/log';
  const isTape = pathname === '/tape';
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
        {/* Top bar */}
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="relative h-12">
            <div className="relative z-10 h-12 flex items-center justify-between px-5">
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
                
                {isTape && (
                  <>
                    <span className="text-[var(--theme-text-muted)] text-xs">/</span>
                    <span className="nav-item nav-item--active">tape</span>
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
            </div>
            <HeaderGradientBg />
          </div>
        </header>

        {/* Corner info - hide on blog posts and the tape page */}
        {!isBlogPost && !isTape && (
          <>
            <CornerClock />
            <CornerBuddy />
          </>
        )}

        {/* Main */}
        <main id="main-content" className="pt-12 relative z-10">
          {children}
        </main>
      </div>
    </>
  );
}
