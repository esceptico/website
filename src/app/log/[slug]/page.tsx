import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { BlogViewer } from '@/components/blog/BlogViewer';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return { title: 'Not Found' };
  }

  return {
    title: `${post.title} | Timur Ganiev`,
    description: post.summary || `${post.title} - a deep dive`,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogViewer post={post} />;
}


