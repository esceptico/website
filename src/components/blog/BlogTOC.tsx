'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { Chunk } from '@/lib/blog/types';
import { slugify } from './BlogChunk';

interface TocItem {
  title: string;
  level: number;
  id: string;
}

// Extract ALL headings from all chunks
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

export function BlogTOC({ chunks }: { chunks: Chunk[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [prevActiveId, setPrevActiveId] = useState<string | null>(null);
  const items = extractToc(chunks);
  const isClickScrolling = useRef(false);
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 24 });
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getItemPosition = useCallback((id: string | null) => {
    if (!id) return { top: 0, height: 24 };
    const element = itemRefs.current.get(id);
    if (!element) return { top: 0, height: 24 };
    return { top: element.offsetTop + 2, height: element.offsetHeight - 4 };
  }, []);

  useEffect(() => {
    if (!activeId || activeId === prevActiveId) return;
    
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
      setIndicatorStyle({
        top: currentPos.top,
        height: targetPos.top + targetPos.height - currentPos.top
      });
    } else {
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

  useEffect(() => {
    if (activeId && !prevActiveId) {
      const pos = getItemPosition(activeId);
      setIndicatorStyle(pos);
      setPrevActiveId(activeId);
    }
  }, [activeId, prevActiveId, getItemPosition]);
  
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const firstItem = items[0];
    if (firstItem && !activeId) {
      setActiveId(firstItem.id);
    }
  }, [items, activeId]);

  useEffect(() => {
    const headingIds = items.map(item => item.id);
    const headingElements = headingIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    
    if (headingElements.length === 0) return;

    const handleScroll = () => {
      if (isClickScrolling.current) return;
      
      const headerOffset = 100;
      let currentId = headingIds[0];
      
      for (const el of headingElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= headerOffset) {
          currentId = el.id;
        } else {
          break;
        }
      }
      
      if (currentId && currentId !== activeId) {
        setActiveId(currentId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items, activeId]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      setActiveId(id);
      isClickScrolling.current = true;
      
      const headerHeight = 56;
      const offset = 24;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerHeight - offset,
        behavior: 'smooth'
      });
      
      window.history.pushState(null, '', `#${id}`);
      
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
          <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--theme-border)]" />
          
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
      
      <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--theme-border)] to-transparent" />
    </nav>
  );
}
