'use client';

import { BlogPostPage } from '@/components/BlogPostPage';
import { posts } from '@/data/posts';

export default function MLEBlogPost() {
  return <BlogPostPage mode="mle" posts={posts.mle} />;
} 
