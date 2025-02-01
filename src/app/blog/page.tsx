'use client';

import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/theme';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

function BlogPost({ post, index, mode }: { post: any; index: number; mode: string }) {
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
        <p className="text-[var(--theme-text-secondary)]">
          {post.description}
        </p>
      </Link>
    </motion.div>
  );
}

export default function Blog() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      router.replace(`/blog/${mode}`);
    }
  }, [mode, mounted, router]);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 0 : 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-12">
            <div className="h-12 bg-[var(--theme-text-secondary)] opacity-20 rounded w-48" />
          </div>
          <div className="space-y-8">
            <div className="h-32 bg-[var(--theme-text-secondary)] opacity-20 rounded" />
            <div className="h-32 bg-[var(--theme-text-secondary)] opacity-20 rounded" />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
