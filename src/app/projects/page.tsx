'use client';

import { motion } from 'framer-motion';
import { ArrowTopRightOnSquareIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { SectionHeader } from '@/components/SectionHeader';

const projects = [
  {
    id: 1,
    title: 'To be added',
    description: 'To be added',
    github: 'https://github.com/',
  }
];

const ProjectItem = ({ project, index }: { project: typeof projects[0], index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="relative group py-8 first:pt-0 last:pb-0"
    >
      <div className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-[var(--theme-text-secondary)] before:opacity-20 group-hover:before:bg-[var(--theme-accent-primary)] before:transition-colors duration-200">
        <h3 className="text-xl font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-200">
          {project.title}
        </h3>
        
        <p className="mt-2 text-[var(--theme-text-secondary)] max-w-3xl">
          {project.description}
        </p>

        <div className="mt-4">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent-primary)] transition-colors"
          >
            <CodeBracketIcon className="mr-2 h-4 w-4" />
            View on GitHub
            <ArrowTopRightOnSquareIcon className="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default function Projects() {
  return (
    <div className="min-h-screen p-8 bg-[var(--theme-bg-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <SectionHeader 
            title="Projects"
            as="h1" 
            variant="primary" 
            useAccentColor 
          />
          <p className="mt-4 text-[var(--theme-text-secondary)] max-w-3xl">
            A collection of machine learning related projects, usually related to natural language processing.
          </p>
        </div>

        <div className="divide-y divide-[var(--theme-border)]">
          {projects.map((project, index) => (
            <ProjectItem key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
} 