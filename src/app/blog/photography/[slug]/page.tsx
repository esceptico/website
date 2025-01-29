'use client';

import { BlogPostPage } from '@/components/BlogPostPage';
import { posts } from '@/data/posts';

export default function PhotographyBlogPost() {
  return <BlogPostPage mode="photography" posts={posts.photography} />;
} 
