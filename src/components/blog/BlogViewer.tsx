'use client';

import { motion } from 'framer-motion';
import { BlogTOC } from './BlogTOC';
import { BlogChunk } from './BlogChunk';
import type { BlogPost } from '@/lib/blog/types';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa';

interface BlogViewerProps {
  post: BlogPost;
}

export function BlogViewer({ post }: BlogViewerProps) {
  const hasAnnotatedCode = post.chunks.some(c => c.code.trim().length > 0);

  return (
    <div className="min-h-screen -mt-16 bg-[var(--theme-bg-primary)] relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--theme-bg-primary)]/90 backdrop-blur-xl border-b border-[var(--theme-border)]">
        <div className="h-14 flex items-center px-6 lg:px-10">
          <nav className="flex items-center gap-2 text-sm">
            <Link 
              href="/" 
              className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors"
            >
              home
            </Link>
            <FaChevronRight className="w-2 h-2 text-[var(--theme-text-secondary)]/50" />
            <Link 
              href="/log" 
              className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors"
            >
              log
            </Link>
            <FaChevronRight className="w-2 h-2 text-[var(--theme-text-secondary)]/50" />
            <span className="text-[var(--theme-text-primary)] font-medium truncate max-w-[300px]">
              {post.title}
            </span>
          </nav>
        </div>
      </header>

      <div className="flex">
        {/* TOC - only show if there's annotated code */}
        {hasAnnotatedCode && <BlogTOC chunks={post.chunks} />}

        {/* Main content */}
        <main 
          className={`flex-1 overflow-x-hidden ${hasAnnotatedCode ? 'lg:ml-56' : ''}`}
        >
          <div className={`px-6 lg:px-10 pt-8 pb-6 ${hasAnnotatedCode ? 'lg:pr-8' : 'max-w-3xl mx-auto'}`}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {post.chunks.map((chunk, index) => {
                const hasCode = chunk.code.trim().length > 0;
                const nextChunk = post.chunks[index + 1];
                const nextIsProse = nextChunk && nextChunk.code.trim().length === 0;
                const isLastCodeChunk = hasCode && nextIsProse;
                
                return (
                  <BlogChunk 
                    key={index}
                    chunk={chunk} 
                    index={index}
                    isFirst={index === 0}
                    isLastCodeChunk={isLastCodeChunk}
                  />
                );
              })}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}


