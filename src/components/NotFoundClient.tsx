'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import TyperTextEffect from '@/components/content/TyperTextEffect';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { errorMessages } from '@/personal-content';
import { useState, useEffect } from 'react';

export default function NotFoundClient() {
  const [glitchActive, setGlitchActive] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(1);
  const [glitchSeed, setGlitchSeed] = useState(0);
  
  // Trigger glitch effect with random intervals and durations
  useEffect(() => {
    const scheduleNextGlitch = () => {
      // Random delay between 1-5 seconds
      const delay = 1000 + Math.random() * 4000;
      
      setTimeout(() => {
        // Random intensity between 0.5 and 2
        setGlitchIntensity(0.5 + Math.random() * 1.5);
        setGlitchSeed(Math.random() * 1000);
        setGlitchActive(true);
        
        // Random duration between 100-400ms
        const duration = 100 + Math.random() * 300;
        
        setTimeout(() => {
          setGlitchActive(false);
          scheduleNextGlitch();
        }, duration);
      }, delay);
    };
    
    scheduleNextGlitch();
    
    return () => {
      // Cleanup handled by component unmount
    };
  }, []);
  
  // Generate random glitch blocks
  const generateGlitchBlocks = () => {
    const blocks = [];
    const blockCount = Math.floor(2 + Math.random() * 5); // 2-6 blocks
    
    for (let i = 0; i < blockCount; i++) {
      blocks.push({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        width: 50 + Math.random() * 300,
        height: 5 + Math.random() * 40,
        type: Math.random() > 0.5 ? 'normal' : 'inverted',
        delay: Math.random() * 0.2
      });
    }
    
    return blocks;
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative">
      {/* SVG Filters for Glitch Effects */}
      <svg className="fixed w-0 h-0">
        <defs>
          {/* Displacement filter for distortion */}
          <filter id="distortion">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency={glitchActive ? (0.01 + Math.random() * 0.03) : 0.02}
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
              baseFrequency={0.5 + Math.random() * 0.5}
              numOctaves="1" 
              seed={glitchSeed + 100}
            />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -15"/>
            <feComposite operator="over" in2="SourceGraphic"/>
          </filter>
        </defs>
      </svg>

      {/* Glitch blocks that appear randomly */}
      {glitchActive && generateGlitchBlocks().map((block) => (
        <div
          key={block.id}
          className={`glitch-block ${block.type === 'inverted' ? 'glitch-block--inverted' : ''}`}
          style={{
            top: `${block.top}%`,
            left: `${block.left}%`,
            width: `${block.width}px`,
            height: `${block.height}px`,
            animationDelay: `${block.delay}s`,
            transform: `skewX(${Math.random() * 10 - 5}deg)`,
          }}
        />
      ))}
      
      {/* Random scan lines during glitch */}
      {glitchActive && Array.from({ length: Math.floor(1 + Math.random() * 3) }).map((_, i) => (
        <div
          key={`scan-${i}`}
          className="glitch-scanline"
          style={{
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.2}s`,
          }}
        />
      ))}
      
      {/* Main Content with Glitch Effects */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`text-center max-w-2xl mx-auto relative z-10 glitch-content ${glitchActive ? 'glitch-active' : ''}`}
        style={{
          filter: glitchActive && Math.random() > 0.7 ? 'url(#chromaticAberration)' : undefined
        }}
      >
        <div className="mb-12">
          <h1 className="text-6xl md:text-8xl font-jetbrains-mono font-normal mb-6 text-[var(--theme-text-secondary)] tracking-wider glitch-text"
              data-text="404"
              style={{
                transform: glitchActive ? `translate(${(Math.random() - 0.5) * 4}px, ${(Math.random() - 0.5) * 2}px)` : undefined
              }}>
            <span className="glitch-text__main">404</span>
            <span className="glitch-text__glitch glitch-text__glitch--1" aria-hidden="true">404</span>
            <span className="glitch-text__glitch glitch-text__glitch--2" aria-hidden="true">404</span>
            {glitchActive && Math.random() > 0.6 && (
              <span className="glitch-text__glitch glitch-text__glitch--3" aria-hidden="true">404</span>
            )}
          </h1>
          
          <div className="font-jetbrains-mono text-[var(--theme-text-secondary)] glitch-text-container"
               style={{
                 transform: glitchActive ? `skewX(${(Math.random() - 0.5) * 5}deg)` : undefined,
                 filter: glitchActive && Math.random() > 0.8 ? 'blur(1px)' : undefined
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
          className="inline-flex items-center gap-2 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors group font-jetbrains-mono glitch-link"
          style={{
            opacity: glitchActive && Math.random() > 0.7 ? 0.5 + Math.random() * 0.5 : 1
          }}
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>go back</span>
        </Link>
      </motion.div>
      
      {/* Random static noise overlay during intense glitches */}
      {glitchActive && glitchIntensity > 1.2 && (
        <div className="glitch-static" style={{ opacity: Math.random() * 0.3 }} />
      )}
    </div>
  );
}
