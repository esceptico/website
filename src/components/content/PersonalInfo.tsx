'use client';

import HackerTextEffect from './HackerTextEffect';
import { FaGithub, FaLinkedin, FaEnvelope, FaInstagram, FaTwitter, FaFileAlt } from 'react-icons/fa';
import Link from 'next/link';
import { socialLinks, hackerTextItems, aboutText, getTimeBasedGreeting } from '@/personal-content';
import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

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
    <div className="relative text-left pt-24 md:pt-40 pb-16 max-w-3xl"> 
      <div className="mb-10">
        <h1 
          className="text-3xl md:text-4xl font-bold text-[var(--theme-text-primary)] tracking-tight cursor-pointer select-none flex items-center min-w-[300px] min-h-[4rem]"
          onClick={handleHackerTextClick}
        >
          {showEasterEgg ? (
            <span className="inline-block relative">
              <span className="font-jetbrains-mono text-3xl md:text-4xl select-none inline-block">
                there are no easter eggs here
              </span>
            </span>
          ) : (
            <HackerTextEffect texts={textItems} className="text-3xl md:text-4xl" />
          )}
        </h1>
      </div>

      <div className="text-xl md:text-2xl text-[var(--theme-text-secondary)] leading-relaxed space-y-8 font-sans font-light">
        <div className="markdown-content">
          <ReactMarkdown
            components={{
              a: ({ ...props }) => (
                <a 
                  {...props} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[var(--theme-text-primary)] hover:underline decoration-1 underline-offset-4 transition-all" 
                />
              )
            }}
          >
            {aboutText.mainDescription}
          </ReactMarkdown>
        </div>
        <p>{aboutText.additionalInfo}</p>
      </div>

      <div className="flex items-center space-x-8 mt-16">
        <Link 
          href={socialLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          className={`${socialLinkStyles} hover:scale-110 transition-transform duration-200`}
          aria-label="GitHub"
        >
          <FaGithub className="w-7 h-7" />
        </Link>
        <Link 
          href={socialLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={`${socialLinkStyles} hover:scale-110 transition-transform duration-200`}
          aria-label="LinkedIn"
        >
          <FaLinkedin className="w-7 h-7" />
        </Link>
        <Link 
          href={socialLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className={`${socialLinkStyles} hover:scale-110 transition-transform duration-200`}
          aria-label="Twitter"
        >
          <FaTwitter className="w-7 h-7" />
        </Link>
        <Link 
          href={socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className={`${socialLinkStyles} hover:scale-110 transition-transform duration-200`}
          aria-label="Instagram"
        >
          <FaInstagram className="w-7 h-7" />
        </Link>
        <a 
          href={socialLinks.email}
          className={`${socialLinkStyles} hover:scale-110 transition-transform duration-200`}
          aria-label="Email"
        >
          <FaEnvelope className="w-7 h-7" />
        </a>
        <a 
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={`${socialLinkStyles} hover:scale-110 transition-transform duration-200`}
          aria-label="Resume"
          title="Download Resume"
        >
          <FaFileAlt className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
};
