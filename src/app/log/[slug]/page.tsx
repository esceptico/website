import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { BlogViewer } from '@/components/blog/BlogViewer';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/blog/mdx-components';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';

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

  // JSON-LD Article structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary || `${post.title} - a deep dive`,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'Timur Ganiev',
      url: 'https://timganiev.com',
    },
    publisher: {
      '@type': 'Person',
      name: 'Timur Ganiev',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://timganiev.com/log/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogViewer post={post}>
        <MDXRemote 
          source={post.content} 
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkMath],
              rehypePlugins: [[rehypeKatex, { trust: true, strict: false }]],
              remarkRehypeOptions: { footnoteLabel: ' ', footnoteLabelTagName: 'span' },
            },
            blockJS: false,
          }}
        />
      </BlogViewer>
    </>
  );
}


