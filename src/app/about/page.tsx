'use client';

import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/theme';
import { useEffect, useState } from 'react';

export default function About() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      router.replace(`/about/${mode}`);
    }
  }, [mode, mounted, router]);

  return null;
} 