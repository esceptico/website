'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';
import { SectionHeader } from '@/components/SectionHeader';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

export default function BlogPost() {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const router = useRouter();
  const mode = useThemeStore((state) => state.mode);
  const slug = params.slug as string;
  const post = allPosts[slug as keyof typeof allPosts];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!post) {
      router.replace('/blog');
      return;
    }
    if (post.mode !== mode) {
      router.replace(`/blog/${mode}`);
    }
  }, [post, mode, router, mounted]);

  if (!mounted || !post) {
    return null;
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
