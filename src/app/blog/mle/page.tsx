'use client';

import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/SectionHeader';
import { CalendarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const mlePosts = [
  {
    id: 1,
    title: 'Optimizing Large Language Models for Production',
    description: 'A deep dive into techniques for optimizing LLMs in production environments, covering quantization, pruning, and efficient deployment strategies.',
    date: '2024-03-15',
    slug: 'optimizing-llm-production'
  },
  {
    id: 2,
    title: 'Understanding Attention Mechanisms',
    description: 'Exploring the fundamentals of attention mechanisms in neural networks and their applications in modern machine learning architectures.',
    date: '2024-03-10',
    slug: 'understanding-attention-mechanisms'
  }
];

function BlogPost({ post, index }: { post: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="mb-8 pb-8 border-b border-[var(--theme-border)] last:border-b-0"
    >
      <Link href={`/blog/mle/${post.slug}`} className="group">
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
        <p className="text-[var(--theme-text-secondary)]">
          {post.description}
        </p>
      </Link>
    </motion.div>
  );
}

export default function MLEBlog() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
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
              title="ML Engineering Blog"
              as="h1" 
              variant="primary" 
              useAccentColor 
            />
            <p className="mt-4 text-[var(--theme-text-secondary)]">
              Exploring machine learning engineering concepts, best practices, and implementation details.
            </p>
          </div>

          <div className="space-y-8">
            {mlePosts.map((post, index) => (
              <BlogPost key={post.id} post={post} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
