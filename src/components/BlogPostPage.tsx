'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BlogPost } from '@/components/BlogPost';
import { Posts } from '@/data/posts';
import { Mode } from '@/types/theme';

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

  return <BlogPost post={post} mode={mode} />;
} 