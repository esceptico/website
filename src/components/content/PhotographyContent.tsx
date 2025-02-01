'use client';

import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { EquipmentSection } from '@/components/shared/EquipmentSection';
import { photographyEquipment } from '@/constants/content/equipment';

export const PhotographyContent = () => (
  <div className="space-y-4">
    <section>
      <SectionHeader title="Equipment" />
      <div className="grid grid-cols-2 gap-6">
        {photographyEquipment.map((equipment, index) => (
          <EquipmentSection key={index} equipment={equipment} />
        ))}
      </div>
    </section>

    <section>
      <SectionHeader title="Style & Approach" />
      <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20 group hover:before:bg-[var(--theme-accent-primary)] before:transition-colors duration-200">
        <motion.div 
          className="relative mb-2"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
        >
          <p className="text-[var(--theme-text-secondary)]">
            My photographic style emphasizes natural light and thoughtful composition. I believe in 
            capturing authentic moments while maintaining technical excellence, whether shooting 
            street photography, portraits, or landscapes.
          </p>
        </motion.div>
      </div>
    </section>
  </div>
); 
