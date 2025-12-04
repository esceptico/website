'use client';

import { useEffect, useState } from 'react';
import type { Chunk } from '@/lib/docs/types';

interface TocItem {
  title: string;
  level: number;
  chunkIndex: number;
}

function extractToc(chunks: Chunk[]): TocItem[] {
  const items: TocItem[] = [];
  
  chunks.forEach((chunk, index) => {
    const doc = chunk.doc.trim();
    
    if (doc.startsWith('# ')) {
      items.push({ title: doc.split('\n')[0].slice(2).trim(), level: 1, chunkIndex: index });
    } else if (doc.startsWith('## ')) {
      items.push({ title: doc.split('\n')[0].slice(3).trim(), level: 2, chunkIndex: index });
    }
  });
  
  return items;
}

export function DocTOC({ chunks }: { chunks: Chunk[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const items = extractToc(chunks);

  useEffect(() => {
    const headerChunks = document.querySelectorAll('[data-chunk-header="true"]');
    if (headerChunks.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-chunk-index'));
            setActiveIndex(index);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    headerChunks.forEach(chunk => observer.observe(chunk));
    return () => observer.disconnect();
  }, [chunks]);

  const handleClick = (e: React.MouseEvent, chunkIndex: number) => {
    e.preventDefault();
    const element = document.getElementById(`chunk-${chunkIndex}`);
    if (element) {
      const headerHeight = 56;
      const offset = 24;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerHeight - offset,
        behavior: 'smooth'
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className="hidden lg:block fixed top-14 left-0 bottom-0 w-56 overflow-y-auto bg-[var(--theme-bg-primary)] z-20">
      <div className="px-4 pt-5">
        <div className="relative">
          {/* Vertical track line - spans only the list height */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--theme-border)]" />
          
          <ul className="space-y-0">
            {items.map((item, i) => (
              <li key={i} className="relative">
                {/* Active indicator - thicker line over the track */}
                {activeIndex === item.chunkIndex && (
                  <div className="absolute left-0 top-0.5 bottom-0.5 w-0.5 bg-[var(--theme-text-primary)] -ml-px rounded-full" />
                )}
                <a
                  href={`#chunk-${item.chunkIndex}`}
                  onClick={(e) => handleClick(e, item.chunkIndex)}
                  className={`
                    block py-1.5 transition-colors duration-200
                    ${item.level === 1 
                      ? 'pl-4 pr-3 text-[0.85rem] font-medium' 
                      : 'pl-6 pr-3 text-[0.8rem]'
                    }
                    ${activeIndex === item.chunkIndex 
                      ? 'text-[var(--theme-text-primary)]' 
                      : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]'
                    }
                  `}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Right border */}
      <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--theme-border)] to-transparent" />
    </nav>
  );
}
