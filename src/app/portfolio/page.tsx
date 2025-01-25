'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);

  return (
    <motion.div 
      className="min-h-screen p-8 bg-gradient-to-bl from-amber-50 via-white to-amber-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-light text-amber-900">
            Photography
            <span className="block text-xl text-amber-600 mt-2">Capturing Moments in Time</span>
          </h1>
          <p className="text-gray-600 max-w-3xl">
            A collection of my favorite photographs, capturing moments and scenes
            that tell unique stories. Each image represents a blend of technical
            skill and artistic vision.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="relative aspect-w-16 aspect-h-9 group cursor-pointer hover:-translate-y-1 transition-transform duration-200"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-75 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CameraIcon className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">{photo.title}</h3>
                  </div>
                  <p className="text-sm">{photo.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
} 