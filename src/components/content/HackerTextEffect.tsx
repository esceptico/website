'use client';

import { useState, useEffect, useRef } from 'react';

interface HackerTextEffectProps {
  texts: string[];
  className?: string;
  cycleDelay?: number; // Delay between cycles in milliseconds
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

const HackerTextEffect: React.FC<HackerTextEffectProps> = ({ 
  texts, 
  className, 
  cycleDelay = 3000 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to shuffle an array
  const shuffleArray = (array: number[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (texts.length === 0) return;

    const currentText = texts[currentTextIndex];
    
    // Initialize with random characters
    setDisplayText(currentText.split('').map(() => chars[Math.floor(Math.random() * chars.length)]).join(''));

    const startDecoding = () => {
      const letters = currentText.split('');
      const revealOrder = shuffleArray(Array.from({ length: letters.length }, (_, i) => i));
      let revealedCount = 0;
      let iterationCount = 0;
      const revealed = new Array(letters.length).fill(false);
      const iterationsPerReveal = 3; // Number of scrambling iterations before revealing a character

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        // Reveal characters based on the random order, but only every few iterations
        if (revealedCount < letters.length && iterationCount % iterationsPerReveal === 0) {
          const indexToReveal = revealOrder[revealedCount];
          revealed[indexToReveal] = true;
          revealedCount++;
        }

        setDisplayText(
          letters
            .map((letter, index) => {
              if (revealed[index]) {
                return letter;
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        iterationCount++;

        if (revealedCount >= letters.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          
          // Set up next cycle if there are multiple texts
          if (texts.length > 1) {
            cycleTimeoutRef.current = setTimeout(() => {
              setCurrentTextIndex((prev) => (prev + 1) % texts.length);
            }, cycleDelay);
          }
        }
      }, 60); // Faster frame rate for smoother scrambling
    };

    startDecoding();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current);
      }
    };
  }, [currentTextIndex, texts, cycleDelay]);

  return (
    <span 
      className={`font-jetbrains-mono text-xl md:text-2xl ${className}`} 
    >
      {displayText}
    </span>
  );
};

export default HackerTextEffect;
