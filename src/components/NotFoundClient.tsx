'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import TyperTextEffect from '@/components/content/TyperTextEffect';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { errorMessages } from '@/personal-content';
import { useState, useEffect } from 'react';
import styles from './NotFoundClient.module.css';

type GlitchBlock = {
  id: number;
  top: number;
  left: number;
  width: number;
  height: number;
  type: 'normal' | 'inverted';
  delay: number;
  skewDeg: number;
};

type GlitchScanline = {
  id: string;
  top: number;
  delay: number;
};

type GlitchVisual = {
  blocks: GlitchBlock[];
  scanlines: GlitchScanline[];
  contentChromatic: boolean;
  headingTranslate: { x: number; y: number };
  showGlitchText3: boolean;
  textSkewDeg: number;
  textBlur: boolean;
  linkOpacity: number;
  staticOpacity: number;
};

export default function NotFoundClient() {
  const [mounted, setMounted] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(1);
  const [glitchSeed, setGlitchSeed] = useState(0);
  const [glitchVisual, setGlitchVisual] = useState<GlitchVisual | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const distortionBaseFrequency = glitchActive ? 0.03 : 0.02;
  const corruptionBaseFrequency = 0.75;
  
  // Trigger glitch effect with random intervals and durations
  useEffect(() => {
    let cancelled = false;
    let delayTimeout: ReturnType<typeof setTimeout> | null = null;
    let durationTimeout: ReturnType<typeof setTimeout> | null = null;

    const makeVisual = (): GlitchVisual => {
      // Glitch blocks
      const blocks: GlitchBlock[] = [];
      const blockCount = Math.floor(2 + Math.random() * 5); // 2-6 blocks
      for (let i = 0; i < blockCount; i++) {
        blocks.push({
          id: i,
          top: Math.random() * 100,
          left: Math.random() * 100,
          width: 50 + Math.random() * 300,
          height: 5 + Math.random() * 40,
          type: Math.random() > 0.5 ? 'normal' : 'inverted',
          delay: Math.random() * 0.2,
          skewDeg: Math.random() * 10 - 5,
        });
      }

      // Scan lines
      const scanlines: GlitchScanline[] = [];
      const scanCount = Math.floor(1 + Math.random() * 3); // 1-3 scan lines
      for (let i = 0; i < scanCount; i++) {
        scanlines.push({
          id: `scan-${i}-${Math.floor(Math.random() * 1_000_000)}`,
          top: Math.random() * 100,
          delay: Math.random() * 0.2,
        });
      }

      return {
        blocks,
        scanlines,
        contentChromatic: Math.random() > 0.7,
        headingTranslate: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 2 },
        showGlitchText3: Math.random() > 0.6,
        textSkewDeg: (Math.random() - 0.5) * 5,
        textBlur: Math.random() > 0.8,
        linkOpacity: Math.random() > 0.7 ? 0.5 + Math.random() * 0.5 : 1,
        staticOpacity: Math.random() * 0.3,
      };
    };

    const scheduleNextGlitch = () => {
      // Random delay between 1-5 seconds
      const delay = 1000 + Math.random() * 4000;
      
      delayTimeout = setTimeout(() => {
        if (cancelled) return;

        // Random intensity between 0.5 and 2
        const intensity = 0.5 + Math.random() * 1.5;
        const seed = Math.random() * 1000;
        setGlitchIntensity(intensity);
        setGlitchSeed(seed);
        setGlitchVisual(makeVisual());
        setGlitchActive(true);
        
        // Random duration between 100-400ms
        const duration = 100 + Math.random() * 300;
        
        durationTimeout = setTimeout(() => {
          if (cancelled) return;
          setGlitchActive(false);
          setGlitchVisual(null);
          scheduleNextGlitch();
        }, duration);
      }, delay);
    };
    
    scheduleNextGlitch();
    
    return () => {
      cancelled = true;
      if (delayTimeout) clearTimeout(delayTimeout);
      if (durationTimeout) clearTimeout(durationTimeout);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative">
      {/* SVG Filters for Glitch Effects */}
      {mounted && (
        <svg className="fixed w-0 h-0" aria-hidden="true">
          <defs>
            {/* Displacement filter for distortion */}
            <filter id="distortion">
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency={distortionBaseFrequency}
                numOctaves="1" 
                result="turbulence"
                seed={glitchSeed}
              />
              <feDisplacementMap 
                in="SourceGraphic" 
                in2="turbulence" 
                scale={glitchActive ? (10 + glitchIntensity * 20).toString() : "0"} 
                xChannelSelector="R" 
                yChannelSelector="G"
              />
            </filter>
            
            {/* Chromatic aberration filter */}
            <filter id="chromaticAberration">
              <feOffset in="SourceGraphic" dx={glitchActive ? -2 * glitchIntensity : 0} dy="0" result="r" />
              <feOffset in="SourceGraphic" dx={glitchActive ? 2 * glitchIntensity : 0} dy="0" result="b" />
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
            
            {/* Digital corruption filter */}
            <filter id="corruption">
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency={corruptionBaseFrequency}
                numOctaves="1" 
                seed={glitchSeed + 100}
              />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -15"/>
              <feComposite operator="over" in2="SourceGraphic"/>
            </filter>
          </defs>
        </svg>
      )}

      {/* Glitch blocks that appear randomly */}
      {glitchActive && glitchVisual?.blocks.map((block) => (
        <div
          key={block.id}
          className={`${styles.glitchBlock} ${block.type === 'inverted' ? styles.glitchBlockInverted : ''}`}
          style={{
            top: `${block.top}%`,
            left: `${block.left}%`,
            width: `${block.width}px`,
            height: `${block.height}px`,
            animationDelay: `${block.delay}s`,
            transform: `skewX(${block.skewDeg}deg)`,
          }}
        />
      ))}
      
      {/* Random scan lines during glitch */}
      {glitchActive && glitchVisual?.scanlines.map((line) => (
        <div
          key={line.id}
          className={styles.glitchScanline}
          style={{
            top: `${line.top}%`,
            animationDelay: `${line.delay}s`,
          }}
        />
      ))}
      
      {/* Main Content with Glitch Effects */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`text-center max-w-2xl mx-auto relative z-10 ${styles.glitchContent} ${glitchActive ? styles.glitchActive : ''}`}
        style={{
          filter: glitchActive && glitchVisual?.contentChromatic ? 'url(#chromaticAberration)' : undefined
        }}
      >
        <div className="mb-12">
          <h1 className={`text-6xl md:text-8xl font-jetbrains-mono font-normal mb-6 text-[var(--theme-text-secondary)] tracking-wider ${styles.glitchText}`}
              data-text="404"
              style={{
                transform: glitchActive && glitchVisual
                  ? `translate(${glitchVisual.headingTranslate.x}px, ${glitchVisual.headingTranslate.y}px)`
                  : undefined
              }}>
            <span className={styles.glitchTextMain}>404</span>
            <span className={`${styles.glitchTextGlitch} ${styles.glitchTextGlitch1}`} aria-hidden="true">404</span>
            <span className={`${styles.glitchTextGlitch} ${styles.glitchTextGlitch2}`} aria-hidden="true">404</span>
            {glitchActive && glitchVisual?.showGlitchText3 && (
              <span className={`${styles.glitchTextGlitch} ${styles.glitchTextGlitch3}`} aria-hidden="true">404</span>
            )}
          </h1>
          
          <div className={`font-jetbrains-mono text-[var(--theme-text-secondary)] ${styles.glitchTextContainer}`}
               style={{
                 transform: glitchActive && glitchVisual ? `skewX(${glitchVisual.textSkewDeg}deg)` : undefined,
                 filter: glitchActive && glitchVisual?.textBlur ? 'blur(1px)' : undefined
               }}>
            <TyperTextEffect 
              texts={errorMessages} 
              className="text-lg md:text-xl"
              typeSpeed={60}
              deleteSpeed={10}
              deleteDelay={2000}
              typeDelay={50}
            />
          </div>
        </div>
        
        <Link 
          href="/"
          className={`inline-flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors group font-jetbrains-mono ${styles.glitchLink}`}
          style={{
            opacity: glitchActive && glitchVisual ? glitchVisual.linkOpacity : 1
          }}
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>go back</span>
        </Link>
      </motion.div>
      
      {/* Random static noise overlay during intense glitches */}
      {glitchActive && glitchIntensity > 1.2 && glitchVisual && (
        <div className={styles.glitchStatic} style={{ opacity: glitchVisual.staticOpacity }} />
      )}
    </div>
  );
}
