'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '@/store/theme';
import { useRouter } from 'next/navigation';

// Sample photo data - replace with your actual photos
const photos = [
  {
    id: 1,
    title: 'Mountain Sunrise',
    category: 'Landscape',
    src: 'https://source.unsplash.com/random/800x600?mountain',
    alt: 'Mountain sunrise landscape',
  },
  {
    id: 2,
    title: 'Urban Portrait',
    category: 'Portrait',
    src: 'https://source.unsplash.com/random/800x600?portrait',
    alt: 'Urban portrait photography',
  },
  {
    id: 3,
    title: 'Ocean Waves',
    category: 'Seascape',
    src: 'https://source.unsplash.com/random/800x600?ocean',
    alt: 'Ocean waves at sunset',
  },
  {
    id: 4,
    title: 'Street Life',
    category: 'Street',
    src: 'https://source.unsplash.com/random/800x600?street',
    alt: 'Street photography scene',
  },
  {
    id: 5,
    title: 'Forest Path',
    category: 'Nature',
    src: 'https://source.unsplash.com/random/800x600?forest',
    alt: 'Path through a forest',
  },
  {
    id: 6,
    title: 'City Lights',
    category: 'Urban',
    src: 'https://source.unsplash.com/random/800x600?city',
    alt: 'City lights at night',
  },
];

const Lightbox = ({ photo, onClose }: { photo: typeof photos[0]; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-white hover:text-gray-300"
    >
      <XMarkIcon className="h-6 w-6" />
    </button>
    <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
      <img
        src={photo.src}
        alt={photo.alt}
        className="w-full h-auto rounded-lg"
      />
      <div className="mt-4 text-white">
        <h3 className="text-xl font-bold">{photo.title}</h3>
        <p className="text-gray-300">{photo.category}</p>
      </div>
    </div>
  </motion.div>
);

export default function Portfolio() {
  const { mode } = useThemeStore();
  const router = useRouter();
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);

  // Redirect if in MLE mode
  if (mode === 'mle') {
    router.push('/projects');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-amber-600 mb-4">Photography Portfolio</h1>
          <p className="text-gray-600 max-w-3xl">
            A collection of my favorite photographs capturing moments of beauty in landscapes,
            portraits, and street photography. Click on any image to view it in detail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transform transition hover:scale-105"
                />
              </div>
              <div className="mt-2">
                <h3 className="text-lg font-medium text-gray-900">{photo.title}</h3>
                <p className="text-sm text-gray-500">{photo.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedPhoto && (
          <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        )}
      </AnimatePresence>
    </div>
  );
} 