'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface AlphaSliderProps {
  question?: string;
  results: Record<string, string>;
}

export function AlphaSlider({ question, results }: AlphaSliderProps) {
  const alphas = Object.keys(results).map(Number).sort((a, b) => a - b);
  const [currentIndex, setCurrentIndex] = useState(Math.floor(alphas.length / 2));
  const currentAlpha = alphas[currentIndex] ?? 0;
  
  const getMode = (alpha: number) => {
    if (alpha === 0) return 'BASELINE';
    if (alpha > 0) return 'EXPERT';
    return 'NOVICE';
  };

  const formatAlpha = (alpha: number) => {
    if (alpha > 0) return `+${alpha}`;
    return String(alpha);
  };

  return (
    <div className="my-8 relative group">
      {/* Corner brackets */}
      <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-[var(--accent)]/50" />
      <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-[var(--accent)]/50" />
      <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-[var(--accent)]/50" />
      <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-[var(--accent)]/50" />

      {/* Label */}
      <div className="absolute -top-2.5 left-5 px-1.5 bg-[var(--theme-bg-primary)] text-[8px] font-mono tracking-[0.2em] text-[var(--theme-text-muted)]/70 uppercase">
        FIG.INTERACTIVE
      </div>

      <div className="px-6 py-8">
        {question && (
          <div className="mb-8 text-sm text-[var(--theme-text-secondary)] leading-relaxed">
            <span className="font-mono text-xs text-[var(--accent)] mr-2">[INPUT]</span>
            {question}
          </div>
        )}
        
        {/* Slider */}
        <div className="mb-8 relative">
          {/* Current value display */}
          <div className="flex items-center justify-center mb-5">
            <span className={`font-mono text-[9px] tracking-widest transition-colors w-16 text-right ${
              currentAlpha < 0 ? 'text-[var(--accent)]' : 'text-[var(--theme-text-muted)]/50'
            }`}>
              NOVICE
            </span>
            <span className="font-mono text-sm text-[var(--theme-text-primary)] tabular-nums w-20 text-center">
              α={formatAlpha(currentAlpha)}
            </span>
            <span className={`font-mono text-[9px] tracking-widest transition-colors w-16 text-left ${
              currentAlpha > 0 ? 'text-[var(--accent)]' : 'text-[var(--theme-text-muted)]/50'
            }`}>
              EXPERT
            </span>
          </div>
          
          {/* Track with ticks */}
          <div className="relative h-12">
            {/* Track line */}
            <div className="absolute top-5 left-0 w-full h-px bg-[var(--theme-border)]" />
            
            {/* Tick marks */}
            {alphas.map((alpha, i) => {
              const percent = alphas.length > 1 ? (i / (alphas.length - 1)) * 100 : 50;
              const isSelected = i === currentIndex;
              const isCenter = alpha === 0;
              return (
                <button
                  key={alpha}
                  onClick={() => setCurrentIndex(i)}
                  style={{ left: `${percent}%` }}
                  className="absolute -translate-x-1/2 flex flex-col items-center cursor-pointer group/tick"
                >
                  {/* Tick */}
                  <div className={`w-px transition-all ${
                    isCenter ? 'h-3.5 mt-3' : 'h-2 mt-4'
                  } ${
                    isSelected 
                      ? 'bg-[var(--accent)]' 
                      : isCenter 
                        ? 'bg-[var(--theme-text-muted)]/50 group-hover/tick:bg-[var(--theme-text-muted)]'
                        : 'bg-[var(--theme-border)] group-hover/tick:bg-[var(--theme-text-muted)]'
                  }`} />
                  
                  {/* Label */}
                  <span className={`mt-1.5 font-mono text-[9px] tabular-nums transition-colors ${
                    isSelected 
                      ? 'text-[var(--theme-text-primary)]' 
                      : 'text-[var(--theme-text-muted)]/60 group-hover/tick:text-[var(--theme-text-muted)]'
                  }`}>
                    {alpha}
                  </span>
                </button>
              );
            })}

            {/* Slider input (invisible, for interaction) */}
            <input
              type="range"
              min={0}
              max={alphas.length - 1}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(Number(e.target.value))}
              className="absolute top-0 left-0 w-full h-12 opacity-0 cursor-pointer z-10"
            />
            
            {/* Custom thumb indicator */}
            <div 
              className="absolute top-3 w-2.5 h-5 border border-[var(--accent)] bg-[var(--theme-bg-primary)] pointer-events-none transition-all duration-100 ease-out"
              style={{ 
                left: `${alphas.length > 1 ? (currentIndex / (alphas.length - 1)) * 100 : 50}%`,
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        </div>
        
        {/* Result */}
        <div className="relative">
          <div className="h-px bg-[var(--theme-border)]/40 mb-4" />
          
          {/* Mode label */}
          <span className="font-mono text-[9px] text-[var(--accent)] tracking-widest block mb-2">
            {getMode(currentAlpha)}
          </span>
          
          {/* Output display - all results stacked, only current visible */}
          <div className="grid">
            {alphas.map((alpha) => {
              const result = results[String(alpha)] ?? '';
              const isActive = alpha === currentAlpha;
              return (
                <div 
                  key={alpha}
                  className={`text-sm text-[var(--theme-text-secondary)] leading-relaxed prose-sm prose-strong:text-[var(--theme-text-primary)] prose-strong:font-medium col-start-1 row-start-1 ${
                    isActive ? 'visible' : 'invisible'
                  }`}
                >
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

