'use client';

import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/SectionHeader';
import { CalendarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useThemeStore } from '@/store/theme';

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

const photoPosts = [
  {
    id: 1,
    title: 'Finding Light in Urban Landscapes',
    description: 'Tips and techniques for capturing compelling urban photography, with a focus on natural and artificial lighting.',
    date: '2024-03-12',
    slug: 'urban-light-photography'
  },
  {
    id: 2,
    title: 'The Art of Street Photography',
    description: 'A guide to capturing authentic moments in street photography, including composition techniques and ethical considerations.',
    date: '2024-03-08',
    slug: 'street-photography-guide'
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
      <Link href={`/blog/${post.slug}`} className="group">
        <h2 className="text-xl font-semibold mb-2 text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors">
          {post.title}
        </h2>
        <div className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] mb-3">
          <CalendarIcon className="h-4 w-4" />
          <time dateTime={post.date}>
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

export default function Blog() {
  const mode = useThemeStore(state => state.mode);
  
  const posts = mode === 'mle' ? mlePosts : photoPosts;
  const title = mode === 'mle' ? 'ML Engineering Blog' : 'Photography Blog';
  const description = mode === 'mle' 
    ? 'Exploring machine learning engineering concepts, best practices, and implementation details.'
    : 'A collection of photography insights, techniques, and personal experiences.';

  return (
    <div className="min-h-screen p-8 bg-[var(--theme-bg-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <SectionHeader 
            title={title}
            as="h1" 
            variant="primary" 
            useAccentColor 
          />
          <p className="mt-4 text-[var(--theme-text-secondary)]">
            {description}
          </p>
        </div>

        <div className="space-y-8">
          {posts.map((post, index) => (
            <BlogPost key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
} 
