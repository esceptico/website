'use client';

import { motion } from 'framer-motion';
import type { BlogPost } from '@/lib/blog/types';
import { ReactNode } from 'react';
import { BlogTOC } from './BlogTOC';

interface BlogViewerProps {
  post: BlogPost;
  children: ReactNode;
}

function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function BlogViewer({ post, children }: BlogViewerProps) {
  return (
    <div className="min-h-screen bg-[var(--theme-bg-primary)] relative z-10">
      {/* TOC - fixed on left side */}
      <BlogTOC content={post.content} />

      <main className="overflow-x-hidden">
        <div className="max-w-4xl px-6 lg:px-8 pt-40 pb-92 mx-auto lg:ml-64 xl:mx-auto">
          {/* Meta */}
          <motion.div
            className="flex items-center gap-4 mb-6 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {post.date && <span className="mono-label">{formatDate(post.date)}</span>}
            <span className="mono-label">{post.wordCount.toLocaleString()} words</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-3xl md:text-4xl font-medium text-[var(--theme-text-primary)] mb-16 leading-tight text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            {post.title}
          </motion.h1>

          {/* Content */}
          <div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
