'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './HackerTextEffect.module.css';

interface HackerTextEffectProps {
  texts: readonly string[];
  className?: string;
  cycleDelay?: number; // ms
}

const chars = "0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

const HackerTextEffect: React.FC<HackerTextEffectProps> = ({ 
  texts, 
  className = '', 
  cycleDelay = 4000,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shuffleArray = (array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }
    return shuffled;
  };

  useEffect(() => {
    if (texts.length === 0) return;

    const firstText = texts[0];
    if (!firstText) return;

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setDisplayText(firstText);
      return;
    }

    // Defaults
    const iterMin = 1;
    const iterMax = 3;

    const initialSpeedMin = 40;
    const initialSpeedMax = 80;
    const runningSpeedMin = 30;
    const runningSpeedMax = 90;

    const startDelayMin = 0;
    const startDelayMax = 100;

    const cycleDelayVariation = 500;

    const currentText = texts[currentTextIndex] ?? firstText;

    const getRandomChar = () => chars[Math.floor(Math.random() * chars.length)] ?? '?';

    setDisplayText(currentText.split('').map(() => getRandomChar()).join(''));

    const startDecoding = () => {
      const letters = currentText.split('');
      const revealOrder = shuffleArray(Array.from({ length: letters.length }, (_, i) => i));
      let revealedCount = 0;
      let iterationCount = 0;
      const revealed = new Array<boolean>(letters.length).fill(false);
      
      const iterationsPerRevealMap = letters.map(() => 
        Math.floor(iterMin + Math.random() * (iterMax - iterMin + 1))
      );
      let currentCharIterations = 0;

      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }

      let currentSpeed = initialSpeedMin + Math.random() * (initialSpeedMax - initialSpeedMin);
      
      const runIteration = () => {
        if (revealedCount < letters.length) {
          const currentRevealIndex = revealOrder[revealedCount] ?? 0;
          const threshold = iterationsPerRevealMap[currentRevealIndex] ?? 1;
          
          if (currentCharIterations >= threshold) {
            revealed[currentRevealIndex] = true;
            revealedCount++;
            currentCharIterations = 0;
            
            const speedChange = (Math.random() - 0.5) * 20;
            currentSpeed = Math.max(runningSpeedMin, Math.min(runningSpeedMax, currentSpeed + speedChange));
          } else {
            currentCharIterations++;
          }
        }

        setDisplayText(prevDisplayText =>
          letters
            .map((letter, index) => {
              if (revealed[index]) {
                return letter;
              }
              if (Math.random() > 0.7 && iterationCount % 3 !== 0) {
                return prevDisplayText[index] ?? getRandomChar();
              }
              return getRandomChar();
            })
            .join('')
        );

        iterationCount++;

        if (revealedCount >= letters.length) {
          if (intervalRef.current) clearTimeout(intervalRef.current);
          
          if (texts.length > 1) {
            const actualCycleDelay = cycleDelay + (Math.random() - 0.5) * 2 * cycleDelayVariation;
            cycleTimeoutRef.current = setTimeout(() => {
              setCurrentTextIndex((prev) => (prev + 1) % texts.length);
            }, actualCycleDelay);
          }
        } else {
          intervalRef.current = setTimeout(runIteration, currentSpeed);
        }
      };
      
      intervalRef.current = setTimeout(runIteration, currentSpeed);
    };

    const startDelayMs = startDelayMin + Math.random() * (startDelayMax - startDelayMin);
    startDelayTimeoutRef.current = setTimeout(startDecoding, startDelayMs);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current);
        cycleTimeoutRef.current = null;
      }
      if (startDelayTimeoutRef.current) {
        clearTimeout(startDelayTimeoutRef.current);
        startDelayTimeoutRef.current = null;
      }
    };
  }, [currentTextIndex, texts, cycleDelay]);

  return (
    <span className={`inline-block relative ${className}`}>
      <span 
        className={`font-jetbrains-mono ${className} select-none transition-all duration-100 relative ${styles.hackerText}`}
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          display: 'inline-block',
        }}
      >
        {/* Main text */}
        <span className="relative z-10">{displayText}</span>
      </span>
    </span>
  );
};

export default HackerTextEffect;
