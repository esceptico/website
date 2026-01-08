'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaCode, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import type { BlogMeta } from '@/lib/blog/types';

interface BlogIndexClientProps {
  posts: BlogMeta[];
}

// Fixed height per post card - enforced via CSS
const POST_HEIGHT = 100;
const POST_GAP = 8;

function formatPostDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

interface PostCardProps {
  post: BlogMeta;
  index: number;
}

function PostCard({ post, index }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ 
        duration: 0.35,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1]
      }}
      style={{ height: POST_HEIGHT }}
      className="overflow-hidden"
    >
      <Link href={`/log/${post.slug}`} className="group block h-full">
        <div className="relative pl-6 py-3 h-full border-l-2 border-[var(--theme-border)] hover:border-[var(--theme-text-primary)] transition-colors duration-300">
          <div className="flex items-center gap-3 mb-1">
            {post.date && (
              <span className="text-xs font-mono text-[var(--theme-text-secondary)]">
                {formatPostDate(post.date)}
              </span>
            )}
            {post.hasAnnotatedCode && (
              <span className="flex items-center gap-1 text-xs text-[var(--theme-text-secondary)]/60">
                <FaCode className="w-3 h-3" />
                <span>code</span>
              </span>
            )}
          </div>
          
          <h2 className="text-lg font-medium text-[var(--theme-text-primary)] mb-1 leading-tight">
            {post.title}
          </h2>
          
          {post.summary && (
            <p className="text-sm text-[var(--theme-text-secondary)] line-clamp-1">
              {post.summary}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export function BlogIndexClient({ posts }: BlogIndexClientProps) {
  const postsAreaRef = useRef<HTMLDivElement>(null);
  const [postsPerPage, setPostsPerPage] = useState(posts.length);
  const [page, setPage] = useState(0);
  
  // Measure actual available space and calculate posts per page
  useEffect(() => {
    const calculate = () => {
      if (!postsAreaRef.current) return;
      const available = postsAreaRef.current.clientHeight;
      const postTotalHeight = POST_HEIGHT + POST_GAP;
      const count = Math.max(1, Math.floor(available / postTotalHeight));
      setPostsPerPage(Math.min(count, posts.length));
    };
    
    requestAnimationFrame(calculate);
    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, [posts.length]);
  
  const totalPages = Math.ceil(posts.length / postsPerPage);
  
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);
  
  const currentPosts = posts.slice(
    page * postsPerPage,
    (page + 1) * postsPerPage
  );

  const goNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const goPrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const showPagination = totalPages > 1;

  return (
    <div className="fixed inset-0 top-16 overflow-hidden">
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col py-6">
        {/* Header row - breadcrumb left, pagination right */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-base"
          >
            <Link 
              href="/" 
              className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors"
            >
              home
            </Link>
            <FaChevronRight className="w-2 h-2 text-[var(--theme-text-secondary)]/50" />
            <span className="text-[var(--theme-text-primary)]">log</span>
          </motion.nav>

          {/* Pagination controls - aligned with breadcrumb */}
          {showPagination && (
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={goPrev}
                disabled={page === 0}
                className="flex items-center gap-1.5 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] disabled:opacity-30 transition-all duration-200"
              >
                <FaChevronLeft className="w-2.5 h-2.5" />
                <span>prev</span>
              </button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      i === page 
                        ? 'bg-[var(--theme-text-primary)] scale-125' 
                        : 'bg-[var(--theme-border)] hover:bg-[var(--theme-text-secondary)]'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={goNext}
                disabled={page === totalPages - 1}
                className="flex items-center gap-1.5 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] disabled:opacity-30 transition-all duration-200"
              >
                <span>next</span>
                <FaChevronRight className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Posts area - fills remaining space */}
        <div 
          ref={postsAreaRef} 
          className="flex-1 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              className="flex flex-col"
              style={{ gap: POST_GAP }}
            >
              {currentPosts.map((post, index) => (
                <PostCard key={post.slug} post={post} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-16 text-[var(--theme-text-secondary)]"
          >
            No posts yet.
          </motion.div>
        )}
      </div>
    </div>
  );
}
