'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';
import { BeakerIcon, CameraIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

const MLEContent = ({ isDark }: { isDark: boolean }) => (
  <div className="space-y-6">
    <section>
      <h2 className="text-2xl font-bold mb-4 text-[var(--theme-text-primary)]">
        Background
      </h2>
      <p className="text-[var(--theme-text-secondary)]">
        As a Machine Learning Engineer, I specialize in developing and deploying AI solutions
        that solve real-world problems. With a background in computer science and statistics,
        I bridge the gap between theoretical machine learning and practical applications.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4 text-[var(--theme-text-primary)]">
        Skills
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2 text-[var(--theme-text-primary)]">
            Languages
          </h3>
          <ul className="list-disc list-inside text-[var(--theme-text-secondary)]">
            <li>Python</li>
            <li>R</li>
            <li>SQL</li>
            <li>Julia</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-[var(--theme-text-primary)]">
            Frameworks
          </h3>
          <ul className="list-disc list-inside text-[var(--theme-text-secondary)]">
            <li>PyTorch</li>
            <li>TensorFlow</li>
            <li>scikit-learn</li>
            <li>Pandas</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4 text-[var(--theme-text-primary)]">Experience</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-[var(--theme-text-primary)]">Senior ML Engineer</h3>
          <p className="text-[var(--theme-text-secondary)]">Company Name • 2020 - Present</p>
          <p className="text-[var(--theme-text-secondary)]">
            Leading the development of computer vision and NLP solutions.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--theme-text-primary)]">ML Engineer</h3>
          <p className="text-[var(--theme-text-secondary)]">Previous Company • 2018 - 2020</p>
          <p className="text-[var(--theme-text-secondary)]">
            Developed and deployed machine learning models for recommendation systems.
          </p>
        </div>
      </div>
    </section>
  </div>
);

const PhotographyContent = ({ isDark }: { isDark: boolean }) => (
  <div className="space-y-6">
    <section>
      <h2 className="text-2xl font-bold mb-4 text-[var(--theme-text-primary)]">
        About My Photography
      </h2>
      <p className="text-[var(--theme-text-secondary)]">
        Photography is my creative outlet where I capture moments, emotions, and stories
        through my lens. I specialize in landscape and portrait photography, always
        seeking to find the perfect balance between light, composition, and subject.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4 text-[var(--theme-text-primary)]">
        Equipment
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2 text-[var(--theme-text-primary)]">
            Cameras
          </h3>
          <ul className="list-disc list-inside text-[var(--theme-text-secondary)]">
            <li>Sony A7 IV</li>
            <li>Canon 5D Mark IV</li>
            <li>Fujifilm X100V</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-[var(--theme-text-primary)]">
            Favorite Lenses
          </h3>
          <ul className="list-disc list-inside text-[var(--theme-text-secondary)]">
            <li>24-70mm f/2.8</li>
            <li>85mm f/1.4</li>
            <li>16-35mm f/2.8</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4 text-[var(--theme-text-primary)]">
        Style & Approach
      </h2>
      <p className="text-[var(--theme-text-secondary)]">
        My photographic style combines natural light with careful composition to create
        images that tell compelling stories. I believe in minimal post-processing,
        focusing instead on getting things right in camera.
      </p>
    </section>
  </div>
);

export default function About() {
  const { mode, colorScheme } = useThemeStore();
  const isDark = colorScheme === 'dark';

  return (
    <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8"
      >
        <h1 className={`text-4xl font-light mb-8 ${
          mode === 'mle'
            ? 'text-[var(--theme-accent-primary)]'
            : 'text-[var(--theme-accent-primary)]'
        }`}>
          About Me
        </h1>
        {mode === 'mle' ? <MLEContent isDark={isDark} /> : <PhotographyContent isDark={isDark} />}
      </motion.div>
    </div>
  );
} 