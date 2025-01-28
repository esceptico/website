'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '@/store/theme';
import { SectionHeader } from '@/components/SectionHeader';

// Sample photo data - replace with your actual photos
const photos = [
  {
    id: 1,
    title: 'Mountain Sunrise',
    category: 'Landscape',
    src: 'https://picsum.photos/1200?random=1',
    alt: 'Mountain sunrise landscape',
  },
  {
    id: 2,
    title: 'Urban Portrait',
    category: 'Portrait',
    src: 'https://picsum.photos/1200?random=2',
    alt: 'Urban portrait photography',
  },
  {
    id: 3,
    title: 'Ocean Waves',
    category: 'Seascape',
    src: 'https://picsum.photos/1200?random=3',
    alt: 'Ocean waves at sunset',
  },
  {
    id: 4,
    title: 'Street Life',
    category: 'Street',
    src: 'https://picsum.photos/1200?random=4',
    alt: 'Street photography scene',
  },
  {
    id: 5,
    title: 'Forest Path',
    category: 'Nature',
    src: 'https://picsum.photos/1200?random=5',
    alt: 'Path through a forest',
  },
  {
    id: 6,
    title: 'City Lights',
    category: 'Urban',
    src: 'https://picsum.photos/1200?random=6',
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

const PortfolioImage = ({ photo, index, onClick }: { 
  photo: typeof photos[0]; 
  index: number;
  onClick: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative mb-4 break-inside-avoid"
      onClick={onClick}
    >
      <div className="group relative cursor-pointer overflow-hidden rounded-lg">
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          className="w-full h-auto transform transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="text-white text-lg font-light">{photo.title}</h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Portfolio() {
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);

  return (
    <div className="min-h-screen p-8 bg-[var(--theme-bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <SectionHeader title="Photography" as="h1" variant="primary" useAccentColor />
        </div>

        <motion.div 
          layout
          className="columns-1 sm:columns-2 lg:columns-3 gap-4"
        >
          {photos.map((photo, index) => (
            <PortfolioImage
              key={photo.id}
              photo={photo}
              index={index}
              onClick={() => setSelectedPhoto(photo)}
            />
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