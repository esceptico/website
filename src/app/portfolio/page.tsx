'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { photos } from '@/data/photos';
import { PhotoGalleryLoading } from '@/components/PhotoGalleryLoading';

// Dynamically import PhotoGallery with loading state
const PhotoGallery = dynamic(
  () => import('@/components/PhotoGallery').then(mod => ({ default: mod.PhotoGallery })),
  {
    loading: () => <PhotoGalleryLoading />,
    ssr: false // Disable SSR for the gallery to prevent hydration issues
  }
);

export default function Portfolio() {
  return (
    <Suspense fallback={<PhotoGalleryLoading />}>
      <PhotoGallery photos={photos} />
    </Suspense>
  );
}