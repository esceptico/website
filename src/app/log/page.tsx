import { getAllPosts } from '@/lib/blog';
import { BlogIndexClient } from './BlogIndexClient';

export const metadata = {
  title: 'Blog | Timur Ganiev',
  description: 'Technical deep dives and annotated implementations',
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return <BlogIndexClient posts={posts} />;
}


