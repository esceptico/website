'use client';

import { motion } from 'framer-motion';
import { DocTOC } from './DocTOC';
import { DocChunk } from './DocChunk';
import type { ParsedDocument } from '@/lib/docs/types';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

interface DocViewerProps {
  document: ParsedDocument;
}

export function DocViewer({ document }: DocViewerProps) {
  return (
    <div className="min-h-screen -mt-16 bg-[var(--theme-bg-primary)] relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--theme-bg-primary)]/90 backdrop-blur-xl border-b border-[var(--theme-border)]">
        <div className="h-14 flex items-center ml-0 lg:ml-56 px-6 lg:px-10" style={{ marginLeft: 'var(--toc-offset, 0)' }}>
          <div className="flex items-center" style={{ marginLeft: '-16px' }}>
            <Link 
              href="/docs" 
              className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors p-2 rounded-md hover:bg-[var(--theme-text-primary)]/5"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <span className="text-sm font-medium text-[var(--theme-text-primary)] ml-1">
              {document.title || document.filename}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* TOC */}
        <DocTOC chunks={document.chunks} />

        {/* Main content */}
        <main className="flex-1 lg:ml-56 overflow-x-hidden">
          <div className="px-6 lg:px-10 pt-8 pb-6 lg:pr-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {document.chunks.map((chunk, index) => (
                <DocChunk 
                  key={index}
                  chunk={chunk} 
                  language={document.language} 
                  index={index} 
                />
              ))}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
