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
    <motion.div 
      className="min-h-screen p-8 bg-gradient-to-br from-indigo-50 via-white to-indigo-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-light text-indigo-900">
            ML Projects
            <span className="block text-xl text-indigo-600 mt-2">Exploring the Frontiers of AI</span>
          </h1>
          <p className="text-gray-600 max-w-3xl">
            A collection of machine learning projects, ranging from computer vision
            to natural language processing. Each project includes detailed documentation
            and live demos where available.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-50 overflow-hidden hover:-translate-y-1 transition-transform duration-200"
            >
              <div className="aspect-w-16 aspect-h-9 bg-indigo-50">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BeakerIcon className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-xl font-bold text-indigo-900">{project.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
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
                    className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    GitHub
                    <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                  </a>
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Live Demo
                    <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 