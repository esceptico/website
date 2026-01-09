'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { BlogMeta } from '@/lib/blog/types';

interface BlogIndexClientProps {
  posts: BlogMeta[];
}

function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function BlogIndexClient({ posts }: BlogIndexClientProps) {
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16 relative">
        {/* Header */}
        <div className="mb-8">
          <span className="mono-label">{posts.length} entries</span>
        </div>

        {/* Posts */}
        <div className="flex flex-col">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <Link 
                href={`/log/${post.slug}`} 
                className="group block py-4 border-b border-[var(--theme-border)]"
              >
                <div className="flex items-baseline justify-between gap-4 mb-1">
                  <h2 className="text-base text-[var(--theme-text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {post.title}
                  </h2>
                  {post.date && (
                    <span className="mono-label shrink-0">{formatDate(post.date)}</span>
                  )}
                </div>
                {post.summary && (
                  <p className="text-sm text-[var(--theme-text-muted)] line-clamp-2">
                    {post.summary}
                  </p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <span className="mono-label">no entries yet</span>
          </div>
        )}
      </div>
    </div>
  );
}
