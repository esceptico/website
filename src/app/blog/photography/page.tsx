'use client';

import { BlogListingPage } from '@/components/BlogListingPage';
import { posts } from '@/data/posts';

export default function PhotographyBlog() {
  return (
    <BlogListingPage
      mode="photography"
      title="Photography Blog"
      description="A collection of photography insights, techniques, and personal experiences."
      posts={posts.photography}
    />
  );
} 
