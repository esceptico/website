'use client';

import { useThemeStore } from '@/store/theme';

export default function BlogTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const mode = useThemeStore(state => state.mode);

  return (
    <div className="min-h-screen bg-[var(--theme-bg-primary)] transition-colors duration-300">
      {children}
    </div>
  );
} 