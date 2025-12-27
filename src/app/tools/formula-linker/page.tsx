'use client';

import { useState, useRef, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

const colors = [
  { name: 'blue', light: '#2563eb', dark: '#60a5fa' },
  { name: 'red', light: '#dc2626', dark: '#f87171' },
  { name: 'green', light: '#059669', dark: '#34d399' },
  { name: 'purple', light: '#7c3aed', dark: '#a78bfa' },
  { name: 'amber', light: '#d97706', dark: '#fbbf24' },
  { name: 'pink', light: '#db2777', dark: '#f472b6' },
  { name: 'cyan', light: '#0891b2', dark: '#22d3ee' },
];

type Link = {
  id: string;
  color: typeof colors[number];
  descStart: number;
  descEnd: number;
  latexStart: number;
  latexEnd: number;
};

export default function FormulaLinker() {
  const [latex, setLatex] = useState('');
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState<Link[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [descSelection, setDescSelection] = useState<{ start: number; end: number } | null>(null);
  const [latexSelection, setLatexSelection] = useState<{ start: number; end: number } | null>(null);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const descRef = useRef<HTMLTextAreaElement>(null);
  const latexRef = useRef<HTMLTextAreaElement>(null);

  // Render KaTeX
  const [renderedLatex, setRenderedLatex] = useState('');
  useEffect(() => {
    if (!latex.trim()) {
      setRenderedLatex('');
      return;
    }
    try {
      let processed = latex;
      const sorted = [...links].sort((a, b) => b.latexStart - a.latexStart);
      for (const link of sorted) {
        const before = processed.slice(0, link.latexStart);
        const part = processed.slice(link.latexStart, link.latexEnd);
        const after = processed.slice(link.latexEnd);
        processed = `${before}\\htmlClass{term-${link.id}}{${part}}${after}`;
      }
      setRenderedLatex(katex.renderToString(processed, { displayMode: true, throwOnError: false, trust: true }));
    } catch {
      setRenderedLatex('<span class="text-red-500">Invalid LaTeX</span>');
    }
  }, [latex, links]);

  // Track description selection
  const handleDescSelect = () => {
    if (!descRef.current) return;
    const start = descRef.current.selectionStart;
    const end = descRef.current.selectionEnd;
    if (start !== end) {
      setDescSelection({ start, end });
      if (step === 1) setStep(2);
    }
  };

  // Track LaTeX selection
  const handleLatexSelect = () => {
    if (!latexRef.current || step !== 2) return;
    const start = latexRef.current.selectionStart;
    const end = latexRef.current.selectionEnd;
    if (start !== end) {
      setLatexSelection({ start, end });
      setStep(3);
    }
  };

  // Pick color and create link
  const handleColorPick = (color: typeof colors[number]) => {
    if (!descSelection || !latexSelection) return;
    
    const id = `t${Date.now().toString(36)}`;
    setLinks(prev => [...prev, {
      id,
      color,
      descStart: descSelection.start,
      descEnd: descSelection.end,
      latexStart: latexSelection.start,
      latexEnd: latexSelection.end,
    }]);
    
    setDescSelection(null);
    setLatexSelection(null);
    setStep(1);
  };

  // Cancel
  const handleCancel = () => {
    setDescSelection(null);
    setLatexSelection(null);
    setStep(1);
  };

  // Edit link color
  const handleEditColor = (linkId: string, color: typeof colors[number]) => {
    setLinks(prev => prev.map(l => l.id === linkId ? { ...l, color } : l));
    setEditingLink(null);
  };

  // Remove link
  const handleRemove = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  // Render text with highlights
  const renderHighlightedText = (text: string, selection: { start: number; end: number } | null, type: 'desc' | 'latex') => {
    if (!text) return null;
    
    const segments: { text: string; highlight?: 'selection' | 'link'; color?: string }[] = [];
    const highlights: { start: number; end: number; type: 'selection' | 'link'; color?: string }[] = [];
    
    // Add selection highlight
    if (selection) {
      highlights.push({ start: selection.start, end: selection.end, type: 'selection' });
    }
    
    // Add link highlights
    for (const link of links) {
      if (type === 'desc') {
        highlights.push({ start: link.descStart, end: link.descEnd, type: 'link', color: link.color.light });
      } else {
        highlights.push({ start: link.latexStart, end: link.latexEnd, type: 'link', color: link.color.light });
      }
    }
    
    // Sort by start position
    highlights.sort((a, b) => a.start - b.start);
    
    let lastEnd = 0;
    for (const h of highlights) {
      if (h.start > lastEnd) {
        segments.push({ text: text.slice(lastEnd, h.start) });
      }
      if (h.start < text.length) {
        segments.push({ 
          text: text.slice(h.start, Math.min(h.end, text.length)), 
          highlight: h.type,
          color: h.color 
        });
      }
      lastEnd = Math.max(lastEnd, h.end);
    }
    if (lastEnd < text.length) {
      segments.push({ text: text.slice(lastEnd) });
    }
    
    return segments.map((seg, i) => {
      if (seg.highlight === 'selection') {
        return <span key={i} className="bg-[var(--color-accent)]/30 rounded px-0.5">{seg.text}</span>;
      } else if (seg.highlight === 'link') {
        return <span key={i} style={{ color: seg.color, textDecoration: 'underline', textDecorationStyle: 'dotted' }}>{seg.text}</span>;
      }
      return <span key={i}>{seg.text}</span>;
    });
  };

  // Generate MDX
  const generateMDX = () => {
    if (!latex || !description || links.length === 0) return '// Add some links first';
    
    let processedLatex = latex;
    const sortedLatex = [...links].sort((a, b) => b.latexStart - a.latexStart);
    for (const link of sortedLatex) {
      const before = processedLatex.slice(0, link.latexStart);
      const part = processedLatex.slice(link.latexStart, link.latexEnd);
      const after = processedLatex.slice(link.latexEnd);
      processedLatex = `${before}\\htmlClass{term-${link.id}}{${part}}${after}`;
    }

    let processedDesc = '';
    let lastEnd = 0;
    const sortedDesc = [...links].sort((a, b) => a.descStart - b.descStart);
    for (const link of sortedDesc) {
      processedDesc += description.slice(lastEnd, link.descStart);
      processedDesc += `<Term id="${link.id}" color="${link.color.name}">${description.slice(link.descStart, link.descEnd)}</Term>`;
      lastEnd = link.descEnd;
    }
    processedDesc += description.slice(lastEnd);

    return `<LinkedFormula>

$$
${processedLatex}
$$

${processedDesc}

</LinkedFormula>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMDX());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg-primary)] text-[var(--theme-text-primary)]">
      <div className="max-w-3xl mx-auto py-12 px-6">
        
        <h1 className="text-xl font-medium mb-1">Formula Linker</h1>
        <p className="text-sm text-[var(--theme-text-secondary)] mb-8">
          Select text → Select LaTeX → Pick color
        </p>

        {/* Current Selection Display */}
        {(descSelection || latexSelection) && (
          <div className="mb-6 p-4 bg-[var(--theme-bg-secondary)] border border-[var(--color-accent)] rounded-lg flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2 text-sm">
              <span className="text-[var(--theme-text-secondary)]">Text:</span>
              {descSelection ? (
                <span className="bg-[var(--color-accent)]/30 px-2 py-0.5 rounded">
                  "{description.slice(descSelection.start, descSelection.end)}"
                </span>
              ) : <span className="text-[var(--theme-text-secondary)]/50">—</span>}
              
              <span className="text-[var(--theme-text-secondary)]/30 mx-2">→</span>
              
              <span className="text-[var(--theme-text-secondary)]">LaTeX:</span>
              {latexSelection ? (
                <span className="bg-[var(--color-accent)]/30 px-2 py-0.5 rounded font-mono text-xs">
                  {latex.slice(latexSelection.start, latexSelection.end)}
                </span>
              ) : <span className="text-[var(--theme-text-secondary)]/50">—</span>}
            </div>
            <button onClick={handleCancel} className="text-xs text-[var(--theme-text-secondary)] hover:text-red-500">
              Cancel
            </button>
          </div>
        )}

        {/* Inputs vertical */}
        <div className="space-y-4 mb-6">
          {/* LaTeX */}
          <div>
            <label className="text-xs font-medium text-[var(--theme-text-secondary)] uppercase tracking-wide mb-2 block">
              LaTeX {step === 2 && <span className="text-[var(--color-accent)]">← select part</span>}
            </label>
            <textarea
              ref={latexRef}
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              onMouseUp={handleLatexSelect}
              onKeyUp={handleLatexSelect}
              placeholder="\mathcal{L} = -\mathbb{E}[\log \sigma(r_w - r_l)]"
              className={`w-full h-24 p-3 bg-[var(--theme-bg-secondary)] border rounded-lg font-mono text-sm resize-none focus:outline-none ${
                step === 2 
                  ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20' 
                  : 'border-[var(--theme-border)]'
              }`}
            />
            {latexSelection && (
              <div className="mt-2 p-2 bg-[var(--theme-bg-secondary)]/50 rounded text-sm font-mono text-[var(--theme-text-secondary)]">
                {renderHighlightedText(latex, latexSelection, 'latex')}
              </div>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label className="text-xs font-medium text-[var(--theme-text-secondary)] uppercase tracking-wide mb-2 block">
              Description {step === 1 && <span className="text-[var(--color-accent)]">← select text</span>}
            </label>
            <textarea
              ref={descRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onMouseUp={handleDescSelect}
              onKeyUp={handleDescSelect}
              placeholder="The loss measures preference probability..."
              className={`w-full h-20 p-3 bg-[var(--theme-bg-secondary)] border rounded-lg text-sm resize-none focus:outline-none ${
                step === 1 
                  ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20' 
                  : 'border-[var(--theme-border)]'
              }`}
            />
            {descSelection && (
              <div className="mt-2 p-2 bg-[var(--theme-bg-secondary)]/50 rounded text-sm text-[var(--theme-text-secondary)]">
                {renderHighlightedText(description, descSelection, 'desc')}
              </div>
            )}
          </div>
        </div>

        {/* Color Picker */}
        {step === 3 && (
          <div className="mb-6 p-4 bg-[var(--theme-bg-secondary)] border border-[var(--color-accent)] rounded-lg">
            <p className="text-sm mb-3">Pick color:</p>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleColorPick(c)}
                  className="w-10 h-10 rounded-lg transition-transform hover:scale-110 active:scale-95"
                  style={{ backgroundColor: c.light }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {links.length > 0 && (
          <div className="mb-6">
            <label className="text-xs font-medium text-[var(--theme-text-secondary)] uppercase tracking-wide mb-2 block">
              Links
            </label>
            <div className="space-y-1">
              {links.map((link) => (
                <div 
                  key={link.id}
                  className="flex items-center gap-3 p-2 bg-[var(--theme-bg-secondary)] rounded text-sm group relative"
                >
                  <button
                    onClick={() => setEditingLink(editingLink === link.id ? null : link.id)}
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: link.color.light }}
                  />
                  <span className="text-[var(--theme-text-secondary)] truncate">
                    "{description.slice(link.descStart, link.descEnd)}"
                  </span>
                  <span className="text-[var(--theme-text-secondary)]/30">→</span>
                  <span className="font-mono text-xs text-[var(--theme-text-secondary)]/70 truncate">
                    {latex.slice(link.latexStart, link.latexEnd)}
                  </span>
                  <button 
                    onClick={() => handleRemove(link.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 text-[var(--theme-text-secondary)] hover:text-red-500"
                  >
                    ×
                  </button>
                  
                  {editingLink === link.id && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-[var(--theme-bg-primary)] border border-[var(--theme-border)] rounded-lg shadow-lg flex gap-2 z-10">
                      {colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => handleEditColor(link.id, c)}
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: c.light }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        {(latex || description) && (
          <div className="mb-6">
            <label className="text-xs font-medium text-[var(--theme-text-secondary)] uppercase tracking-wide mb-2 block">
              Preview
            </label>
            <div className="preview-container p-6 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-lg">
              <style>{`
                .preview-container [data-term] {
                  cursor: pointer;
                  text-decoration: underline;
                  text-decoration-style: dotted;
                  text-decoration-color: var(--theme-text-secondary);
                  text-underline-offset: 3px;
                  transition: color 0.15s, text-decoration-color 0.15s;
                }
                .preview-container .katex [class*="term-"] {
                  transition: color 0.15s;
                }
                ${links.map(link => `
                  .preview-container:has([data-term="${link.id}"]:hover) .term-${link.id} {
                    color: ${link.color.light} !important;
                  }
                  :root.dark .preview-container:has([data-term="${link.id}"]:hover) .term-${link.id} {
                    color: ${link.color.dark} !important;
                  }
                  .preview-container [data-term="${link.id}"]:hover {
                    color: ${link.color.light} !important;
                    text-decoration-color: ${link.color.light} !important;
                    text-decoration-style: solid !important;
                  }
                  :root.dark .preview-container [data-term="${link.id}"]:hover {
                    color: ${link.color.dark} !important;
                    text-decoration-color: ${link.color.dark} !important;
                  }
                `).join('\n')}
              `}</style>
              {renderedLatex && (
                <div className="mb-4" dangerouslySetInnerHTML={{ __html: renderedLatex }} />
              )}
              <p className="text-[var(--theme-text-secondary)] text-sm leading-relaxed">
                {renderPreviewDescription()}
              </p>
            </div>
          </div>
        )}

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-[var(--theme-text-secondary)] uppercase tracking-wide">
              Output
            </label>
            <button
              onClick={copyToClipboard}
              disabled={links.length === 0}
              className="text-xs px-3 py-1.5 bg-[var(--theme-text-primary)] text-[var(--theme-bg-primary)] rounded-md hover:opacity-80 disabled:opacity-30"
            >
              {copied ? 'Copied!' : 'Copy MDX'}
            </button>
          </div>
          <pre className="p-4 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap text-[var(--theme-text-secondary)]">
            {generateMDX()}
          </pre>
        </div>
      </div>
    </div>
  );

  function renderPreviewDescription() {
    if (!description) return null;
    
    const segments: { text: string; linkId?: string }[] = [];
    let lastEnd = 0;
    const sortedLinks = [...links].sort((a, b) => a.descStart - b.descStart);
    
    for (const link of sortedLinks) {
      if (link.descStart > lastEnd) {
        segments.push({ text: description.slice(lastEnd, link.descStart) });
      }
      segments.push({ text: description.slice(link.descStart, link.descEnd), linkId: link.id });
      lastEnd = link.descEnd;
    }
    if (lastEnd < description.length) {
      segments.push({ text: description.slice(lastEnd) });
    }

    return segments.map((seg, i) => 
      seg.linkId ? <span key={i} data-term={seg.linkId}>{seg.text}</span> : <span key={i}>{seg.text}</span>
    );
  }
}
