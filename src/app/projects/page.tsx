'use client';

import { motion } from 'framer-motion';
import { ArrowTopRightOnSquareIcon, BeakerIcon } from '@heroicons/react/24/outline';

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
  return (
    <div className="min-h-screen p-8 bg-gray-950">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-light text-gray-200">
            ML Projects
            <span className="block text-xl mt-2 text-indigo-400">Exploring the Frontiers of AI</span>
          </h1>
          <p className="text-gray-400 max-w-3xl">
            A collection of machine learning projects, ranging from computer vision
            to natural language processing. Each project includes detailed documentation
            and live demos where available.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden hover:-translate-y-1 transition-transform duration-200"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-800">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BeakerIcon className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-xl font-bold text-gray-200">{project.title}</h3>
                </div>
                <p className="text-gray-400 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-300"
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
                    className="inline-flex items-center text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    GitHub
                    <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                  </a>
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    Live Demo
                    <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 