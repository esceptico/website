import { getAllPosts } from '@/lib/blog';
import { BlogIndexClient } from './BlogIndexClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log | Timur Ganiev',
  description: 'Technical deep dives and annotated implementations',
  alternates: {
    canonical: 'https://timganiev.com/log',
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return <BlogIndexClient posts={posts} />;
}


