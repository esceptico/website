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
  const [loss, setLoss] = useState(1.0);
  const [gradientDir, setGradientDir] = useState('·');
  const [converged, setConverged] = useState(false);
  const [globalMin, setGlobalMin] = useState({ x: 0, y: 0 });
  
  // Set random global minimum on mount (somewhere in the viewport)
  useEffect(() => {
    const setRandomMinimum = () => {
      const padding = 100;
      setGlobalMin({
        x: padding + Math.random() * (window.innerWidth - padding * 2),
        y: padding + Math.random() * (window.innerHeight - padding * 2)
      });
    };
    setRandomMinimum();
    
    // Reset on window resize
    const handleResize = () => {
      setConverged(false);
      setRandomMinimum();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    setTimestamps(getTimestamps());
    const interval = setInterval(() => setTimestamps(getTimestamps()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Get arrow direction pointing toward minimum (negative gradient = direction to move)
    const getGradientArrow = (dx: number, dy: number): string => {
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return '·';
      
      // dx, dy = cursor - minimum (so positive dx means cursor is RIGHT of minimum)
      // We want arrow pointing TO minimum, and screen Y is inverted (down = positive)
      const angle = Math.atan2(dy, -dx);
      const octant = Math.round(8 * angle / (2 * Math.PI) + 8) % 8;
      const arrows = ['→', '↗', '↑', '↖', '←', '↙', '↓', '↘'];
      return arrows[octant];
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate loss (distance to global minimum, normalized)
      const distX = e.clientX - globalMin.x;
      const distY = e.clientY - globalMin.y;
      const distance = Math.sqrt(distX * distX + distY * distY);
      const maxDist = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
      const normalizedLoss = distance / maxDist;
      
      // Check for convergence (within 30px radius)
      if (distance < 30 && !converged) {
        setConverged(true);
      }
      
      setLoss(normalizedLoss);
      setGradientDir(getGradientArrow(distX, distY));
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [globalMin, converged]);

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

            {/* Bottom right: optimization stats */}
            <div 
              className="fixed bottom-4 right-5 hidden md:flex flex-col items-end gap-0.5 select-none z-40 font-mono text-[10px] tracking-wider text-[var(--theme-text-muted)]" 
              aria-hidden="true"
            >
              <span 
                className="transition-all duration-500"
                style={{ 
                  color: loss < 0.08 ? '#22d3ee' : undefined,
                  textShadow: loss < 0.08 
                    ? `0 0 ${Math.round((0.08 - loss) * 150)}px #22d3ee` 
                    : undefined
                }}
              >
                L(θ):{loss.toFixed(4).padStart(7, ' ')}
              </span>
              <span>−∇L:{gradientDir.padStart(6, ' ')}</span>
              {converged && (
                <motion.span 
                  className="mt-1"
                  style={{ color: '#22d3ee', textShadow: '0 0 8px #22d3ee' }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ✓ converged
                </motion.span>
              )}
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
