'use client';

export default function BlogTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--theme-bg-primary)] transition-colors duration-300">
      {children}
    </div>
  );
}
