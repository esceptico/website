'use client';

import { useState } from 'react';

interface CodeBlockWithCopyProps {
  code: string;
  codeHtml: string;
}

export function CodeBlockWithCopy({ code, codeHtml }: CodeBlockWithCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-4 bg-[var(--theme-text-primary)]/[0.03] rounded-lg px-4 py-3 relative group/code">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 px-2 py-1 text-xs font-mono rounded bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] opacity-0 group-hover/code:opacity-100 hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-text-secondary)] transition-all duration-300"
      >
        {copied ? 'copied' : 'copy'}
      </button>
      <pre className="overflow-x-auto whitespace-pre">
        <code 
          className="font-jetbrains-mono text-[0.85rem] leading-[1.7] block"
          dangerouslySetInnerHTML={{ __html: codeHtml }}
        />
      </pre>
    </div>
  );
}
