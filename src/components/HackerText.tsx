'use client';

import { useState, useEffect } from 'react';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

interface HackerTextProps {
  text: string;
  className?: string;
  duration?: number; // Duration in milliseconds for each character
  delay?: number; // Delay before starting the animation
}

export const HackerText = ({ 
  text, 
  className = '', 
  duration = 50,
  delay = 0 
}: HackerTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    let interval: NodeJS.Timeout;
    let currentIndex = 0;
    
    // Start the animation after the specified delay
    const startTimeout = setTimeout(() => {
      setIsAnimating(true);
      setDisplayText(''.padEnd(text.length, ' '));

      // For each character in the target text
      for (let i = 0; i < text.length; i++) {
        // Create a timeout for when this character should settle
        const timeout = setTimeout(() => {
          currentIndex = i;
        }, i * duration);
        timeouts.push(timeout);
      }

      // Create an interval that updates random characters
      interval = setInterval(() => {
        setDisplayText(prev => {
          return prev.split('').map((char, index) => {
            // If this character hasn't settled yet, show a random character
            if (index > currentIndex) {
              return characters[Math.floor(Math.random() * characters.length)];
            }
            // If this character has settled, show the actual character
            return text[index];
          }).join('');
        });
      }, 50);

      // Stop the animation after all characters have settled
      const finalTimeout = setTimeout(() => {
        setIsAnimating(false);
        setDisplayText(text);
        clearInterval(interval);
      }, text.length * duration + 100);
      timeouts.push(finalTimeout);

    }, delay);
    timeouts.push(startTimeout);

    // Cleanup
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      clearInterval(interval);
    };
  }, [text, duration, delay]);

  return (
    <span className={`font-mono ${className} ${isAnimating ? 'select-none' : ''}`}>
      {displayText}
    </span>
  );
}; 