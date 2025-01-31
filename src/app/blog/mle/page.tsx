'use client';

import { BlogListingPage } from '@/components/BlogListingPage';
import { posts } from '@/data/posts';

export default function MLEBlog() {
  return (
    <BlogListingPage
      mode="mle"
      title="Engineering Blog"
      description="Exploring machine learning engineering concepts, best practices, and implementation details."
      posts={posts.mle}
    />
  );
} 
