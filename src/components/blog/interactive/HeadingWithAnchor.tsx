'use client';

interface HeadingWithAnchorProps {
  as: 'h1' | 'h2' | 'h3';
  id: string;
  className: string;
  children: React.ReactNode;
}

export function HeadingWithAnchor({ as: Tag, id, className, children }: HeadingWithAnchorProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - 100,
        behavior: 'smooth'
      });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <Tag id={id} className={className}>
      <a
        href={`#${id}`}
        onClick={handleClick}
        className="no-underline hover:text-[var(--accent)] transition-colors"
      >
        {children}
      </a>
    </Tag>
  );
}
