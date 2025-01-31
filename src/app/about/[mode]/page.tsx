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

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <AboutPage mode={mode} />
      </div>
    </div>
  );
} 
