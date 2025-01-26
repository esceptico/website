'use client';

import { motion } from 'framer-motion';
import { ArrowTopRightOnSquareIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '@/store/theme';

const projects = [
  {
    id: 1,
    title: 'Neural Style Transfer',
    description: 'Implementation of a neural style transfer algorithm using PyTorch, allowing users to apply artistic styles to their images.',
    tags: ['Computer Vision', 'PyTorch', 'CNN'],
    github: 'https://github.com/username/neural-style-transfer',
    demo: 'https://demo.neural-style-transfer.com',
    image: 'https://source.unsplash.com/random/800x600?art',
  },
  {
    id: 2,
    title: 'NLP Text Summarizer',
    description: 'A transformer-based text summarization model fine-tuned on news articles to generate concise and accurate summaries.',
    tags: ['NLP', 'Transformers', 'HuggingFace'],
    github: 'https://github.com/username/text-summarizer',
    demo: 'https://demo.text-summarizer.com',
    image: 'https://source.unsplash.com/random/800x600?text',
  },
  {
    id: 3,
    title: 'Time Series Forecasting',
    description: 'Advanced time series forecasting model using LSTM networks to predict stock market trends with high accuracy.',
    tags: ['Time Series', 'LSTM', 'TensorFlow'],
    github: 'https://github.com/username/time-series-forecast',
    demo: 'https://demo.time-series-forecast.com',
    image: 'https://source.unsplash.com/random/800x600?chart',
  },
];

export default function Projects() {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === 'dark';

  return (
    <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-light text-[var(--theme-text-primary)]">
            ML Projects
            <span className="block text-xl mt-2 text-[var(--theme-accent-primary)]">
              Exploring the Frontiers of AI
            </span>
          </h1>
          <p className="text-[var(--theme-text-secondary)] max-w-3xl">
            A collection of machine learning projects, ranging from computer vision
            to natural language processing. Each project includes detailed documentation
            and live demos where available.
          </p>
        </div>

        <motion.div 
          className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.15
              }}
              className="bg-[var(--theme-bg-card)] backdrop-blur-sm rounded-xl border border-[var(--theme-border)] overflow-hidden hover:-translate-y-1 transition-transform duration-200"
            >
              <div className="aspect-w-16 aspect-h-9 bg-[var(--theme-border)]">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BeakerIcon className="h-5 w-5 text-[var(--theme-accent-primary)]" />
                  <h3 className="text-xl font-bold text-[var(--theme-text-primary)]">
                    {project.title}
                  </h3>
                </div>
                <p className="text-[var(--theme-text-secondary)] mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--theme-accent-primary)] bg-opacity-10 text-[var(--theme-accent-primary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent-primary)] transition-colors"
                  >
                    GitHub
                    <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                  </a>
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent-primary)] transition-colors"
                  >
                    Live Demo
                    <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
} 