'use client';

import { PhotoGallery } from '@/components/PhotoGallery';
import { photos } from '@/data/photos';

export default function Portfolio() {
  return <PhotoGallery photos={photos} />;
}