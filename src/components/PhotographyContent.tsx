'use client';

import { motion } from 'framer-motion';
import { SectionHeader } from './SectionHeader';
import { HackerText } from './HackerText';

export const PhotographyContent = ({ isDark }: { isDark: boolean }) => (
  <div className="space-y-4">
    <section>
      <p className="text-[var(--theme-text-secondary)]">
        Photography is my creative outlet where I explore visual storytelling through both digital 
        and analog mediums. I focus on capturing authentic moments and unique perspectives, 
        combining technical precision with artistic vision.
      </p>
    </section>

    <section>
      <SectionHeader title={<HackerText text="Equipment" duration={75} />} />
      <div className="space-y-8 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
        <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20 group hover:before:bg-[var(--theme-accent-primary)] before:transition-colors duration-200">
          <motion.div 
            className="relative mb-2"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">Camera</h3>
          </motion.div>
          <ul className="space-y-2">
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Fujifilm X-T5</span>
            </li>
          </ul>
        </div>

        <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20 group hover:before:bg-[var(--theme-accent-primary)] before:transition-colors duration-200">
          <motion.div 
            className="relative mb-2"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            <h3 className="text-lg font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">Lenses</h3>
          </motion.div>
          <ul className="space-y-2">
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Fujinon 18-55mm f/2.8</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Fujinon 35mm f/2</span>
            </li>
            <li className="group/item flex items-start text-[var(--theme-text-secondary)] text-sm hover:text-[var(--theme-text-primary)] transition-colors duration-200">
              <span className="block w-2 h-[1px] bg-current mt-[0.6rem] mr-3 transition-colors duration-200"></span>
              <span>Voigtlander 35mm f/1.2</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <SectionHeader title={<HackerText text="Style & Approach" duration={75} />} />
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
