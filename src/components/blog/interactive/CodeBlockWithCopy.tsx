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
    <div className="code-plate my-5 px-4 py-3 relative group/code">
      <button
        onClick={handleCopy}
        className="code-copy absolute top-2 right-2 z-10 opacity-0 group-hover/code:opacity-100 focus-visible:opacity-100"
        aria-live="polite"
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
