'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';
import { SectionHeader } from '@/components/SectionHeader';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This would typically come from a CMS or database
const allPosts = {
  'optimizing-llm-production': {
    title: 'Optimizing Large Language Models for Production',
    date: '2024-03-15',
    content: `
      Content for optimizing LLMs article would go here.
      This is just a placeholder for now.
      In a real application, this would be fetched from a CMS or database.
    `,
    mode: 'mle'
  },
  'understanding-attention-mechanisms': {
    title: 'Understanding Attention Mechanisms',
    date: '2024-03-10',
    content: `
      Content for attention mechanisms article would go here.
      This is just a placeholder for now.
      In a real application, this would be fetched from a CMS or database.
    `,
    mode: 'mle'
  },
  'urban-light-photography': {
    title: 'Finding Light in Urban Landscapes',
    date: '2024-03-12',
    content: `
      Content for urban photography article would go here.
      This is just a placeholder for now.
      In a real application, this would be fetched from a CMS or database.
    `,
    mode: 'photography'
  },
  'street-photography-guide': {
    title: 'The Art of Street Photography',
    date: '2024-03-08',
    content: `
      Content for street photography article would go here.
      This is just a placeholder for now.
      In a real application, this would be fetched from a CMS or database.
    `,
    mode: 'photography'
  }
} as const;

type PostSlug = keyof typeof allPosts;

export default function BlogPost() {
  const mode = useThemeStore(state => state.mode);
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as PostSlug;
  const post = allPosts[slug];

  useEffect(() => {
    if (post && post.mode !== mode) {
      router.push('/blog');
    }
  }, [post, mode, router]);

  if (!post || post.mode !== mode) {
    return (
      <div className="min-h-screen p-8 bg-[var(--theme-bg-primary)]">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-[var(--theme-text-primary)]">Post not found</h1>
          <p className="mt-4 text-[var(--theme-text-secondary)]">
            This post doesn't exist or isn't available in the current mode.
          </p>
          <div className="mt-8">
            <a
              href="/blog"
              className="inline-flex items-center text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent-primary)] transition-colors"
            >
              ← Back to blog
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-[var(--theme-bg-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <SectionHeader 
              title={post.title}
              as="h1" 
              variant="primary" 
              useAccentColor 
            />
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--theme-text-secondary)]">
              <CalendarIcon className="h-4 w-4" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert prose-primary max-w-none">
            <p className="text-[var(--theme-text-secondary)]">
              {post.content}
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-[var(--theme-border)]">
            <a
              href="/blog"
              className="inline-flex items-center text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent-primary)] transition-colors"
            >
              ← Back to blog
            </a>
          </div>
        </motion.article>
      </div>
    </div>
  );
} 
