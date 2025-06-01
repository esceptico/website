'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PersonalInfo } from '@/components/content/PersonalInfo';
import { ExperienceEntry } from '@/components/shared/ExperienceEntry';
import { experiences } from '@/personal-content';

export function AboutPage() {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Basic fade-in for the whole page
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: mounted ? 1 : 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 md:pl-32 py-8 md:py-12"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <PersonalInfo />
      <div className="mt-8 relative">
        <div>
          {experiences.map((experience, index) => (
            <ExperienceEntry 
              key={index} 
              company={experience.company}
              roles={experience.roles}
              isHovered={hoveredIndex === index}
              isDimmed={hoveredIndex !== null && hoveredIndex !== index}
              onHover={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
