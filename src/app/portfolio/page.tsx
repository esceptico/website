'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '@/store/theme';

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

const Lightbox = ({ photo, onClose }: { photo: typeof photos[0]; onClose: () => void }) => {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 ${
          isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-300 hover:text-white'
        }`}
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
      <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.src}
          alt={photo.alt}
          className="w-full h-auto rounded-lg"
        />
        <div className={`mt-4 ${isDark ? 'text-gray-200' : 'text-gray-100'}`}>
          <h3 className="text-xl font-bold">{photo.title}</h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-300'}>{photo.category}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function Portfolio() {
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === 'dark';

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-light text-[var(--theme-text-primary)]">
            Photography Portfolio
            <span className="block text-xl mt-2 text-[var(--theme-accent-primary)]">
              Capturing Moments in Time
            </span>
          </h1>
          <p className="text-[var(--theme-text-secondary)] max-w-3xl">
            A selection of my favorite photographs, showcasing a mix of landscapes,
            street photography, and portraits. Each image tells its own story and
            captures a unique moment in time.
          </p>
        </div>

        <motion.div 
          className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.15
              }}
              className="bg-[var(--theme-bg-card)] backdrop-blur-sm rounded-xl border border-[var(--theme-border)] overflow-hidden hover:-translate-y-1 transition-transform duration-200"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-w-16 aspect-h-9 bg-[var(--theme-border)]">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CameraIcon className="h-5 w-5 text-[var(--theme-accent-primary)]" />
                  <h3 className="text-xl font-bold text-[var(--theme-text-primary)]">
                    {photo.title}
                  </h3>
                </div>
                <p className="text-[var(--theme-text-secondary)] mb-4">
                  {photo.category}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {/* Add tags here */}
                </div>
                <button
                  className="inline-flex items-center text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent-primary)] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(photo);
                  }}
                >
                  View Full Size
                  <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence>
          {selectedPhoto && (
            <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 