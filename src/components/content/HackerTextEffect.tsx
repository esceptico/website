'use client';

import { useState, useEffect, useRef } from 'react';

interface HackerTextEffectProps {
  texts: readonly string[];
  className?: string;
  cycleDelay?: number;
  // Iteration control
  iterationsPerReveal?: {
    min: number;
    max: number;
  };
  // Speed control (ms)
  iterationSpeed?: {
    initial: { min: number; max: number };
    running: { min: number; max: number };
  };
  // Delay control (ms)
  startDelay?: {
    min: number;
    max: number;
  };
  cycleDelayVariation?: number; // ± variation in ms
  // Glitch control
  glitchConfig?: {
    chance: number; // 0-1
    duration: { min: number; max: number };
    frequency: { min: number; max: number };
  };
}

const chars = "0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

const HackerTextEffect: React.FC<HackerTextEffectProps> = ({ 
  texts, 
  className = '', 
  cycleDelay = 4000,
  iterationsPerReveal = { min: 1, max: 3 },
  iterationSpeed = {
    initial: { min: 30, max: 70 },
    running: { min: 20, max: 80 }
  },
  startDelay = { min: 0, max: 100 },
  cycleDelayVariation = 500,
  glitchConfig = {
    chance: 0.7,
    duration: { min: 100, max: 400 },
    frequency: { min: 1000, max: 3500 }
  }
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(1);
  const [glitchSeed, setGlitchSeed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const glitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Extract primitive values from objects to avoid dependency issues
    const { min: iterMin, max: iterMax } = iterationsPerReveal;
    const { min: initialSpeedMin, max: initialSpeedMax } = iterationSpeed.initial;
    const { min: runningSpeedMin, max: runningSpeedMax } = iterationSpeed.running;
    const { min: startDelayMin, max: startDelayMax } = startDelay;
    const { chance: glitchChance, duration: glitchDuration, frequency: glitchFrequency } = glitchConfig;
    const { min: glitchDurationMin, max: glitchDurationMax } = glitchDuration;
    const { min: glitchFreqMin, max: glitchFreqMax } = glitchFrequency;

    const triggerGlitch = () => {
      // Random intensity between 0.5 and 2
      setGlitchIntensity(0.5 + Math.random() * 1.5);
      setGlitchSeed(Math.random() * 1000);
      setIsGlitching(true);
      
      // Random duration from config
      const duration = glitchDurationMin + Math.random() * (glitchDurationMax - glitchDurationMin);
      setTimeout(() => setIsGlitching(false), duration);
    };

    const currentText = texts[currentTextIndex];
    
    setDisplayText(currentText.split('').map(() => chars[Math.floor(Math.random() * chars.length)]).join(''));

    const startDecoding = () => {
      const letters = currentText.split('');
      const revealOrder = shuffleArray(Array.from({ length: letters.length }, (_, i) => i));
      let revealedCount = 0;
      let iterationCount = 0;
      const revealed = new Array(letters.length).fill(false);
      
      // Randomize iterations per reveal for each character
      const iterationsPerRevealMap = letters.map(() => 
        Math.floor(iterMin + Math.random() * (iterMax - iterMin + 1))
      );
      let currentCharIterations = 0;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Dynamic interval that changes speed
      let currentSpeed = initialSpeedMin + Math.random() * (initialSpeedMax - initialSpeedMin);
      
      const runIteration = () => {
        if (revealedCount < letters.length) {
          const currentRevealIndex = revealOrder[revealedCount];
          
          if (currentCharIterations >= iterationsPerRevealMap[currentRevealIndex]) {
            revealed[currentRevealIndex] = true;
            revealedCount++;
            currentCharIterations = 0;
            
            // Change speed slightly after each reveal for more natural feel
            const speedChange = (Math.random() - 0.5) * 20;
            currentSpeed = Math.max(runningSpeedMin, Math.min(runningSpeedMax, currentSpeed + speedChange));
          } else {
            currentCharIterations++;
          }
        }

        setDisplayText(
          letters
            .map((letter, index) => {
              if (revealed[index]) {
                return letter;
              }
              // Add occasional "stuck" characters that change less frequently
              if (Math.random() > 0.7 && iterationCount % 3 !== 0) {
                return displayText[index] || chars[Math.floor(Math.random() * chars.length)];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        iterationCount++;

        if (revealedCount >= letters.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          
          if (texts.length > 1) {
            // Randomize cycle delay slightly
            const actualCycleDelay = cycleDelay + (Math.random() - 0.5) * 2 * cycleDelayVariation;
            cycleTimeoutRef.current = setTimeout(() => {
              setCurrentTextIndex((prev) => (prev + 1) % texts.length);
            }, actualCycleDelay);
          }
        } else {
          // Schedule next iteration with current speed
          intervalRef.current = setTimeout(runIteration, currentSpeed);
        }
      };
      
      // Start the iteration
      intervalRef.current = setTimeout(runIteration, currentSpeed);
    };

    // Add slight delay before starting decode for more natural feel
    const startDelayMs = startDelayMin + Math.random() * (startDelayMax - startDelayMin);
    setTimeout(startDecoding, startDelayMs);

    // Schedule random glitches
    const scheduleGlitch = () => {
      const randomDelay = glitchFreqMin + Math.random() * (glitchFreqMax - glitchFreqMin);
      glitchTimeoutRef.current = setTimeout(() => {
        if (Math.random() < glitchChance) { // Use configured chance
          triggerGlitch();
        }
        scheduleGlitch();
      }, randomDelay);
    };

    scheduleGlitch();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current);
      }
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current);
      }
    };
  }, [
    currentTextIndex, 
    texts, 
    cycleDelay, 
    cycleDelayVariation,
    iterationsPerReveal.min,
    iterationsPerReveal.max,
    iterationSpeed.initial.min,
    iterationSpeed.initial.max,
    iterationSpeed.running.min,
    iterationSpeed.running.max,
    startDelay.min,
    startDelay.max,
    glitchConfig.chance,
    glitchConfig.duration.min,
    glitchConfig.duration.max,
    glitchConfig.frequency.min,
    glitchConfig.frequency.max
  ]);

  return (
    <span className={`inline-block relative ${className}`}>
      {/* SVG Filters for Chromatic Aberration */}
      <svg className="fixed w-0 h-0" aria-hidden="true">
        <defs>
          {/* Chromatic aberration filter */}
          <filter id="hackerTextChromaticAberration">
            <feOffset in="SourceGraphic" dx={isGlitching ? -1.5 * glitchIntensity : 0} dy="0" result="r" />
            <feOffset in="SourceGraphic" dx={isGlitching ? 1.5 * glitchIntensity : 0} dy="0" result="b" />
            <feComponentTransfer in="r" result="red">
              <feFuncR type="table" tableValues="1 0" />
              <feFuncG type="table" tableValues="0 0" />
              <feFuncB type="table" tableValues="0 0" />
            </feComponentTransfer>
            <feComponentTransfer in="b" result="blue">
              <feFuncR type="table" tableValues="0 0" />
              <feFuncG type="table" tableValues="0 0" />
              <feFuncB type="table" tableValues="0 1" />
            </feComponentTransfer>
            <feBlend mode="screen" in="red" in2="SourceGraphic" result="blend1" />
            <feBlend mode="screen" in="blend1" in2="blue" />
          </filter>
          
          {/* Distortion filter */}
          <filter id="hackerTextDistortion">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency={isGlitching ? (0.01 + Math.random() * 0.02) : 0.01}
              numOctaves="1" 
              result="turbulence"
              seed={glitchSeed}
            />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="turbulence" 
              scale={isGlitching ? (5 + glitchIntensity * 10).toString() : "0"} 
              xChannelSelector="R" 
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <span 
        className={`font-jetbrains-mono text-xl md:text-2xl select-none transition-all duration-100 relative hacker-text-main`}
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          minHeight: '1.5em',
          display: 'inline-block',
          filter: isGlitching && Math.random() > 0.5 ? 'url(#hackerTextChromaticAberration)' : undefined,
          transform: isGlitching ? `translate(${(Math.random() - 0.5) * 2}px, ${(Math.random() - 0.5) * 1}px)` : undefined
        }}
      >
        {/* Main text */}
        <span className="relative z-10">{displayText}</span>
        
        {/* Glitch layers */}
        {isGlitching && (
          <>
            <span 
              className="absolute top-0 left-0 w-full h-full opacity-80"
              style={{
                color: 'rgb(255, 0, 0)',
                clipPath: `polygon(0 ${20 + Math.random() * 30}%, 100% ${20 + Math.random() * 30}%, 100% ${50 + Math.random() * 30}%, 0 ${50 + Math.random() * 30}%)`,
                transform: `translate(${-2 * glitchIntensity}px, ${Math.random() > 0.5 ? 1 : -1}px)`,
              }}
              aria-hidden="true"
            >
              {displayText}
            </span>
            <span 
              className="absolute top-0 left-0 w-full h-full opacity-80"
              style={{
                color: 'rgb(0, 255, 255)',
                clipPath: `polygon(0 ${Math.random() * 30}%, 100% ${Math.random() * 30}%, 100% ${30 + Math.random() * 40}%, 0 ${30 + Math.random() * 40}%)`,
                transform: `translate(${2 * glitchIntensity}px, ${Math.random() > 0.5 ? -1 : 1}px)`,
              }}
              aria-hidden="true"
            >
              {displayText}
            </span>
            {glitchIntensity > 1.2 && (
              <span 
                className="absolute top-0 left-0 w-full h-full opacity-60"
                style={{
                  color: 'rgb(0, 255, 0)',
                  clipPath: `polygon(0 ${60 + Math.random() * 20}%, 100% ${60 + Math.random() * 20}%, 100% ${80 + Math.random() * 20}%, 0 ${80 + Math.random() * 20}%)`,
                  transform: `translate(${(Math.random() - 0.5) * 3}px, ${(Math.random() - 0.5) * 2}px) scale(${0.98 + Math.random() * 0.04})`,
                  mixBlendMode: 'screen' as const
                }}
                aria-hidden="true"
              >
                {displayText}
              </span>
            )}
          </>
        )}
      </span>
    </span>
  );
};

export default HackerTextEffect;
