'use client';

import HackerTextEffect from './HackerTextEffect';
import { FaGithub, FaLinkedin, FaEnvelope, FaInstagram, FaTwitter } from 'react-icons/fa';
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
      <div className="mb-8">
        <h1 
          className="text-xl md:text-2xl font-normal text-[var(--theme-text-primary)] tracking-tight cursor-pointer select-none flex items-center min-w-[300px] min-h-[3rem]"
          onClick={handleHackerTextClick}
        >
          {showEasterEgg ? (
            <span className="inline-block relative">
              <span className="font-jetbrains-mono text-xl md:text-2xl select-none inline-block">
                there are no easter eggs here
              </span>
            </span>
          ) : (
            <HackerTextEffect texts={textItems} className="text-xl md:text-2xl font-normal" />
          )}
        </h1>
      </div>

      <div className="text-base text-[var(--theme-text-primary)] leading-relaxed space-y-6 font-normal">
        <div className="markdown-content">
          <ReactMarkdown
            components={{
              a: ({ href, children, ...props }) => {
                const isInternal = href?.startsWith('/');
                const isPdf = href?.endsWith('.pdf');
                if (isInternal && !isPdf) {
                  return (
                    <Link 
                      href={href || '/'} 
                      className="hover-link transition-colors"
                    >
                      {children}
                    </Link>
                  );
                }
                return (
                  <a 
                    href={href}
                    {...props} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover-link transition-colors" 
                  >
                    {children}
                  </a>
                );
              }
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
      </div>
    </div>
  );
};
