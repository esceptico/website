'use client';

import { BlogPostPage } from '@/components/BlogPostPage';
import { useParams } from 'next/navigation';
import { Mode } from '@/types/theme';
import { notFound } from 'next/navigation';
import { posts } from '@/data/posts';

export default function DynamicBlogPostPage() {
  const params = useParams();
  const mode = params.mode as Mode;

  if (mode !== 'mle' && mode !== 'photography') {
    notFound();
  }

  return <BlogPostPage mode={mode} posts={posts[mode]} />;
} 