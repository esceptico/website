'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';

export default function Home() {
  const { setMode } = useThemeStore();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center">
      <div className="w-full max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 md:gap-24">
        {/* MLE Section */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => setMode('mle')}
          className="group cursor-pointer space-y-4"
        >
          <div className="overflow-hidden">
            <motion.h2 
              className="text-3xl md:text-4xl font-light tracking-tight text-indigo-950"
              whileHover={{ x: 10 }}
              transition={{ duration: 0.2 }}
            >
              Machine Learning
              <span className="block font-normal">Engineer</span>
            </motion.h2>
          </div>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md">
            Developing intelligent systems and algorithms that push the boundaries 
            of artificial intelligence. Specializing in computer vision and natural 
            language processing.
          </p>
          <motion.div 
            className="inline-flex items-center text-indigo-600 text-sm"
            whileHover={{ x: 5 }}
          >
            View Projects
            <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.section>

        {/* Divider */}
        <div className="hidden md:block absolute left-1/2 top-1/4 bottom-1/4 w-px bg-gray-200" />

        {/* Photography Section */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => setMode('photography')}
          className="group cursor-pointer space-y-4"
        >
          <div className="overflow-hidden">
            <motion.h2 
              className="text-3xl md:text-4xl font-light tracking-tight text-amber-950"
              whileHover={{ x: 10 }}
              transition={{ duration: 0.2 }}
            >
              Visual Stories
              <span className="block font-normal">Photography</span>
            </motion.h2>
          </div>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md">
            Capturing moments and emotions through the lens, specializing in portrait 
            and landscape photography. Creating visual narratives that resonate.
          </p>
          <motion.div 
            className="inline-flex items-center text-amber-600 text-sm"
            whileHover={{ x: 5 }}
          >
            View Portfolio
            <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
