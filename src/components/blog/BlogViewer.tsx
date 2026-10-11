'use client';

import type { BlogPost } from '@/lib/blog/types';
import { ReactNode } from 'react';
import { BlogTOC } from './BlogTOC';
import { PostCover, hasCover } from '@/components/iso/covers';

interface BlogViewerProps {
  post: BlogPost;
  children: ReactNode;
}

function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function BlogViewer({ post, children }: BlogViewerProps) {

  return (
    <div className="min-h-screen bg-[var(--theme-bg-primary)] relative z-10">
      {/* TOC - fixed on left side */}
      <BlogTOC content={post.content} />

      <main className="overflow-x-hidden">
        <div className="max-w-4xl px-6 lg:px-8 pt-28 md:pt-40 pb-92 mx-auto lg:ml-64 xl:mx-auto">
          {/* Meta */}
          <div className="post-in-meta flex items-center gap-4 mb-6 justify-center">
            {post.date && <span className="mono-label">{formatDate(post.date)}</span>}
            <span className="mono-label">{post.wordCount.toLocaleString()} words</span>
          </div>

          {/* Title — rises from below while dissolving in via blur. */}
          <h1 className="post-in-title text-3xl md:text-4xl font-medium text-[var(--theme-text-primary)] mb-16 leading-tight text-center">
            {post.title}
          </h1>

          {/* Cover and body follow the title in, slightly behind it. */}
          <div className="post-in-body">
            {hasCover(post.slug) && (
              <div className="-mt-8 mb-14" aria-hidden="true">
                <PostCover slug={post.slug} />
              </div>
            )}

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
