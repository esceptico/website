'use client';

import React, { useMemo, useState } from 'react';
import hljs from 'highlight.js';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { parseAnnotatedCode } from '@/lib/blog/parse';
import type { Chunk } from '@/lib/blog/types';
import './syntax-highlighting.css';

// ============================================
// Utilities
// ============================================

function highlightCode(code: string, language: string): string {
  return hljs.highlight(code, { language }).value;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (!children) return '';
  if (Array.isArray(children)) return children.map(getTextFromChildren).join('');
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    return props.children ? getTextFromChildren(props.children) : '';
  }
  return '';
}

// ============================================
// Markdown components for annotations
// ============================================

const markdownComponents: Components = {
  h1: ({ children }) => {
    const id = slugify(getTextFromChildren(children));
    return (
      <h1 id={id} className="text-lg font-medium text-[var(--theme-text-primary)] mb-2 mt-4 first:mt-0">
        {children}
      </h1>
    );
  },
  h2: ({ children }) => {
    const id = slugify(getTextFromChildren(children));
    return (
      <h2 id={id} className="text-base font-medium text-[var(--theme-text-primary)] mb-1.5 mt-3 first:mt-0">
        {children}
      </h2>
    );
  },
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-medium text-[var(--theme-text-primary)]">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  code: ({ children }) => <code className="font-jetbrains-mono text-[0.9em] text-[var(--theme-text-primary)]/80 bg-[var(--theme-text-primary)]/5 px-1 py-0.5 rounded">{children}</code>,
  a: ({ href, children }) => <a href={href} className="hover-link" target="_blank" rel="noopener noreferrer">{children}</a>,
  ul: ({ children }) => <ul className="my-2 list-disc list-inside">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal list-inside">{children}</ol>,
  li: ({ children }) => <li className="ml-2">{children}</li>,
};

// ============================================
// Main AnnotatedCode component
// ============================================

interface AnnotatedCodeProps {
  code: string;
  language: string;
}

export function AnnotatedCode({ code, language }: AnnotatedCodeProps) {
  const trimmedCode = code.trim();
  const chunks = useMemo(() => parseAnnotatedCode(trimmedCode), [trimmedCode]);
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(trimmedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
  if (chunks.length === 0) return null;

  // Count code chunks for markers
  let codeMarker = 0;

  return (
    <div className="my-8 relative group/code">
      {chunks.map((chunk, index) => {
        const hasDoc = chunk.doc.trim().length > 0;
        const hasCode = chunk.code.trim().length > 0;
        const codeHtml = hasCode ? highlightCode(chunk.code, language) : '';
        
        if (hasCode) codeMarker++;
        const currentMarker = hasCode ? codeMarker : null;

        // Prose-only chunk (intro or section header)
        if (hasDoc && !hasCode) {
          return (
            <div
              key={index}
              className={`${index === 0 ? 'mb-6 pb-4 border-b border-[var(--theme-border)]' : 'my-6'}`}
            >
              <div className="text-[var(--theme-text-secondary)] leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[[rehypeKatex, { trust: true, strict: false }]]}
                  components={markdownComponents}
                >
                  {chunk.doc}
                </ReactMarkdown>
              </div>
            </div>
          );
        }

        // Code with annotation - interleaved
        if (hasCode) {
          return (
            <div key={index} className="my-4">
              {/* Annotation above code */}
              {hasDoc && (
                <div className="flex gap-3 mb-2">
                  {/* Marker */}
                  <span className="font-mono text-[10px] text-[var(--accent)] opacity-60 select-none flex-shrink-0 pt-1">
                    {String(currentMarker).padStart(2, '0')}
                  </span>
                  {/* Annotation text */}
                  <div className="text-[0.875rem] text-[var(--theme-text-secondary)] leading-relaxed border-l-2 border-[var(--accent)]/30 pl-3">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[[rehypeKatex, { trust: true, strict: false }]]}
                      components={markdownComponents}
                    >
                      {chunk.doc}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              
              {/* Code block */}
              <div className="relative group/codeblock bg-[var(--theme-text-primary)]/[0.03] rounded-lg overflow-x-auto">
                {/* Copy button only on first code block */}
                {currentMarker === 1 && (
                  <button
                    onClick={handleCopy}
                    title="Copy all annotated code"
                    className="absolute top-2 right-2 px-2 py-1 text-xs font-mono rounded bg-[var(--theme-bg-primary)]/80 backdrop-blur-sm border border-[var(--theme-border)] text-[var(--theme-text-muted)] opacity-0 group-hover/codeblock:opacity-100 hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-text-muted)] transition-opacity duration-150"
                  >
                    {copied ? 'copied!' : 'copy all'}
                  </button>
                )}
                <pre className="px-4 py-3">
                  <code 
                    className="font-jetbrains-mono text-[0.85rem] leading-[1.7] tracking-[-0.01em] block"
                    dangerouslySetInnerHTML={{ __html: codeHtml }}
                  />
                </pre>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
