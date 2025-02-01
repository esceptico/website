'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mode } from '@/types';
import { BlogPost } from '@/components/blog/BlogPost';
import { Posts } from '@/data/posts';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface BlogPostPageProps {
  mode: Mode;
  posts: Posts[Mode];
}

export function BlogPostPage({ mode, posts }: BlogPostPageProps) {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const post = posts[slug];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!post) {
      router.replace(`/blog/${mode}`);
    }
  }, [post, router, mounted, mode]);

  if (!mounted || !post) {
    return null;
  }

  return (
    <div>
      <BlogPost post={post} mode={mode} />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link 
          href={`/blog/${mode}`}
          className="inline-flex items-center gap-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent-primary)] transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          back
        </Link>
      </div>
    </div>
  );
} 