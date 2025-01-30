'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Photo {
  id: number;
  src: string;
  alt: string;
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
  const [fullscreenPhoto, setFullscreenPhoto] = useState<Photo | null>(null);
  const [fullscreenInitialPosition, setFullscreenInitialPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Calculate constraints based on photos length
  const stepPerPhoto = 100 / photos.length;
  const centerOffset = stepPerPhoto / 2;
  const minPercentage = -centerOffset;
  const maxPercentage = -(100 - centerOffset);

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
      { duration: 1200, fill: "forwards", easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
    );

    for (const image of track.getElementsByClassName("image")) {
      (image as HTMLElement).animate(
        {
          objectPosition: `${100 + constrainedPercentage * 1.8}% center`
        },
        { duration: 1200, fill: "forwards", easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
      );
    }

    // Calculate current index based on centered position
    const normalizedPercentage = -constrainedPercentage - centerOffset;
    const newIndex = Math.round(normalizedPercentage / stepPerPhoto);
    setCurrentIndex(Math.max(0, Math.min(newIndex, photos.length - 1)));
  };

  const openFullscreen = (photo: Photo, element: HTMLElement) => {
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

    const handleOnDown = (e: MouseEvent | TouchEvent) => {
      if (!track) return;
      isMouseDownRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      track.dataset.mouseDownAt = clientX.toString();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const handleOnUp = () => {
      if (!track) return;
      isMouseDownRef.current = false;
      track.dataset.mouseDownAt = "0";
      track.dataset.prevPercentage = track.dataset.percentage || "0";
      lastTimeRef.current = performance.now();
      animateDeceleration();
    };

    const animateDeceleration = () => {
      if (!track || isMouseDownRef.current) return;

      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      const friction = 2.2;
      velocityRef.current *= Math.exp(-friction * deltaTime);

      if (Math.abs(velocityRef.current) > 0.005) {
        const currentPercentage = parseFloat(track.dataset.percentage || "0");
        const nextPercentage = Math.max(
          Math.min(currentPercentage + velocityRef.current * deltaTime * 100, minPercentage),
          maxPercentage
        );

        moveTrack(nextPercentage, velocityRef.current);
        animationFrameRef.current = requestAnimationFrame(animateDeceleration);
      }
    };

    const handleOnMove = (e: MouseEvent | TouchEvent) => {
      if (!track) return;
      if (track.dataset.mouseDownAt === "0") return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const mouseDelta = parseFloat(track.dataset.mouseDownAt || "0") - clientX;
      const maxDelta = window.innerWidth / 2;

      const percentage = (mouseDelta / maxDelta) * -100;
      const nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage || "0") + percentage;
      const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, -20), -100);

      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      if (deltaTime > 0) {
        velocityRef.current = (percentage / deltaTime) * 0.05;
      }
      lastTimeRef.current = currentTime;

      moveTrack(nextPercentage, velocityRef.current);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!track) return;

      const currentPercentage = parseFloat(track.dataset.percentage || "0");
      const delta = e.deltaY || e.deltaX;
      const nextPercentage = Math.max(Math.min(currentPercentage - delta * 0.1, 0), -100);
      
      track.dataset.prevPercentage = nextPercentage.toString();
      moveTrack(nextPercentage);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!track) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        
        const currentPercentage = parseFloat(track.dataset.percentage || "0");
        let nextPercentage = currentPercentage;

        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextPercentage = Math.min(currentPercentage + 5, 0);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextPercentage = Math.max(currentPercentage - 5, -100);
        }

        if (nextPercentage !== currentPercentage) {
          track.dataset.prevPercentage = nextPercentage.toString();
          moveTrack(nextPercentage);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => handleOnDown(e);
    const handleTouchEnd = () => handleOnUp();
    const handleTouchMove = (e: TouchEvent) => handleOnMove(e);

    window.addEventListener('mousedown', handleOnDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('mouseup', handleOnUp);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mousemove', handleOnMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleOnDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mouseup', handleOnUp);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousemove', handleOnMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [photos.length]);

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
          transform: 'translate(-10%, -50%)',  // Updated to match new constraint
        }}
        data-mouse-down-at="0"
        data-prev-percentage="-10"
        data-percentage="-10"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          },
          exit: {
            transition: {
              staggerChildren: 0.05,
              staggerDirection: -1
            }
          }
        }}
      >
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            className="relative h-[56vmin] w-[40vmin] overflow-hidden cursor-grab active:cursor-grabbing"
            variants={{
              hidden: { 
                opacity: 0,
                y: -50
              },
              visible: { 
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }
              },
              exit: {
                opacity: 0,
                y: 50,
                transition: {
                  duration: 0.4,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }
              }
            }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="image object-cover object-center drag-none scale-[3]"
              draggable={false}
              sizes="40vmin"
              style={{ objectPosition: '100% center' }}
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
                  const currentIndex = photos.findIndex(p => p.id === fullscreenPhoto.id);
                  if (currentIndex > 0) {
                    setFullscreenPhoto(photos[currentIndex - 1]);
                  }
                }}
                disabled={photos.findIndex(p => p.id === fullscreenPhoto.id) === 0}
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
                  const currentIndex = photos.findIndex(p => p.id === fullscreenPhoto.id);
                  if (currentIndex < photos.length - 1) {
                    setFullscreenPhoto(photos[currentIndex + 1]);
                  }
                }}
                disabled={photos.findIndex(p => p.id === fullscreenPhoto.id) === photos.length - 1}
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
            {currentIndex + 1} — {photos.length}
          </div>
          
          {/* Thumbnails */}
          <div className="flex gap-2 h-full py-2 overflow-x-auto">
            {photos.map((photo, index) => (
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
                  sizes="80px"
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