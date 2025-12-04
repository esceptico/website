'use client';

import { useMemo, useState } from 'react';
import hljs from 'highlight.js';
import katex from 'katex';
import type { Chunk } from '@/lib/docs/types';

interface DocChunkProps {
  chunk: Chunk;
  language: string;
  index: number;
}

function renderMath(html: string): string {
  html = html.replace(/\$\$([^$]+)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      return `<div class="my-3">${rendered}</div>`;
    } catch {
      return `<span class="text-red-400 font-mono text-sm">$$${math}$$</span>`;
    }
  });
  
  html = html.replace(/\$([^$\n]+)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `<span class="text-red-400 font-mono text-sm">$${math}$</span>`;
    }
  });
  
  return html;
}

function parseTable(tableText: string): string {
  const lines = tableText.trim().split('\n');
  if (lines.length < 2) return tableText;
  
  // Parse header row
  const headerCells = lines[0].split('|').map(c => c.trim()).filter(c => c);
  
  // Skip separator row (line 1), parse data rows
  const dataRows = lines.slice(2).map(line => 
    line.split('|').map(c => c.trim()).filter(c => c)
  );
  
  let html = '<div class="overflow-x-auto my-3"><table class="text-sm w-full">';
  
  // Header
  html += '<thead><tr class="border-b border-[var(--theme-border)]">';
  headerCells.forEach(cell => {
    html += `<th class="text-left py-2 pr-4 font-medium text-[var(--theme-text-primary)]">${cell}</th>`;
  });
  html += '</tr></thead>';
  
  // Body
  html += '<tbody>';
  dataRows.forEach(row => {
    html += '<tr class="border-b border-[var(--theme-border)]/50">';
    row.forEach(cell => {
      html += `<td class="py-2 pr-4 text-[var(--theme-text-secondary)]">${cell}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  
  return html;
}

function parseMarkdown(text: string): string {
  // First, handle tables (before other processing)
  // Match markdown tables: lines starting with |
  text = text.replace(
    /(\|[^\n]+\|\n\|[-:\s|]+\|\n(?:\|[^\n]+\|\n?)+)/g,
    (match) => parseTable(match)
  );
  
  // First, protect code blocks by replacing them with placeholders
  const codeBlocks: string[] = [];
  let processed = text.replace(/`([^`]+)`/g, (_, code) => {
    codeBlocks.push(code);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });
  
  let html = processed
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-medium text-[var(--theme-text-primary)] mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-medium text-[var(--theme-text-primary)] mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-medium text-[var(--theme-text-primary)] mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-medium text-[var(--theme-text-primary)]">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="hover-link" target="_blank">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-2">');
  
  // Restore code blocks
  html = html.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => {
    return `<code class="font-jetbrains-mono text-[0.95em] text-[var(--theme-text-primary)]/80">${codeBlocks[parseInt(idx)]}</code>`;
  })
  
  if (!html.startsWith('<h') && !html.startsWith('<li') && !html.startsWith('<div')) {
    html = `<p class="mb-2">${html}</p>`;
  }
  
  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>)+/g, '<ul class="my-2 list-disc list-inside">$&</ul>');
  html = html.replace(/<p class="mb-2"><\/p>/g, '');
  
  return html;
}

function highlightCode(code: string, language: string): string {
  try {
    return hljs.highlight(code, { language }).value;
  } catch {
    return hljs.highlightAuto(code).value;
  }
}

export function DocChunk({ chunk, language, index }: DocChunkProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const docHtml = useMemo(() => renderMath(parseMarkdown(chunk.doc)), [chunk.doc]);
  const codeHtml = useMemo(() => highlightCode(chunk.code, language), [chunk.code, language]);

  const hasDoc = chunk.doc.trim().length > 0;
  const hasCode = chunk.code.trim().length > 0;

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
      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {/* Code - Left side */}
        <div className={`py-3 ${!hasCode ? 'hidden lg:block opacity-0' : ''}`}>
          <pre className="overflow-x-auto">
            <code 
              className="font-jetbrains-mono text-[0.85rem] leading-[1.7] tracking-[-0.01em] block"
              dangerouslySetInnerHTML={{ __html: codeHtml }}
            />
          </pre>
        </div>

        {/* Docs - Right side */}
        <div className={`py-3 lg:pl-6 lg:border-l border-[var(--theme-border)] ${!hasDoc ? 'opacity-30' : ''}`}>
          <div 
            className="text-[0.875rem] text-[var(--theme-text-secondary)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: docHtml }}
          />
        </div>
      </div>
    </div>
  );
}
