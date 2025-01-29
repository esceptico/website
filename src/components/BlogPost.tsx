'use client';

import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/SectionHeader';
import { CalendarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Post {
  id?: number;
  title: string;
  description?: string;
  date: string;
  content?: string;
  slug: string;
}

interface BlogPostProps {
  post: Post;
  mode: string;
  index?: number;
  isPreview?: boolean;
}

export function BlogPost({ post, mode, index = 0, isPreview = false }: BlogPostProps) {
  if (isPreview) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="mb-8 pb-8 border-b border-[var(--theme-border)] last:border-b-0"
      >
        <Link href={`/blog/${mode}/${post.slug}`} className="group">
          <h2 className="text-xl font-semibold mb-2 text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors">
            {post.title}
          </h2>
          <div className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] mb-3">
            <CalendarIcon className="h-4 w-4" />
            <time dateTime={post.date} suppressHydrationWarning>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
          {post.description && (
            <p className="text-[var(--theme-text-secondary)]">
              {post.description}
            </p>
          )}
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-12">
            <SectionHeader 
              title={post.title}
              as="h1" 
              variant="primary" 
              useAccentColor 
            />
            <div className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] mt-4">
              <CalendarIcon className="h-4 w-4" />
              <time dateTime={post.date} suppressHydrationWarning>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert">
            <p className="text-[var(--theme-text-secondary)]">
              {post.content}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 