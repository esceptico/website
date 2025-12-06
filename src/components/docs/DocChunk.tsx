'use client';

import React, { useMemo, useState } from 'react';
import hljs from 'highlight.js';
import ReactMarkdown, { Components } from 'react-markdown';
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
  
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    if (props.children) {
      return getTextFromChildren(props.children);
    }
  }
  
  return '';
}

// Custom markdown components
// Only define components that need custom styling/behavior - others use defaults
const markdownComponents: Components = {
  h1: ({ children }) => {
    const text = getTextFromChildren(children);
    const id = slugify(text);
    return (
      <h1 id={id} className="text-2xl font-semibold text-[var(--theme-text-primary)] mb-4 mt-8 first:mt-0">
        {children}
      </h1>
    );
  },
  h2: ({ children }) => {
    const text = getTextFromChildren(children);
    const id = slugify(text);
    return (
      <h2 id={id} className="text-lg font-medium text-[var(--theme-text-primary)] mb-3 mt-8 first:mt-0">
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const text = getTextFromChildren(children);
    const id = slugify(text);
    return (
      <h3 id={id} className="text-base font-medium text-[var(--theme-text-primary)] mb-2 mt-6">
        {children}
      </h3>
    );
  },
  p: ({ children }) => <p className="mb-3">{children}</p>,
  strong: ({ children }) => <strong className="font-medium text-[var(--theme-text-primary)]">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  code: ({ children }) => <code className="font-jetbrains-mono text-[0.95em] text-[var(--theme-text-primary)]/80">{children}</code>,
  a: ({ href, children }) => <a href={href} className="hover-link" target="_blank" rel="noopener noreferrer">{children}</a>,
  ul: ({ children }) => <ul className="my-3 list-disc list-inside">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal list-inside">{children}</ol>,
  li: ({ children }) => <li className="ml-4">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 pl-4 border-l-2 border-[var(--theme-text-secondary)]/30 text-[var(--theme-text-secondary)] italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-[var(--theme-border)]" />,
  pre: ({ children }) => <pre className="my-3 overflow-x-auto">{children}</pre>,
};

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
        className="mb-10 pb-8 border-b border-[var(--theme-border)] px-4 lg:px-8"
      >
        <div className="text-md text-[var(--theme-text-secondary)] leading-relaxed">
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
