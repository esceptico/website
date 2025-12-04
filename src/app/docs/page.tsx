'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { getAllDocs } from '@/lib/docs';
import { FaCode, FaArrowLeft } from 'react-icons/fa';

export default function DocsIndexPage() {
  const docs = getAllDocs();

  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-3 mb-4"
        >
          <Link 
            href="/" 
            className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors p-2 -ml-2 rounded-md hover:bg-[var(--theme-text-primary)]/5"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <FaCode className="w-4 h-4 text-[var(--theme-text-secondary)]" />
          <span className="text-sm font-mono uppercase tracking-wider text-[var(--theme-text-secondary)]">
            Annotated Code
          </span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-3xl md:text-4xl font-normal text-[var(--theme-text-primary)] tracking-tight mb-4"
        >
          Documentation
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[var(--theme-text-secondary)] text-lg"
        >
          Deep dives into implementations with side-by-side explanations.
        </motion.p>
      </div>

      {/* Doc entries */}
      <div className="space-y-4">
        {docs.map((doc, index) => (
          <motion.div
            key={doc.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
          >
            <Link href={`/docs/${doc.slug}`} className="group block">
              <div className="relative pl-6 py-5 border-l-2 border-[var(--theme-border)] hover:border-[var(--theme-text-primary)] transition-colors duration-300">
                {/* Date */}
                {doc.date && (
                  <div className="text-xs font-mono text-[var(--theme-text-secondary)] mb-2">
                    {new Date(doc.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                )}
                
                {/* Title */}
                <h2 className="text-lg font-medium text-[var(--theme-text-primary)] mb-1">
                  {doc.title}
                </h2>
                
                {/* Description */}
                {doc.description && (
                  <p className="text-sm text-[var(--theme-text-secondary)] line-clamp-2">
                    {doc.description}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {docs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center py-16 text-[var(--theme-text-secondary)]"
        >
          No documentation available yet.
        </motion.div>
      )}
    </motion.div>
  );
}
