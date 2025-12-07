'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [prevActiveId, setPrevActiveId] = useState<string | null>(null);
  const items = extractToc(chunks);
  const isClickScrolling = useRef(false);
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 24 });
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate indicator position for a given item id
  const getItemPosition = useCallback((id: string | null) => {
    if (!id) return { top: 0, height: 24 };
    const element = itemRefs.current.get(id);
    if (!element) return { top: 0, height: 24 };
    return { top: element.offsetTop + 2, height: element.offsetHeight - 4 };
  }, []);

  // Snake animation when active changes
  useEffect(() => {
    if (!activeId || activeId === prevActiveId) return;
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    
    const currentPos = getItemPosition(prevActiveId);
    const targetPos = getItemPosition(activeId);
    
    const currentIndex = items.findIndex(item => item.id === prevActiveId);
    const targetIndex = items.findIndex(item => item.id === activeId);
    const movingDown = targetIndex > currentIndex;
    
    setIsAnimating(true);
    
    if (movingDown) {
      // Moving down: extend bottom first, then pull up top
      setIndicatorStyle({
        top: currentPos.top,
        height: targetPos.top + targetPos.height - currentPos.top
      });
    } else {
      // Moving up: extend top first, then pull up bottom
      setIndicatorStyle({
        top: targetPos.top,
        height: currentPos.top + currentPos.height - targetPos.top
      });
    }
    
    animationRef.current = setTimeout(() => {
      setIndicatorStyle(targetPos);
      animationRef.current = setTimeout(() => {
        setIsAnimating(false);
        animationRef.current = null;
      }, 100);
    }, 100);
    
    setPrevActiveId(activeId);
  }, [activeId, prevActiveId, items, getItemPosition]);

  // Initialize indicator position
  useEffect(() => {
    if (activeId && !prevActiveId) {
      const pos = getItemPosition(activeId);
      setIndicatorStyle(pos);
      setPrevActiveId(activeId);
    }
  }, [activeId, prevActiveId, getItemPosition]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

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

    const handleScroll = () => {
      // Don't update if we're in the middle of a click-scroll
      if (isClickScrolling.current) return;
      
      const headerOffset = 100; // header height + some padding
      
      // Find the heading that's closest to (but above) the top of viewport
      let currentId = headingIds[0];
      
      for (const el of headingElements) {
        const rect = el.getBoundingClientRect();
        // If the element's top is above our threshold, it's the current section
        if (rect.top <= headerOffset) {
          currentId = el.id;
        } else {
          // Once we find one below the threshold, stop
          break;
        }
      }
      
      if (currentId && currentId !== activeId) {
        setActiveId(currentId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items, activeId]);

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
          
          {/* Snake indicator - single element that animates */}
          <div 
            className="absolute left-0 w-0.5 -ml-px rounded-full bg-[var(--theme-text-primary)] transition-all ease-out"
            style={{
              top: indicatorStyle.top,
              height: indicatorStyle.height,
              transitionDuration: isAnimating ? '150ms' : '0ms'
            }}
          />
          
          <ul className="space-y-0">
            {items.map((item, i) => (
              <li 
                key={i} 
                className="relative"
                ref={(el) => {
                  if (el) itemRefs.current.set(item.id, el);
                }}
              >
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
