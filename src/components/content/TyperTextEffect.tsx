'use client';

import { useState, useEffect, useRef } from 'react';

interface TyperTextEffectProps {
  texts: readonly string[];
  className?: string;
  typeSpeed?: number; // Speed of typing in ms
  deleteSpeed?: number; // Speed of deleting in ms
  typeDelay?: number; // Delay before starting to type
  deleteDelay?: number; // Delay before starting to delete
  showCursor?: boolean; // Show blinking cursor
  cursorChar?: string; // Cursor character
  loop?: boolean; // Whether to loop through texts
}

const TyperTextEffect: React.FC<TyperTextEffectProps> = ({ 
  texts, 
  className = '', 
  typeSpeed = 50,
  deleteSpeed = 30,
  typeDelay = 500,
  deleteDelay = 1500,
  showCursor = true,
  cursorChar = '_',
  loop = true
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (texts.length === 0) return;

    const currentText = texts[currentTextIndex] ?? texts[0] ?? '';
    if (!currentText) return;
    
    const type = () => {
      if (!isDeleting && charIndex < currentText.length) {
        // Typing
        setDisplayText(currentText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
        timeoutRef.current = setTimeout(type, typeSpeed);
      } else if (!isDeleting && charIndex === currentText.length) {
        // Finished typing, wait then start deleting
        timeoutRef.current = setTimeout(() => {
          setIsDeleting(true);
          type();
        }, deleteDelay);
      } else if (isDeleting && charIndex > 0) {
        // Deleting
        setDisplayText(currentText.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
        timeoutRef.current = setTimeout(type, deleteSpeed);
      } else if (isDeleting && charIndex === 0) {
        // Finished deleting, move to next text
        setIsDeleting(false);
        if (loop || currentTextIndex < texts.length - 1) {
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          timeoutRef.current = setTimeout(type, typeDelay);
        }
      }
    };

    // Start typing
    timeoutRef.current = setTimeout(type, typeDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [charIndex, currentTextIndex, isDeleting, texts, typeSpeed, deleteSpeed, typeDelay, deleteDelay, loop]);

  // Reset charIndex when text changes
  useEffect(() => {
    setCharIndex(0);
    setDisplayText('');
  }, [currentTextIndex]);

  // Cursor blinking state
  const [cursorVisible, setCursorVisible] = useState(true);
  
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={`inline-block relative ${className}`}>
      <span className="font-jetbrains-mono select-none">
        {displayText}
        {showCursor && (
          <span 
            className="inline-block ml-0.5 transition-opacity duration-100"
            style={{ 
              opacity: cursorVisible ? 1 : 0
            }}
          >
            {cursorChar}
          </span>
        )}
      </span>
    </span>
  );
};

export default TyperTextEffect;
