'use client';

import React, { useMemo, useState } from 'react';
import hljs from 'highlight.js';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Chunk } from '@/lib/docs/types';

interface DocChunkProps {
  chunk: Chunk;
  language: string;
  index: number;
}

function highlightCode(code: string, language: string): string {
  try {
    return hljs.highlight(code, { language }).value;
  } catch {
    return hljs.highlightAuto(code).value;
  }
}

// Generate a URL-friendly slug from text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Extract plain text from React children (handles nested elements)
function getTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (!children) return '';
  
  if (Array.isArray(children)) {
    return children.map(getTextFromChildren).join('');
  }
  
  if (React.isValidElement(children) && children.props?.children) {
    return getTextFromChildren(children.props.children);
  }
  
  return '';
}

// Custom markdown components with anchor ids
function createMarkdownComponents() {
  return {
    h1: ({ children }: { children?: React.ReactNode }) => {
      const text = getTextFromChildren(children);
      const id = slugify(text);
      return (
        <h1 id={id} className="text-2xl font-semibold text-[var(--theme-text-primary)] mb-4 mt-8 first:mt-0">
          {children}
        </h1>
      );
    },
    h2: ({ children }: { children?: React.ReactNode }) => {
      const text = getTextFromChildren(children);
      const id = slugify(text);
      return (
        <h2 id={id} className="text-lg font-medium text-[var(--theme-text-primary)] mb-3 mt-8 first:mt-0">
          {children}
        </h2>
      );
    },
    h3: ({ children }: { children?: React.ReactNode }) => {
      const text = getTextFromChildren(children);
      const id = slugify(text);
      return (
        <h3 id={id} className="text-base font-medium text-[var(--theme-text-primary)] mb-2 mt-6">
          {children}
        </h3>
      );
    },
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-3">{children}</p>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-medium text-[var(--theme-text-primary)]">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em>{children}</em>
    ),
    code: ({ children }: { children?: React.ReactNode }) => (
      <code className="font-jetbrains-mono text-[0.95em] text-[var(--theme-text-primary)]/80">{children}</code>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a href={href} className="hover-link" target="_blank" rel="noopener noreferrer">{children}</a>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="my-3 list-disc list-inside">{children}</ul>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="ml-4">{children}</li>
    ),
  };
}

const markdownComponents = createMarkdownComponents();

export function DocChunk({ chunk, language, index }: DocChunkProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const codeHtml = useMemo(() => highlightCode(chunk.code, language), [chunk.code, language]);

  const hasDoc = chunk.doc.trim().length > 0;
  const hasCode = chunk.code.trim().length > 0;
  
  // Intro chunk: first chunk with doc but no code → render full-width
  const isIntro = index === 0 && hasDoc && !hasCode;

  if (isIntro) {
    return (
      <div
        id={`chunk-${index}`}
        data-chunk-index={index}
        data-chunk-header={chunk.isHeader}
        className="mb-10 pb-8 border-b border-[var(--theme-border)]"
      >
        <div className="text-[0.925rem] text-[var(--theme-text-secondary)] leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={markdownComponents}
          >
            {chunk.doc}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`chunk-${index}`}
      data-chunk-index={index}
      data-chunk-header={chunk.isHeader}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative ${chunk.isHeader ? 'mt-8 pt-4 first:mt-0 first:pt-0' : ''}`}
      style={{
        marginLeft: '-16px',
        marginRight: '-16px',
        padding: '4px 16px',
        borderRadius: '8px',
        backgroundColor: isHovered ? 'rgba(128, 128, 128, 0.08)' : 'transparent',
        transition: 'background-color 0.2s ease',
      }}
    >
      {/* Two column layout - docs first on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
        {/* Code - Left side on desktop, second on mobile */}
        <div className={`py-3 order-2 lg:order-1 ${!hasCode ? 'hidden lg:block opacity-0' : ''}`}>
          {/* Mobile: code gets subtle background to group with doc above */}
          <div className="lg:bg-transparent bg-[var(--theme-text-primary)]/[0.03] -mx-4 px-4 py-2 rounded-lg lg:mx-0 lg:px-0 lg:py-0 lg:rounded-none">
            <pre className="overflow-x-auto">
              <code 
                className="font-jetbrains-mono text-[0.85rem] leading-[1.7] tracking-[-0.01em] block"
                dangerouslySetInnerHTML={{ __html: codeHtml }}
              />
            </pre>
          </div>
        </div>

        {/* Docs - Right side on desktop, first on mobile */}
        <div className={`py-3 order-1 lg:order-2 lg:pl-6 lg:border-l border-[var(--theme-border)] ${!hasDoc ? 'opacity-30' : ''}`}>
          <div className="text-[0.875rem] text-[var(--theme-text-secondary)] leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {chunk.doc}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      
      {/* Mobile separator between chunks */}
      <div className="lg:hidden h-px bg-[var(--theme-border)] my-4 -mx-4" />
    </div>
  );
}
