'use client';

import { BlogListingPage } from '@/components/BlogListingPage';
import { useParams } from 'next/navigation';
import { Mode } from '@/types/theme';
import { notFound } from 'next/navigation';
import { posts } from '@/data/posts';

const titles = {
  mle: "Engineering Blog",
  photography: "Photography Blog"
} as const;

const descriptions = {
  mle: "Exploring machine learning engineering concepts, best practices, and implementation details.",
  photography: "A collection of photography insights, techniques, and personal experiences."
} as const;

export default function DynamicBlogPage() {
  const params = useParams();
  const mode = params.mode as Mode;

  if (mode !== 'mle' && mode !== 'photography') {
    notFound();
  }

  return (
    <BlogListingPage
      mode={mode}
      title={titles[mode]}
      description={descriptions[mode]}
      posts={posts[mode]}
    />
  );
} 