'use client';

import { useId } from 'react';

interface HeadingWithAnchorProps {
  as: 'h1' | 'h2' | 'h3';
  id: string;
  className: string;
  children: React.ReactNode;
}

const levelSymbols = {
  h1: '#',
  h2: '##',
  h3: '###',
};

const symbolWidths = {
  h1: '1.5ch',
  h2: '2.5ch',
  h3: '4ch',
};

export function HeadingWithAnchor({ as: Tag, id, className, children }: HeadingWithAnchorProps) {
  const uniqueId = useId().replace(/:/g, '');
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = 56;
      const offset = 24;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerHeight - offset,
        behavior: 'smooth'
      });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  const groupClass = `heading-${uniqueId}`;

  return (
    <Tag id={id} className={className}>
      <a
        href={`#${id}`}
        onClick={handleClick}
        className={`${groupClass} no-underline inline-flex items-baseline`}
      >
        <span 
          className="anchor-symbol overflow-hidden opacity-0 font-normal select-none whitespace-nowrap transition-all"
          style={{
            width: 0,
            marginRight: 0,
            transitionProperty: 'width, margin-right, opacity',
            transitionDuration: '150ms, 150ms, 150ms',
            transitionDelay: '0ms, 0ms, 150ms',
          }}
        >
          {levelSymbols[Tag]}
        </span>
        <span>{children}</span>
      </a>
      <style>{`
        .${groupClass}:hover .anchor-symbol {
          width: ${symbolWidths[Tag]} !important;
          margin-right: 0.5rem !important;
          opacity: 0.4 !important;
        }
      `}</style>
    </Tag>
  );
}
