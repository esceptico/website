'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Photo {
  id: number;
  src: string;
  alt: string;
}

interface PhotoWithDimensions extends Photo {
  width: number;
  height: number;
}

interface FullscreenPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
}

interface FullscreenNavigationProps {
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  currentIndex: number;
  totalPhotos: number;
}

const FullscreenNavigation = ({ onClose, onNavigate, currentIndex, totalPhotos }: FullscreenNavigationProps) => (
  <>
    <button
      className="absolute top-4 right-4 text-white/70 hover:text-white z-50 p-2"
      onClick={onClose}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
      <button
        className="p-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate('prev');
        }}
        disabled={currentIndex === 0}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        className="p-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate('next');
        }}
        disabled={currentIndex === totalPhotos - 1}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </>
);

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<PhotoWithDimensions | null>(null);
  const [photosWithDimensions, setPhotosWithDimensions] = useState<PhotoWithDimensions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const slideVariants = {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: "easeIn"
      }
    }
  };

  // Load image dimensions
  useEffect(() => {
    const loadImageDimensions = async () => {
      setIsLoading(true);
      const loadedPhotos = await Promise.all(photos.map(async (photo) => {
        try {
          const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = document.createElement('img');
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = reject;
            img.src = photo.src;
          });

          return { ...photo, ...dimensions };
        } catch (error) {
          console.error(`Error loading dimensions for ${photo.src}:`, error);
          return { ...photo, width: 1000, height: 1500 };
        }
      }));

      setPhotosWithDimensions(loadedPhotos);
      setIsLoading(false);
    };

    loadImageDimensions();
  }, [photos]);

  const stepPerPhoto = 100 / photosWithDimensions.length;
  const centerOffset = stepPerPhoto / 2;
  const minPercentage = -centerOffset;
  const maxPercentage = -(100 - centerOffset);
  const PARALLAX_POWER = 0.9;

  const getImageScale = (photo: PhotoWithDimensions) => {
    const aspectRatio = photo.width / photo.height;
    const containerAspectRatio = 40 / 56;
    const baseScale = aspectRatio > containerAspectRatio 
      ? 56 / (photo.height * (40 / photo.width))
      : 40 / (photo.width * (56 / photo.height));
    return Math.ceil(baseScale * 100) / 100 + 0.05;
  };

  const moveTrack = (nextPercentage: number) => {
    const track = trackRef.current;
    if (!track) return;
    
    const constrainedPercentage = Math.max(Math.min(nextPercentage, minPercentage), maxPercentage);
    track.dataset.percentage = constrainedPercentage.toString();

    track.animate(
      { transform: `translate(${constrainedPercentage}%, -50%)` },
      { duration: 2400, fill: "forwards", easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
    );

    const centerPoint = -constrainedPercentage;
    const images = track.getElementsByClassName("image");
    
    for (const image of Array.from(images)) {
      const index = Array.from(images).indexOf(image);
      const imagePosition = (index * stepPerPhoto) - centerPoint;
      const normalizedPosition = imagePosition / stepPerPhoto;
      const parallaxOffset = 50 + ((normalizedPosition * 50) * PARALLAX_POWER);
      
      (image as HTMLElement).animate(
        { objectPosition: `${parallaxOffset}% center` },
        { duration: 2400, fill: "forwards", easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      );
    }

    const normalizedPercentage = -constrainedPercentage - centerOffset;
    setCurrentIndex(Math.max(0, Math.min(Math.round(normalizedPercentage / stepPerPhoto), photosWithDimensions.length - 1)));
  };

  const openFullscreen = (photo: PhotoWithDimensions) => {
    setFullscreenPhoto(photo);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track || track.dataset.percentage || isLoading || photosWithDimensions.length === 0) return;

    // Set initial positions
    track.dataset.percentage = (-centerOffset).toString();
    moveTrack(-centerOffset);
  }, [photosWithDimensions.length, isLoading]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const currentPercentage = parseFloat(track.dataset.percentage || "0");
      const delta = e.deltaY || e.deltaX;
      moveTrack(currentPercentage - delta * 0.1);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      
      if (fullscreenPhoto) {
        const currentIndex = photosWithDimensions.findIndex(p => p.id === fullscreenPhoto.id);
        if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && currentIndex > 0) {
          setDirection('prev');
          setFullscreenPhoto(photosWithDimensions[currentIndex - 1]);
        } else if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && currentIndex < photosWithDimensions.length - 1) {
          setDirection('next');
          setFullscreenPhoto(photosWithDimensions[currentIndex + 1]);
        }
        return;
      }

      const currentPercentage = parseFloat(track.dataset.percentage || "0");
      const isLeft = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
      moveTrack(currentPercentage + (isLeft ? stepPerPhoto : -stepPerPhoto));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [photosWithDimensions.length, fullscreenPhoto]);

  const navigateFullscreen = (dir: 'prev' | 'next') => {
    if (!fullscreenPhoto) return;
    
    const currentIndex = photosWithDimensions.findIndex(p => p.id === fullscreenPhoto.id);
    const newIndex = dir === 'prev' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < photosWithDimensions.length) {
      setDirection(dir);
      setFullscreenPhoto(photosWithDimensions[newIndex]);
      moveTrack(-(newIndex * stepPerPhoto + centerOffset));
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--theme-bg)] scrollbar-hide">
      <motion.div
        ref={trackRef}
        className="flex gap-[4vmin] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
        style={{ 
          transform: `translate(${-centerOffset}%, -50%)`,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out'
        }}
      >
        {photosWithDimensions.map((photo, index) => (
          <motion.div
            key={photo.id}
            className="relative h-[56vmin] w-[40vmin] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 1,
              ease: "easeOut",
              delay: index * 0.15
            }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="image object-cover object-center"
              style={{ 
                objectPosition: '50% center',
                transform: `scale(${getImageScale(photo)})`
              }}
              sizes="(max-width: 768px) 80vw, 40vw"
              quality={95}
              priority={index < 3}
              onClick={() => openFullscreen(photo)}
            />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {fullscreenPhoto && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={fullscreenPhoto.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                >
                  <Image
                    src={fullscreenPhoto.src}
                    alt={fullscreenPhoto.alt}
                    fill
                    className="object-contain select-none"
                    sizes="100vw"
                    quality={95}
                    priority
                    onClick={(e) => e.stopPropagation()}
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <FullscreenNavigation
              onClose={() => {
                const index = photosWithDimensions.findIndex(p => p.id === fullscreenPhoto.id);
                moveTrack(-(index * stepPerPhoto + centerOffset));
                setFullscreenPhoto(null);
              }}
              onNavigate={navigateFullscreen}
              currentIndex={photosWithDimensions.findIndex(p => p.id === fullscreenPhoto.id)}
              totalPhotos={photosWithDimensions.length}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`fixed bottom-0 left-0 right-0 h-20 bg-black/50 backdrop-blur-sm ${fullscreenPhoto ? 'z-[60]' : 'z-20'}`}>
        <div className="flex items-center justify-between h-full px-4 max-w-screen-xl mx-auto">
          <div className="shrink-0 text-white/70 font-mono w-24 text-center">
            {(fullscreenPhoto ? photosWithDimensions.findIndex(p => p.id === fullscreenPhoto.id) : currentIndex) + 1} — {photosWithDimensions.length}
          </div>
          
          <div className="flex-1 flex justify-center mx-4">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex min-w-min px-2">
                <div className="flex gap-2 h-full py-3">
                  {photosWithDimensions.map((photo, index) => (
                    <div
                      key={photo.id}
                      className={`relative w-10 h-14 transition-all cursor-pointer shrink-0 ${
                        (fullscreenPhoto ? photo.id === fullscreenPhoto.id : index === currentIndex) ? 'opacity-100 ring-2 ring-white' : 'opacity-30 hover:opacity-50'
                      }`}
                      onClick={() => {
                        if (fullscreenPhoto) {
                          setFullscreenPhoto(photo);
                        } else {
                          moveTrack(-(index * stepPerPhoto + centerOffset));
                        }
                      }}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        className="object-cover rounded-sm"
                        sizes="40px"
                        quality={85}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 text-white/30 text-sm">
            Use ← → keys {!fullscreenPhoto && 'or scroll'}
          </div>
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }
        body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
} 