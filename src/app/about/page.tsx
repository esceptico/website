'use client';

import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/theme';

const MLEContent = () => (
  <div className="space-y-6">
    <section>
      <h2 className="text-2xl font-bold text-gray-200 mb-4">Background</h2>
      <p className="text-gray-400">
        As a Machine Learning Engineer, I specialize in developing and deploying AI solutions
        that solve real-world problems. With a background in computer science and statistics,
        I bridge the gap between theoretical machine learning and practical applications.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-200 mb-4">Skills</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-gray-200 mb-2">Languages</h3>
          <ul className="list-disc list-inside text-gray-400">
            <li>Python</li>
            <li>R</li>
            <li>SQL</li>
            <li>Julia</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-200 mb-2">Frameworks</h3>
          <ul className="list-disc list-inside text-gray-400">
            <li>PyTorch</li>
            <li>TensorFlow</li>
            <li>scikit-learn</li>
            <li>Pandas</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-200 mb-4">Experience</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-200">Senior ML Engineer</h3>
          <p className="text-gray-400">Company Name • 2020 - Present</p>
          <p className="text-gray-400">
            Leading the development of computer vision and NLP solutions.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-200">ML Engineer</h3>
          <p className="text-gray-400">Previous Company • 2018 - 2020</p>
          <p className="text-gray-400">
            Developed and deployed machine learning models for recommendation systems.
          </p>
        </div>
      </div>
    </section>
  </div>
);

const PhotographyContent = () => (
  <div className="space-y-6">
    <section>
      <h2 className="text-2xl font-bold text-gray-200 mb-4">About My Photography</h2>
      <p className="text-gray-400">
        Photography is my creative outlet where I capture moments, emotions, and stories
        through my lens. I specialize in landscape and portrait photography, always
        seeking to find the perfect balance between light, composition, and subject.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-200 mb-4">Equipment</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-gray-200 mb-2">Cameras</h3>
          <ul className="list-disc list-inside text-gray-400">
            <li>Sony A7 IV</li>
            <li>Canon 5D Mark IV</li>
            <li>Fujifilm X100V</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-200 mb-2">Favorite Lenses</h3>
          <ul className="list-disc list-inside text-gray-400">
            <li>24-70mm f/2.8</li>
            <li>85mm f/1.4</li>
            <li>16-35mm f/2.8</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-200 mb-4">Style & Approach</h2>
      <p className="text-gray-400">
        My photographic style combines natural light with careful composition to create
        images that tell compelling stories. I believe in minimal post-processing,
        focusing instead on getting things right in camera.
      </p>
    </section>
  </div>
);

export default function About() {
  const { mode } = useThemeStore();

  return (
    <div className="min-h-screen p-8 bg-gray-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8"
      >
        <h1 className={`text-4xl font-light mb-8 ${
          mode === 'mle' ? 'text-indigo-400' : 'text-orange-400'
        }`}>
          About Me
        </h1>
        {mode === 'mle' ? <MLEContent /> : <PhotographyContent />}
      </motion.div>
    </div>
  );
} 