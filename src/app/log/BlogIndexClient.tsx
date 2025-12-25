'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaCode, FaChevronRight } from 'react-icons/fa';
import type { BlogMeta } from '@/lib/blog/types';

interface BlogIndexClientProps {
  posts: BlogMeta[];
}

function formatPostDate(date: string): string {
  // Make formatting deterministic across server/client timezones
  const d = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

export function BlogIndexClient({ posts }: BlogIndexClientProps) {
  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 text-base mb-8"
      >
        <Link 
          href="/" 
          className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors"
        >
          home
        </Link>
        <FaChevronRight className="w-2 h-2 text-[var(--theme-text-secondary)]/50" />
        <span className="text-[var(--theme-text-primary)]">log</span>
      </motion.nav>

      {/* Post entries */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
          >
            <Link href={`/log/${post.slug}`} className="group block">
              <div className="relative pl-6 py-5 border-l-2 border-[var(--theme-border)] hover:border-[var(--theme-text-primary)] transition-colors duration-300">
                {/* Meta line: date + code indicator */}
                <div className="flex items-center gap-3 mb-2">
                  {post.date && (
                    <span className="text-xs font-mono text-[var(--theme-text-secondary)]">
                      {formatPostDate(post.date)}
                    </span>
                  )}
                  {post.hasAnnotatedCode && (
                    <span className="flex items-center gap-1 text-xs text-[var(--theme-text-secondary)]/60">
                      <FaCode className="w-3 h-3" />
                      <span>code</span>
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <h2 className="text-lg font-medium text-[var(--theme-text-primary)] mb-1">
                  {post.title}
                </h2>
                
                {/* Summary */}
                {post.summary && (
                  <p className="text-sm text-[var(--theme-text-secondary)] line-clamp-2">
                    {post.summary}
                  </p>
                )}
                
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center py-16 text-[var(--theme-text-secondary)]"
        >
          No posts yet.
        </motion.div>
      )}
    </motion.div>
  );
}


