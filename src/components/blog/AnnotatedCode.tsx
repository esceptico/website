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
// Markdown components for annotations (compact)
// ============================================

const markdownComponents: Components = {
  h1: ({ children }) => {
    const id = slugify(getTextFromChildren(children));
    return (
      <h1 id={id} className="text-xs font-semibold text-[var(--theme-text-primary)] mb-1 first:mt-0">
        {children}
      </h1>
    );
  },
  h2: ({ children }) => {
    const id = slugify(getTextFromChildren(children));
    return (
      <h2 id={id} className="text-xs font-medium text-[var(--theme-text-primary)] mb-1 first:mt-0">
        {children}
      </h2>
    );
  },
  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-medium text-[var(--theme-text-primary)]">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  code: ({ children }) => <code className="font-jetbrains-mono text-[0.85em]">{children}</code>,
  a: ({ href, children }) => <a href={href} className="underline" target="_blank" rel="noopener noreferrer">{children}</a>,
};

// Full markdown components for intro prose
const fullMarkdownComponents: Components = {
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
    const codeOnly = chunks
      .filter(c => c.code.trim().length > 0)
      .map(c => c.code)
      .join('\n');
    await navigator.clipboard.writeText(codeOnly);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
  if (chunks.length === 0) return null;

  // Separate intro from code chunks
  const introChunks: Chunk[] = [];
  const codeChunks: Chunk[] = [];
  
  let foundCode = false;
  chunks.forEach((chunk) => {
    const hasCode = chunk.code.trim().length > 0;
    if (hasCode) foundCode = true;
    
    if (!foundCode && !hasCode && chunk.doc.trim()) {
      introChunks.push(chunk);
    } else if (hasCode) {
      codeChunks.push(chunk);
    }
  });

  return (
    <div className="my-8">
      {/* Intro prose */}
      {introChunks.map((chunk, i) => (
        <div key={`intro-${i}`} className="mb-6 pb-4 border-b border-[var(--theme-border)]">
          <div className="text-[var(--theme-text-secondary)] leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[[rehypeKatex, { trust: true, strict: false }]]}
              components={fullMarkdownComponents}
            >
              {chunk.doc}
            </ReactMarkdown>
          </div>
        </div>
      ))}

      {/* Side-by-side: code left, annotations right */}
      <div className="relative group/code">
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 z-10 px-2 py-1 text-xs font-mono rounded bg-[var(--theme-bg-primary)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] opacity-0 group-hover/code:opacity-100 hover:text-[var(--theme-text-primary)] transition-all duration-300"
        >
          {copied ? 'copied' : 'copy'}
        </button>

        <div className="flex">
          {/* Code column */}
          <div className="flex-1 min-w-0 overflow-x-auto bg-[var(--theme-text-primary)]/[0.03] rounded-l-lg">
            <pre className="px-4 py-3">
              {codeChunks.map((chunk, i) => {
                const codeHtml = highlightCode(chunk.code, language);
                return (
                  <code 
                    key={i}
                    className="font-jetbrains-mono text-[0.8rem] leading-[1.6] tracking-[-0.01em] block"
                    dangerouslySetInnerHTML={{ __html: codeHtml }}
                  />
                );
              })}
            </pre>
          </div>

          {/* Annotations column - desktop only */}
          <div className="hidden lg:block w-72 flex-shrink-0 relative">
            {/* Vertical connector line */}
            <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-[var(--accent)]/40" />
            
            <div className="py-3 pl-4 space-y-3">
              {codeChunks.map((chunk, i) => {
                const hasDoc = chunk.doc.trim().length > 0;
                if (!hasDoc) return null;
                
                return (
                  <div key={i} className="relative">
                    {/* Horizontal connector */}
                    <div className="absolute -left-4 top-3 w-4 border-t border-dashed border-[var(--accent)]/40" />
                    
                    {/* Annotation box with dashed border */}
                    <div className="border border-dashed border-[var(--accent)]/40 rounded-sm px-3 py-2">
                      <div className="text-[11px] text-[var(--theme-text-muted)] leading-relaxed">
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
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: annotations below */}
        <div className="lg:hidden mt-4 space-y-2">
          {codeChunks
            .filter(c => c.doc.trim())
            .map((chunk, i) => (
              <div key={i} className="border border-dashed border-[var(--accent)]/40 rounded-sm px-3 py-2">
                <div className="text-[11px] text-[var(--theme-text-muted)] leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[[rehypeKatex, { trust: true, strict: false }]]}
                    components={markdownComponents}
                  >
                    {chunk.doc}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
