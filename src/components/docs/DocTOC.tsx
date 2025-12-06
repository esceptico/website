'use client';

import { useEffect, useState, useRef } from 'react';
import type { Chunk } from '@/lib/docs/types';
import { slugify } from './DocChunk';

interface TocItem {
  title: string;
  level: number;
  id: string;
}

// Extract ALL headings from all chunks (including multiple headings within a single chunk)
function extractToc(chunks: Chunk[]): TocItem[] {
  const items: TocItem[] = [];
  
  chunks.forEach((chunk) => {
    const lines = chunk.doc.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        const title = trimmed.slice(2).trim();
        items.push({ title, level: 1, id: slugify(title) });
      } else if (trimmed.startsWith('## ')) {
        const title = trimmed.slice(3).trim();
        items.push({ title, level: 2, id: slugify(title) });
      }
    }
  });
  
  return items;
}

export function DocTOC({ chunks }: { chunks: Chunk[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const items = extractToc(chunks);
  const isClickScrolling = useRef(false);

  useEffect(() => {
    // Set first item as active initially
    if (items.length > 0 && !activeId) {
      setActiveId(items[0].id);
    }
  }, [items, activeId]);

  useEffect(() => {
    // Get all heading elements that we have in TOC
    const headingIds = items.map(item => item.id);
    const headingElements = headingIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    
    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Don't update if we're in the middle of a click-scroll
        if (isClickScrolling.current) return;
        
        // Find the first intersecting entry
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-10% 0px -80% 0px' }
    );

    headingElements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Set active immediately on click
      setActiveId(id);
      isClickScrolling.current = true;
      
      const headerHeight = 56;
      const offset = 24;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerHeight - offset,
        behavior: 'smooth'
      });
      
      // Update URL hash
      window.history.pushState(null, '', `#${id}`);
      
      // Reset click scrolling flag after scroll completes
      setTimeout(() => {
        isClickScrolling.current = false;
      }, 500);
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
                {activeId === item.id && (
                  <div className="absolute left-0 top-0.5 bottom-0.5 w-0.5 bg-[var(--theme-text-primary)] -ml-px rounded-full" />
                )}
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`
                    block py-1.5 transition-colors duration-200
                    ${item.level === 1 
                      ? 'pl-4 pr-3 text-[0.85rem] font-medium' 
                      : 'pl-6 pr-3 text-[0.8rem]'
                    }
                    ${activeId === item.id 
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
