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

  const title = `${post.title} | Timur Ganiev`;
  const description = post.summary || `${post.title} - a deep dive`;
  const url = `https://timganiev.com/log/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: post.date,
      authors: ['Timur Ganiev'],
      siteName: 'Timur Ganiev',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
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


