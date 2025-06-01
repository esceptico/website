'use client';

import HackerTextEffect from './HackerTextEffect';
import { FaGithub, FaLinkedin, FaEnvelope, FaInstagram, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';
import { socialLinks, hackerTextItems, aboutText } from '@/personal-content';

export const PersonalInfo = () => {
  const socialLinkStyles = "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors";
  
  return (
    <div className={`relative text-left pt-16 md:pt-24 pb-8`}> 
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <h1 
          className="text-xl md:text-2xl font-normal text-[var(--theme-text-secondary)] tracking-wider"
        >
          <HackerTextEffect texts={[...hackerTextItems]} />
        </h1>
        <div className="flex items-center space-x-4">
          <Link 
            href={socialLinks.github}
            target="_blank"
            className={socialLinkStyles}
            aria-label="GitHub"
          >
            <FaGithub className="w-5 h-5" />
          </Link>
          <Link 
            href={socialLinks.linkedin}
            target="_blank"
            className={socialLinkStyles}
            aria-label="LinkedIn"
          >
            <FaLinkedin className="w-5 h-5" />
          </Link>
          <Link 
            href={socialLinks.twitter}
            target="_blank"
            className={socialLinkStyles}
            aria-label="Twitter"
          >
            <FaTwitter className="w-5 h-5" />
          </Link>
          <a 
            href={socialLinks.instagram}
            target="_blank"
            className={socialLinkStyles}
            aria-label="Instagram"
          >
            <FaInstagram className="w-5 h-5" />
          </a>
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
