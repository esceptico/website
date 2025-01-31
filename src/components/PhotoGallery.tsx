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

interface PhotoGalleryProps {
  photos: Photo[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const velocityRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const isMouseDownRef = useRef<boolean>(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<PhotoWithDimensions | null>(null);
  const [fullscreenInitialPosition, setFullscreenInitialPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [photosWithDimensions, setPhotosWithDimensions] = useState<PhotoWithDimensions[]>([]);

  // Load image dimensions
  useEffect(() => {
    const loadImageDimensions = async () => {
      const dimensionsPromises = photos.map(async (photo) => {
        try {
          // Create a promise that resolves with the image dimensions
          const dimensionsPromise = new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = document.createElement('img');
            img.onload = () => {
              resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            };
            img.onerror = reject;
            img.src = photo.src;
          });

          const dimensions = await dimensionsPromise;
          return {
            ...photo,
            width: dimensions.width,
            height: dimensions.height,
          };
        } catch (error) {
          console.error(`Error loading dimensions for ${photo.src}:`, error);
          // Fallback dimensions if loading fails
          return {
            ...photo,
            width: 1000,
            height: 1500,
          };
        }
      });

      const loadedPhotos = await Promise.all(dimensionsPromises);
      setPhotosWithDimensions(loadedPhotos);
    };

    loadImageDimensions();
  }, [photos]);

  // Calculate constraints based on photos length
  const stepPerPhoto = 100 / photosWithDimensions.length;
  const centerOffset = stepPerPhoto / 2;
  const minPercentage = -centerOffset;
  const maxPercentage = -(100 - centerOffset);
  const PARALLAX_POWER = 0.9; // Adjust this value to control effect strength: 
                             // 1.0 = full movement (0-100%)
                             // 0.5 = half movement (25-75%)
                             // 0.3 = subtle movement (35-65%)
                             // 2.0 = exaggerated movement (will go beyond 0-100%)

  // Calculate the required scale for an image
  const getImageScale = (photo: PhotoWithDimensions) => {
    const aspectRatio = photo.width / photo.height;
    const containerAspectRatio = 40 / 56; // w-[40vmin] / h-[56vmin]
    
    // Base scale needed to cover the container
    let baseScale = aspectRatio > containerAspectRatio 
      ? 56 / (photo.height * (40 / photo.width)) // height-constrained
      : 40 / (photo.width * (56 / photo.height)); // width-constrained

    // We only need minimal extra scale since we're using the full width of the image
    // Just add a small buffer for smooth movement
    return Math.ceil(baseScale * 100) / 100 + 0.05;
  };

  const moveTrack = (nextPercentage: number, velocity = 0) => {
    const track = trackRef.current;
    if (!track) return;
    velocityRef.current = velocity;
    
    const constrainedPercentage = Math.max(Math.min(nextPercentage, minPercentage), maxPercentage);
    track.dataset.percentage = constrainedPercentage.toString();

    track.animate(
      {
        transform: `translate(${constrainedPercentage}%, -50%)`
      },
      { 
        duration: 2400, 
        fill: "forwards", 
        easing: "cubic-bezier(0.23, 1, 0.32, 1)"
      }
    );

    // Calculate the center point of the track
    const centerPoint = -constrainedPercentage;
    
    const images = track.getElementsByClassName("image");
    for (let i = 0; i < images.length; i++) {
      const image = images[i] as HTMLElement;
      // Calculate image's position relative to center
      const imagePosition = (i * stepPerPhoto) - centerPoint;
      
      // Normalize the position to -1 to 1 range
      const normalizedPosition = imagePosition / stepPerPhoto;
      
      // Calculate parallax offset with adjustable power
      // Center point (50%) + offset * power
      const parallaxOffset = 50 + ((normalizedPosition * 50) * PARALLAX_POWER);
      
      image.animate(
        {
          objectPosition: `${parallaxOffset}% center`
        },
        { 
          duration: 2400, 
          fill: "forwards", 
          easing: "cubic-bezier(0.23, 1, 0.32, 1)"
        }
      );
    }

    // Calculate current index based on centered position
    const normalizedPercentage = -constrainedPercentage - centerOffset;
    const newIndex = Math.round(normalizedPercentage / stepPerPhoto);
    setCurrentIndex(Math.max(0, Math.min(newIndex, photosWithDimensions.length - 1)));
  };

  const openFullscreen = (photo: PhotoWithDimensions, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const currentTransform = getComputedStyle(element).transform;
    const matrix = new DOMMatrix(currentTransform);
    
    setFullscreenInitialPosition({
      x: rect.left + matrix.m41,
      y: rect.top + matrix.m42,
      width: rect.width,
      height: rect.height
    });
    setFullscreenPhoto(photo);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = (-centerOffset).toString();
    track.dataset.percentage = (-centerOffset).toString();

    // Set initial centered position
    moveTrack(-centerOffset);

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!track) return;

      const currentPercentage = parseFloat(track.dataset.percentage || "0");
      const delta = e.deltaY || e.deltaX;
      const nextPercentage = Math.max(Math.min(currentPercentage - delta * 0.1, minPercentage), maxPercentage);
      
      track.dataset.prevPercentage = nextPercentage.toString();
      moveTrack(nextPercentage);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!track) return;
        
