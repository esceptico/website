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
// Markdown components for doc content
// ============================================

const markdownComponents: Components = {
  h1: ({ children }) => {
    const id = slugify(getTextFromChildren(children));
    return (
      <h1 id={id} className="text-xl font-semibold text-[var(--theme-text-primary)] mb-3 mt-6 first:mt-0">
        {children}
      </h1>
    );
  },
  h2: ({ children }) => {
    const id = slugify(getTextFromChildren(children));
    return (
      <h2 id={id} className="text-lg font-medium text-[var(--theme-text-primary)] mb-2 mt-5 first:mt-0">
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const id = slugify(getTextFromChildren(children));
    return (
      <h3 id={id} className="text-base font-medium text-[var(--theme-text-primary)] mb-2 mt-4">
        {children}
      </h3>
    );
  },
  p: ({ children }) => <p className="mb-2">{children}</p>,
  strong: ({ children }) => <strong className="font-medium text-[var(--theme-text-primary)]">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  code: ({ children }) => <code className="font-jetbrains-mono text-[0.9em] text-[var(--theme-text-primary)]/80 bg-[var(--theme-text-primary)]/5 px-1 py-0.5 rounded">{children}</code>,
  a: ({ href, children }) => <a href={href} className="hover-link" target="_blank" rel="noopener noreferrer">{children}</a>,
  ul: ({ children }) => <ul className="my-2 list-disc list-inside">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal list-inside">{children}</ol>,
  li: ({ children }) => <li className="ml-2">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 pl-3 border-l-2 border-[var(--theme-text-secondary)]/30 text-[var(--theme-text-secondary)] italic">
      {children}
    </blockquote>
  ),
};

// ============================================
// Single chunk renderer
// ============================================

interface ChunkProps {
  chunk: Chunk;
  index: number;
  isFirst: boolean;
  isLastCodeChunk: boolean;
  language: string;
}

function AnnotatedCodeChunk({ chunk, index, isFirst, isLastCodeChunk, language }: ChunkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const codeHtml = useMemo(() => highlightCode(chunk.code, language), [chunk.code, language]);

  const hasDoc = chunk.doc.trim().length > 0;
  const hasCode = chunk.code.trim().length > 0;

  // Prose-only chunk
  if (hasDoc && !hasCode) {
    return (
      <div
        id={`chunk-${index}`}
        data-chunk-index={index}
        className={isFirst ? "mb-8 pb-6 border-b border-[var(--theme-border)]" : "mb-4"}
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

  // Code-only chunk
  if (!hasDoc && hasCode) {
    return (
      <div id={`chunk-${index}`} data-chunk-index={index} className="my-3">
        <div className="bg-[var(--theme-text-primary)]/[0.03] rounded-lg px-4 py-3 overflow-x-auto">
          <pre className="whitespace-pre">
            <code 
              className="font-jetbrains-mono text-[0.85rem] leading-[1.7] tracking-[-0.01em] block"
              dangerouslySetInnerHTML={{ __html: codeHtml }}
            />
          </pre>
        </div>
      </div>
    );
  }

  // Side-by-side: doc + code
  return (
    <>
      <div
        id={`chunk-${index}`}
        data-chunk-index={index}
        data-chunk-header={chunk.isHeader}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative transition-colors duration-200 rounded-lg ${chunk.isHeader ? 'mt-6 pt-3 first:mt-0 first:pt-0' : ''}`}
        style={{
          padding: '8px 0',
          backgroundColor: isHovered ? 'rgba(128, 128, 128, 0.06)' : 'transparent',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Code - Left on desktop, bottom on mobile */}
          <div className={`order-2 lg:order-1 min-w-0 ${!hasCode ? 'hidden lg:block opacity-0' : ''}`}>
            <div className="bg-[var(--theme-text-primary)]/[0.03] rounded-lg px-4 py-3 lg:bg-transparent lg:p-0 lg:rounded-none overflow-x-auto">
              <pre className="whitespace-pre">
                <code 
                  className="font-jetbrains-mono text-[0.85rem] leading-[1.7] tracking-[-0.01em] block"
                  dangerouslySetInnerHTML={{ __html: codeHtml }}
                />
              </pre>
            </div>
          </div>

          {/* Docs - Right on desktop, top on mobile */}
          <div className={`order-1 lg:order-2 lg:pl-6 lg:border-l border-[var(--theme-border)] ${!hasDoc ? 'opacity-30' : ''}`}>
            <div className="text-[0.875rem] text-[var(--theme-text-secondary)] leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[[rehypeKatex, { trust: true, strict: false }]]}
                components={markdownComponents}
              >
                {chunk.doc}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile separator */}
      <div className="lg:hidden h-px bg-[var(--theme-border)] my-4" />
      
      {/* Separator after code section ends */}
      {isLastCodeChunk && (
        <div className="hidden lg:block h-px bg-[var(--theme-border)] mt-6 mb-4" />
      )}
    </>
  );
}

// ============================================
// Main AnnotatedCode component
// ============================================

interface AnnotatedCodeProps {
  code: string;
  language: string;
}

export function AnnotatedCode({ code, language }: AnnotatedCodeProps) {
  // Trim leading/trailing whitespace from template strings
  const trimmedCode = code.trim();
  const chunks = useMemo(() => parseAnnotatedCode(trimmedCode), [trimmedCode]);
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(trimmedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
  if (chunks.length === 0) return null;
  
  return (
    <div className="my-8 relative group/code">
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 px-2 py-1 text-xs font-mono rounded bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] opacity-0 group-hover/code:opacity-100 hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-text-secondary)] transition-all duration-300"
      >
        {copied ? 'copied' : 'copy'}
      </button>

      {chunks.map((chunk, index) => {
        const hasCode = chunk.code.trim().length > 0;
        const nextChunk = chunks[index + 1];
        const nextIsProse = nextChunk && nextChunk.code.trim().length === 0;
        const isLastCodeChunk = hasCode && (nextIsProse || index === chunks.length - 1);
        
        return (
          <AnnotatedCodeChunk
            key={index}
            chunk={chunk}
            index={index}
            isFirst={index === 0}
            isLastCodeChunk={isLastCodeChunk}
            language={language}
          />
        );
      })}
    </div>
  );
}

