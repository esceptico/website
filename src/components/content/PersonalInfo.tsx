'use client';

import HackerTextEffect from './HackerTextEffect';
import { FaGithub, FaLinkedin, FaEnvelope, FaInstagram, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';
import { socialLinks, hackerTextItems, aboutText, getTimeBasedGreeting } from '@/personal-content';
import { useState, useEffect, useMemo } from 'react';

export const PersonalInfo = () => {
  const socialLinkStyles = "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors";
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  
  // Combine time-based greeting with regular items
  const textItems = useMemo(() => {
    const timeGreeting = getTimeBasedGreeting();
    return [timeGreeting, ...hackerTextItems];
  }, []);

  useEffect(() => {
    if (clickCount >= 5 && !showEasterEgg) {
      setShowEasterEgg(true);
      setTimeout(() => {
        setShowEasterEgg(false);
        setClickCount(0);
      }, 3000);
    }
  }, [clickCount, showEasterEgg]);

  const handleHackerTextClick = () => {
    if (!showEasterEgg) {
      setClickCount(prev => prev + 1);
    }
  };
  
  return (
    <div className={`relative text-left pt-16 md:pt-24 pb-8`}> 
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <h1 
          className="text-xl md:text-2xl font-normal text-[var(--theme-text-secondary)] tracking-wider cursor-pointer select-none flex items-center min-w-[180px] md:min-w-[320px] whitespace-nowrap overflow-hidden"
          onClick={handleHackerTextClick}
          style={{ 
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            minHeight: '2.5rem'
          }}
        >
          {showEasterEgg ? (
            <span className="inline-block relative">
              <span 
                className="font-jetbrains-mono text-xl md:text-2xl select-none"
                style={{ 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  minHeight: '1.5em',
                  display: 'inline-block'
                }}
              >
                there are no easter eggs here
              </span>
            </span>
          ) : (
            <HackerTextEffect texts={textItems} />
          )}
        </h1>
        <div className="flex items-center space-x-4">
          <Link 
            href={socialLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className={socialLinkStyles}
            aria-label="GitHub"
          >
            <FaGithub className="w-5 h-5" />
          </Link>
          <Link 
            href={socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={socialLinkStyles}
            aria-label="LinkedIn"
          >
            <FaLinkedin className="w-5 h-5" />
          </Link>
          <Link 
            href={socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className={socialLinkStyles}
            aria-label="Twitter"
          >
            <FaTwitter className="w-5 h-5" />
          </Link>
          <Link 
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={socialLinkStyles}
            aria-label="Instagram"
          >
            <FaInstagram className="w-5 h-5" />
          </Link>
          <a 
            href={socialLinks.email}
            className={socialLinkStyles}
            aria-label="Email"
          >
            <FaEnvelope className="w-5 h-5" />
          </a>
        </div>
      </div>
      <p 
        className="text-base text-[var(--theme-text-primary)] leading-relaxed space-y-4 font-sans"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {aboutText.mainDescription}
        <br/><br/>
        {aboutText.additionalInfo}
      </p>
    </div>
  );
};
