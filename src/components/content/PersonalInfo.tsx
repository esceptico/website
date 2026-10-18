'use client';

import HackerTextEffect from './HackerTextEffect';
import { FaGithub, FaLinkedin, FaEnvelope, FaInstagram, FaTwitter, FaCalendarAlt } from 'react-icons/fa';
import Link from 'next/link';
import { socialLinks, hackerTextItems, aboutMarkdown, getTimeBasedGreeting } from '@/personal-content';
import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

export const PersonalInfo = () => {
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [greeting, setGreeting] = useState('hello');
  
  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
  }, []);

  const textItems = useMemo(() => {
    return [...hackerTextItems, greeting];
  }, [greeting]);

  useEffect(() => {
    if (clickCount >= 5 && !showEasterEgg) {
      setShowEasterEgg(true);
    }
  }, [clickCount, showEasterEgg]);

  useEffect(() => {
    if (!showEasterEgg) return;

    const t = setTimeout(() => {
      setShowEasterEgg(false);
      setClickCount(0);
    }, 3000);

    return () => clearTimeout(t);
  }, [showEasterEgg]);

  const handleHackerTextInteraction = () => {
    if (!showEasterEgg) {
      setClickCount(prev => prev + 1);
    }
  };

  
  return (
    <div className="relative text-left">
      {/* Greeting */}
      <div className="mb-8">
        {/* Mouse-only easter egg; the heading stays a plain heading for AT. */}
        <h1
          className="text-xl md:text-2xl font-normal text-[var(--theme-text-primary)] tracking-tight cursor-pointer select-none flex items-center min-w-[300px] min-h-[3rem]"
          onClick={handleHackerTextInteraction}
        >
          <span className="sr-only">Timur Ganiev</span>
          {showEasterEgg ? (
            <span aria-hidden="true" className="font-jetbrains-mono text-xl md:text-2xl select-none">
              there are no easter eggs here
            </span>
          ) : (
            <span aria-hidden="true">
              <HackerTextEffect texts={textItems} className="text-xl md:text-2xl font-normal" />
            </span>
          )}
        </h1>
      </div>

      {/* Bio */}
      <div className="text-base text-[var(--theme-text-secondary)] leading-relaxed space-y-5">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-5 last:mb-0">{children}</p>,
            // a list hangs off the line above it ("now i'm building:")
            ul: ({ children }) => <ul className="-mt-3 mb-5 list-disc pl-5 space-y-0.5 marker:text-[var(--theme-text-muted)]">{children}</ul>,
            li: ({ children }) => <li className="pl-1">{children}</li>,
            a: ({ href, children, ...props }) => {
              const isInternal = href?.startsWith('/');
              const isPdf = href?.endsWith('.pdf');
              if (isInternal && !isPdf) {
                return (
                  <Link 
                    href={href || '/'} 
                    className="hover-link text-[var(--theme-text-primary)]"
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
                  className="hover-link text-[var(--theme-text-primary)]" 
                >
                  {children}
                </a>
              );
            }
          }}
        >
          {aboutMarkdown}
        </ReactMarkdown>
      </div>

      {/* Social links */}
      <div className="flex items-center gap-5 mt-10">
        <Link 
          href={socialLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          aria-label="GitHub"
          title="GitHub"
        >
          <FaGithub className="w-5 h-5" />
        </Link>
        <Link 
          href={socialLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          aria-label="LinkedIn"
          title="LinkedIn"
        >
          <FaLinkedin className="w-5 h-5" />
        </Link>
        <Link 
          href={socialLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          aria-label="Twitter"
          title="Twitter"
        >
          <FaTwitter className="w-5 h-5" />
        </Link>
        <Link 
          href={socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          aria-label="Instagram"
          title="Instagram"
        >
          <FaInstagram className="w-5 h-5" />
        </Link>
        <Link 
          href={socialLinks.cal}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          aria-label="Book a call"
          title="Book a call"
        >
          <FaCalendarAlt className="w-5 h-5" />
        </Link>
        <a 
          href={socialLinks.email}
          className="social-icon"
          aria-label="Email"
          title="Email"
        >
          <FaEnvelope className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};
