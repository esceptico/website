'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowLeft, FaCode, FaFeatherAlt } from 'react-icons/fa';
import type { BlogMeta } from '@/lib/blog';

interface BlogIndexClientProps {
  posts: BlogMeta[];
}

export function BlogIndexClient({ posts }: BlogIndexClientProps) {
  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-3 mb-4"
        >
          <Link 
            href="/" 
            className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors p-2 -ml-2 rounded-md hover:bg-[var(--theme-text-primary)]/5"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <FaFeatherAlt className="w-4 h-4 text-[var(--theme-text-secondary)]" />
          <span className="text-sm font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]">
            Blog
          </span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-3xl md:text-4xl font-normal text-[var(--theme-text-primary)] tracking-tight mb-4"
        >
          Log
        </motion.h1>
        
      </div>

      {/* Post entries */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
          >
            <Link href={`/blog/${post.slug}`} className="group block">
              <div className="relative pl-6 py-5 border-l-2 border-[var(--theme-border)] hover:border-[var(--theme-text-primary)] transition-colors duration-300">
                {/* Meta line: date + code indicator */}
                <div className="flex items-center gap-3 mb-2">
                  {post.date && (
                    <span className="text-xs font-mono text-[var(--theme-text-secondary)]">
                      {new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  )}
                  {post.hasCode && (
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


