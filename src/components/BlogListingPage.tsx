'use client';

import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/SectionHeader';
import { useEffect, useState } from 'react';
import { BlogPost } from '@/components/BlogPost';
import { Post, Posts } from '@/data/posts';
import { Mode } from '@/types/theme';

interface BlogListingPageProps {
  mode: Mode;
  title: string;
  description: string;
  posts: Posts[Mode];
}

export function BlogListingPage({ mode, title, description, posts }: BlogListingPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
        >
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
            {Object.values(posts).map((post, index) => (
              <BlogPost key={post.id} post={post} index={index} mode={mode} isPreview />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 