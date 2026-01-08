'use client';

import { useId, useState } from 'react';

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
  const [isHovered, setIsHovered] = useState(false);
  
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${groupClass} no-underline inline-flex items-baseline`}
      >
        <span 
          className="anchor-symbol overflow-hidden font-normal select-none whitespace-nowrap"
          style={{
            width: isHovered ? symbolWidths[Tag] : 0,
            marginRight: isHovered ? '0.5rem' : 0,
            opacity: isHovered ? 0.4 : 0,
            transition: isHovered 
              ? 'width 250ms cubic-bezier(0.33, 1, 0.68, 1), margin-right 250ms cubic-bezier(0.33, 1, 0.68, 1), opacity 150ms ease-out 180ms'
              : 'opacity 100ms ease-out, width 200ms cubic-bezier(0.33, 1, 0.68, 1) 80ms, margin-right 200ms cubic-bezier(0.33, 1, 0.68, 1) 80ms',
          }}
        >
          {levelSymbols[Tag]}
        </span>
        <span>{children}</span>
      </a>
    </Tag>
  );
}
