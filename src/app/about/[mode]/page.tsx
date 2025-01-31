'use client';

import { AboutPage } from '@/components/AboutPage';
import { useParams } from 'next/navigation';
import { Mode } from '@/types/theme';
import { notFound } from 'next/navigation';

export default function DynamicAboutPage() {
  const params = useParams();
  const mode = params.mode as Mode;

  if (mode !== 'mle' && mode !== 'photography') {
    notFound();
  }

  return <AboutPage mode={mode} />;
} 
