'use client';

import { motion } from 'framer-motion';
import type { BlogPost } from '@/lib/blog/types';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa';
import { ReactNode } from 'react';
import { BlogTOC } from './BlogTOC';

interface BlogViewerProps {
  post: BlogPost;
  children: ReactNode;
}

const smoothEase = [0.16, 1, 0.3, 1]; // Expo-like ease out

export function BlogViewer({ post, children }: BlogViewerProps) {
  return (
    <div className="min-h-screen -mt-16 bg-[var(--theme-bg-primary)] relative z-10">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-30 bg-[var(--theme-bg-primary)]/90 backdrop-blur-xl border-b border-[var(--theme-border)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: smoothEase }}
      >
        <div className="h-14 flex items-center px-4 lg:px-10 pr-24 sm:pr-20">
          <nav className="flex items-center gap-2 text-sm min-w-0">
            <Link 
              href="/" 
              className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors shrink-0"
            >
              home
            </Link>
            <FaChevronRight className="w-2 h-2 text-[var(--theme-text-secondary)]/50 shrink-0" />
            <Link 
              href="/log" 
              className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors shrink-0"
            >
              log
            </Link>
            <FaChevronRight className="w-2 h-2 text-[var(--theme-text-secondary)]/50 shrink-0" />
            <span className="text-[var(--theme-text-primary)] font-medium truncate max-w-[150px] sm:max-w-[250px] lg:max-w-none">
              {post.title}
            </span>
          </nav>
        </div>
      </motion.header>

      <div className="flex">
        {/* TOC */}
        <BlogTOC content={post.content} />

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden lg:ml-56">
          <div className="px-6 lg:px-10 pt-8 pb-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: smoothEase }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
