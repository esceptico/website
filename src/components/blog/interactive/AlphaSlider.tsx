'use client';

import { useState } from 'react';

interface AlphaSliderProps {
  question?: string;
  results: Record<string, string>;
}

export function AlphaSlider({ question, results }: AlphaSliderProps) {
  const alphas = Object.keys(results).map(Number).sort((a, b) => a - b);
  const [currentIndex, setCurrentIndex] = useState(Math.floor(alphas.length / 2));
  const currentAlpha = alphas[currentIndex] ?? 0;
  const currentResult = results[String(currentAlpha)] ?? '';
  
  const getLabel = (alpha: number) => {
    if (alpha === 0) return 'Baseline';
    if (alpha > 0) return `Expert (+${alpha})`;
    return `Novice (${alpha})`;
  };

  return (
    <div className="my-8 p-6 rounded-xl bg-[var(--theme-text-primary)]/[0.03] border border-[var(--theme-border)]">
      {question && (
        <div className="mb-4 text-sm text-[var(--theme-text-secondary)]">
          <span className="font-medium text-[var(--theme-text-primary)]">Question:</span> {question}
        </div>
      )}
      
      {/* Slider */}
      <div className="mb-6">
        {/* Current value label */}
        <div className="text-center mb-3">
          <span className="text-sm font-medium text-[var(--theme-text-primary)]">
            {getLabel(currentAlpha)}
          </span>
        </div>
        
        <input
          type="range"
          min={0}
          max={alphas.length - 1}
          value={currentIndex}
          onChange={(e) => setCurrentIndex(Number(e.target.value))}
          className="w-full h-2 bg-[var(--theme-border)] rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-[var(--theme-text-primary)]
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-110"
        />
        
        {/* Alpha markers positioned to match slider thumb positions */}
        <div className="relative h-5 mt-1">
          {alphas.map((alpha, i) => {
            const percent = alphas.length > 1 ? (i / (alphas.length - 1)) * 100 : 50;
            return (
              <button
                key={alpha}
                onClick={() => setCurrentIndex(i)}
                style={{ left: `${percent}%` }}
                className={`absolute -translate-x-1/2 text-xs transition-colors ${
                  i === currentIndex 
                    ? 'text-[var(--theme-text-primary)] font-medium' 
                    : 'text-[var(--theme-text-secondary)]/50 hover:text-[var(--theme-text-secondary)]'
                }`}
              >
                {alpha}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Result */}
      <div className="p-4 rounded-lg bg-[var(--theme-bg-primary)] border border-[var(--theme-border)]">
        <div className="text-sm text-[var(--theme-text-secondary)] leading-relaxed whitespace-pre-wrap">
          {currentResult}
        </div>
      </div>
    </div>
  );
}