        const currentPercentage = parseFloat(track.dataset.percentage || "0");
        let nextPercentage = currentPercentage;

        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextPercentage = Math.min(currentPercentage + stepPerPhoto, minPercentage);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextPercentage = Math.max(currentPercentage - stepPerPhoto, maxPercentage);
        }

        track.dataset.prevPercentage = nextPercentage.toString();
        moveTrack(nextPercentage);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [photosWithDimensions.length]);

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--theme-bg)] scrollbar-hide">
      {/* Main gallery */}
      <motion.div
        ref={trackRef}
        id="image-track"
        className="
          flex gap-[4vmin] 
          absolute 
          top-1/2 left-1/2 
          -translate-x-1/2 -translate-y-1/2
          select-none
        "
        style={{ 
          transform: `translate(${-centerOffset}%, -50%)`,
        }}
        data-mouse-down-at="0"
        data-prev-percentage={(-centerOffset).toString()}
        data-percentage={(-centerOffset).toString()}
      >
        {photosWithDimensions.map((photo, index) => (
          <motion.div
            key={photo.id}
            className="relative h-[56vmin] w-[40vmin] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.6,
              ease: [0.22, 1, 0.36, 1],
              delay: index * 0.2,
            }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className={`image object-cover object-center`}
              style={{ 
                objectPosition: '50% center',
                transform: `scale(${getImageScale(photo)})`
              }}
              sizes="(max-width: 768px) 80vw, 40vw"
              quality={95}
              onClick={(e) => {
                e.stopPropagation();
                const element = e.currentTarget.parentElement;
                if (element) {
                  openFullscreen(photo, element);
                }
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Fullscreen view */}
      <AnimatePresence>
        {fullscreenPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg"
            onClick={() => setFullscreenPhoto(null)}
          >
            <motion.div
              className="absolute"
              initial={{
                x: fullscreenInitialPosition.x,
                y: fullscreenInitialPosition.y,
                width: fullscreenInitialPosition.width,
                height: fullscreenInitialPosition.height,
              }}
              animate={{
                x: 0,
                y: 0,
                width: '100vw',
                height: '100vh',
                transition: {
                  duration: 0.6,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }
              }}
              exit={{
                x: fullscreenInitialPosition.x,
                y: fullscreenInitialPosition.y,
                width: fullscreenInitialPosition.width,
                height: fullscreenInitialPosition.height,
                transition: {
                  duration: 0.5,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }
              }}
            >
              <motion.div
                className="w-full h-full relative"
                initial={{ scale: 3, objectPosition: '100% center' }}
                animate={{ 
                  scale: 1,
                  transition: {
                    duration: 0.6,
                    ease: [0.43, 0.13, 0.23, 0.96]
                  }
                }}
                exit={{ 
                  scale: 3,
                  transition: {
                    duration: 0.5,
                    ease: [0.43, 0.13, 0.23, 0.96]
                  }
                }}
              >
                <Image
                  src={fullscreenPhoto.src}
                  alt={fullscreenPhoto.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  quality={100}
                  priority
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            </motion.div>

            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white z-50 p-2"
              onClick={() => setFullscreenPhoto(null)}
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

            {/* Navigation arrows */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
              <button
                className="p-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = photosWithDimensions.findIndex(p => p.id === fullscreenPhoto.id);
                  if (currentIndex > 0) {
                    setFullscreenPhoto(photosWithDimensions[currentIndex - 1]);
                  }
                }}
                disabled={photosWithDimensions.findIndex(p => p.id === fullscreenPhoto.id) === 0}
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
                  const currentIndex = photosWithDimensions.findIndex(p => p.id === fullscreenPhoto.id);
                  if (currentIndex < photosWithDimensions.length - 1) {
                    setFullscreenPhoto(photosWithDimensions[currentIndex + 1]);
                  }
                }}
                disabled={photosWithDimensions.findIndex(p => p.id === fullscreenPhoto.id) === photosWithDimensions.length - 1}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview strip */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-sm z-20">
        <div className="flex items-center justify-between h-full px-4 max-w-screen-xl mx-auto">
          {/* Counter */}
          <div className="text-white/70 font-light">
            {currentIndex + 1} — {photosWithDimensions.length}
          </div>
          
          {/* Thumbnails */}
          <div className="flex gap-2 h-full py-2 overflow-x-auto">
            {photosWithDimensions.map((photo, index) => (
              <div
                key={photo.id}
                className={`relative h-full aspect-[3/4] transition-all cursor-pointer ${
                  index === currentIndex ? 'opacity-100 ring-2 ring-white' : 'opacity-30 hover:opacity-50'
                }`}
                onClick={() => {
                  if (!trackRef.current) return;
                  const nextPercentage = -(index * stepPerPhoto + centerOffset);
                  trackRef.current.dataset.prevPercentage = nextPercentage.toString();
                  moveTrack(nextPercentage);
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover rounded-sm"
                  sizes="120px"
                  quality={85}
                />
              </div>
            ))}
          </div>

          {/* Navigation hint */}
          <div className="text-white/30 text-sm">
            Use ← → keys or scroll
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        body {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
} 