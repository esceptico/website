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
    <div className="figure-plate my-10 relative group">
      <div className="plate-head">
        <span>fig · steering sweep</span>
        <span>gemma-3-1b-it</span>
      </div>

      <div className="px-6 pt-5 pb-7">
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
            <span className={`font-mono text-[10px] tracking-widest transition-colors w-16 text-right ${
              currentAlpha < 0 ? 'text-[var(--accent)]' : 'text-[var(--theme-text-muted)]/50'
            }`}>
              NOVICE
            </span>
            <span className="font-mono text-sm text-[var(--theme-text-primary)] tabular-nums w-20 text-center">
              α={formatAlpha(currentAlpha)}
            </span>
            <span className={`font-mono text-[10px] tracking-widest transition-colors w-16 text-left ${
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
                        ? 'bg-[var(--theme-text-muted)] group-hover/tick:bg-[var(--theme-text-primary)]'
                        : 'bg-[var(--theme-text-muted)]/60 group-hover/tick:bg-[var(--theme-text-muted)]'
                  }`} />
                  
                  {/* Label */}
                  <span className={`mt-1.5 font-mono text-[10px] tabular-nums transition-colors ${
                    isSelected 
                      ? 'text-[var(--theme-text-primary)]' 
                      : 'text-[var(--theme-text-muted)] group-hover/tick:text-[var(--theme-text-primary)]'
                  }`}>
                    {alpha}
                  </span>
                </button>
              );
            })}

            {/* Slider input (invisible, for interaction) */}
            <input
              aria-label="Steering strength α"
              aria-valuetext={`α = ${formatAlpha(currentAlpha)}`}
              type="range"
              min={0}
              max={alphas.length - 1}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(Number(e.target.value))}
              className="absolute top-0 left-0 w-full h-12 opacity-0 cursor-pointer z-10"
            />
            
            {/* Custom thumb indicator - needle style */}
            <div 
              className="absolute top-1 pointer-events-none transition-all duration-100 ease-out flex flex-col items-center"
              style={{ 
                left: `${alphas.length > 1 ? (currentIndex / (alphas.length - 1)) * 100 : 50}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {/* Triangle pointer */}
              <div 
                className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[var(--accent)]"
              />
              {/* Needle line */}
              <div className="w-px h-4 bg-[var(--accent)]" />
            </div>
          </div>
        </div>
        
        {/* Result */}
        <div className="relative mt-4 pt-4 pb-4">
          {/* Mode label */}
          <span className="font-mono text-[11px] text-[var(--accent)] tracking-widest block mb-2">
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

