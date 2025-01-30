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

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = "0";
    track.dataset.percentage = "0";

    const handleOnDown = (e: MouseEvent | TouchEvent) => {
      if (!track) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      track.dataset.mouseDownAt = clientX.toString();
    };

    const handleOnUp = () => {
      if (!track) return;
      track.dataset.mouseDownAt = "0";
      track.dataset.prevPercentage = track.dataset.percentage || "0";
    };

    const moveTrack = (nextPercentage: number) => {
      if (!track) return;

      track.dataset.percentage = nextPercentage.toString();

      track.animate(
        {
          transform: `translate(${nextPercentage}%, -50%)`
        },
        { duration: 1200, fill: "forwards" }
      );

      for (const image of track.getElementsByClassName("image")) {
        (image as HTMLElement).animate(
          {
            objectPosition: `${100 + nextPercentage}% center`
          },
          { duration: 1200, fill: "forwards" }
        );
      }

      const imageWidthPercentage = 100 / photos.length;
      const newIndex = Math.round((nextPercentage * -1) / imageWidthPercentage);
      setCurrentIndex(Math.max(0, Math.min(newIndex, photos.length - 1)));
    };

    const handleOnMove = (e: MouseEvent | TouchEvent) => {
      if (!track) return;
      if (track.dataset.mouseDownAt === "0") return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const mouseDelta = parseFloat(track.dataset.mouseDownAt || "0") - clientX;
      const maxDelta = window.innerWidth / 2;

      const percentage = (mouseDelta / maxDelta) * -100;
      const nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage || "0") + percentage;
      const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

      moveTrack(nextPercentage);
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
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        
        const currentPercentage = parseFloat(track.dataset.percentage || "0");
        let nextPercentage = currentPercentage;

        if (e.key === 'ArrowLeft') {
          nextPercentage = Math.min(currentPercentage + 10, 0);
        } else if (e.key === 'ArrowRight') {
          nextPercentage = Math.max(currentPercentage - 10, -100);
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
        style={{}}
        data-mouse-down-at="0"
        data-prev-percentage="0"
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
            className="relative h-[56vmin] w-[40vmin] cursor-grab active:cursor-grabbing"
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
              className="image object-cover object-center drag-none"
              draggable={false}
              sizes="40vmin"
            />
          </motion.div>
        ))}
      </motion.div>

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
                className={`relative h-full aspect-[3/4] transition-opacity ${
                  index === currentIndex ? 'opacity-100' : 'opacity-30'
                }`}
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