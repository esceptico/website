import React from 'react';
import hljs from 'highlight.js';
import { AnnotatedCode } from './AnnotatedCode';
import { AlphaSlider } from './interactive/AlphaSlider';
import { Plot } from './interactive/Plot';
import { LinkedFormula, Term } from './interactive/LinkedFormula';
import { CodeBlockWithCopy } from './interactive/CodeBlockWithCopy';
import { Gallery } from './interactive/Gallery';
import { Video } from './interactive/Video';
import { Flicker } from './interactive/Flicker';
import { Decay } from './interactive/Decay';
import { HeadingWithAnchor } from './interactive/HeadingWithAnchor';
import { isAnnotatedPython } from '@/lib/blog/parse';
import type { MDXComponents } from 'mdx/types';
import './syntax-highlighting.css';

// ============================================
// Utility functions
// ============================================

function highlightCode(code: string, language: string = 'text'): string {
  try {
    return hljs.highlight(code, { language }).value;
  } catch {
    return hljs.highlightAuto(code).value;
  }
}

function slugify(text: unknown): string {
  const str = typeof text === 'string' ? text : String(text || '');
  return str
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
// Code Block Component (auto-detects annotated Python)
// ============================================

function CodeBlock({ code, language }: { code: string; language: string }) {
  const trimmedCode = code.trim();
  
  // Auto-detect annotated Python in fenced code blocks
  if ((language === 'python' || language === 'py') && isAnnotatedPython(trimmedCode)) {
    return <AnnotatedCode code={trimmedCode} language={language} />;
  }
  
  // Regular code block with copy button
  const codeHtml = highlightCode(trimmedCode, language);
  
  return <CodeBlockWithCopy code={trimmedCode} codeHtml={codeHtml} />;
}

// ============================================
// MDX Components
// ============================================

export const mdxComponents: MDXComponents = {
  h1: (props) => {
    const id = slugify(getTextFromChildren(props.children));
    return (
      <HeadingWithAnchor as="h1" id={id} className="text-2xl font-semibold text-[var(--theme-text-primary)] mb-4 mt-8 first:mt-0">
        {props.children}
      </HeadingWithAnchor>
    );
  },
  
  h2: (props) => {
    const id = slugify(getTextFromChildren(props.children));
    return (
      <HeadingWithAnchor as="h2" id={id} className="text-lg font-medium text-[var(--theme-text-primary)] mb-3 mt-8 first:mt-0">
        {props.children}
      </HeadingWithAnchor>
    );
  },
  
  h3: (props) => {
    const id = slugify(getTextFromChildren(props.children));
    return (
      <HeadingWithAnchor as="h3" id={id} className="text-base font-medium text-[var(--theme-text-primary)] mb-2 mt-6">
        {props.children}
      </HeadingWithAnchor>
    );
  },
  
  p: (props) => <p className="mb-3 text-[var(--theme-text-secondary)] leading-relaxed" {...props} />,
  
  strong: (props) => <strong className="font-medium text-[var(--theme-text-primary)]" {...props} />,
  
  em: (props) => <em {...props} />,
  
  a: (props) => {
    const href = (props as { href?: string }).href || '';
    const isExternal = href.startsWith('http') || href.startsWith('//');
    return <a className="hover-link" {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...props} />;
  },
  
  ul: (props) => <ul className="my-3 list-disc list-inside text-[var(--theme-text-secondary)]" {...props} />,
  
  ol: (props) => <ol className="my-3 list-decimal list-inside text-[var(--theme-text-secondary)]" {...props} />,
  
  li: (props) => <li className="ml-4" {...props} />,
  
  blockquote: (props) => (
    <blockquote className="my-3 pl-4 border-l-2 border-[var(--theme-text-secondary)]/30 text-[var(--theme-text-secondary)] italic" {...props} />
  ),
  
  hr: () => <hr className="my-6 border-[var(--theme-border)]" />,
  
  code: (props) => {
    // Inline code (no className means not in a pre block)
    if (!props.className) {
      return <code className="font-jetbrains-mono text-[0.95em] text-[var(--theme-text-primary)]/80" {...props} />;
    }
    // Block code is handled by pre
    return <code {...props} />;
  },
  
  pre: (props) => {
    // MDX wraps code in: <pre><code className="language-xxx">content</code></pre>
    let language = 'text';
    let codeContent = '';
    
    React.Children.forEach(props.children, (child) => {
      if (React.isValidElement(child)) {
        const childProps = child.props as { className?: string; children?: React.ReactNode };
        if (childProps.className?.includes('language-')) {
          language = childProps.className.replace('language-', '');
        }
        codeContent = getTextFromChildren(childProps.children || child);
      }
    });
    
    if (!codeContent) {
      codeContent = getTextFromChildren(props.children);
    }
    
    if (codeContent) {
      return <CodeBlock code={codeContent} language={language} />;
    }
    
    return <pre className="my-4 overflow-x-auto bg-[var(--theme-text-primary)]/[0.03] rounded-lg p-4" {...props} />;
  },
  
  table: (props) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full text-sm border-collapse" {...props} />
    </div>
  ),
  
  thead: (props) => <thead className="border-b border-[var(--theme-border)]" {...props} />,
  tbody: (props) => <tbody {...props} />,
  tr: (props) => <tr className="border-b border-[var(--theme-border)]/50" {...props} />,
  th: (props) => <th className="px-3 py-2 text-left font-medium text-[var(--theme-text-primary)]" {...props} />,
  td: (props) => <td className="px-3 py-2 text-[var(--theme-text-secondary)]" {...props} />,
  
  // Custom components available in MDX
  AnnotatedCode,
  AlphaSlider,
  Plot,
  LinkedFormula,
  Term,
  Gallery,
  Video,
  Flicker,
  Decay,
};
