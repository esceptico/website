import { Mode } from '@/types';

interface Post {
  id: number;
  title: string;
  description: string;
  date: string;
  content: string;
  slug: string;
}

export type Posts = {
  [K in Mode]: {
    [slug: string]: Post;
  };
};

export const posts: Posts = {
  mle: {
    'optimizing-llm-production': {
      id: 1,
      title: 'Optimizing Large Language Models for Production',
      description: 'A deep dive into techniques for optimizing LLMs in production environments, covering quantization, pruning, and efficient deployment strategies.',
      date: '2024-03-15',
      content: 'Coming soon...',
      slug: 'optimizing-llm-production'
    },
    'understanding-attention-mechanisms': {
      id: 2,
      title: 'Understanding Attention Mechanisms',
      description: 'Exploring the fundamentals of attention mechanisms in neural networks and their applications in modern machine learning architectures.',
      date: '2024-03-10',
      content: 'Coming soon...',
      slug: 'understanding-attention-mechanisms'
    }
  },
  photography: {
    'urban-light-photography': {
      id: 1,
      title: 'Finding Light in Urban Landscapes',
      description: 'Tips and techniques for capturing compelling urban photography, with a focus on natural and artificial lighting.',
      date: '2024-03-12',
      content: 'Coming soon...',
      slug: 'urban-light-photography'
    },
    'street-photography-guide': {
      id: 2,
      title: 'The Art of Street Photography',
      description: 'A guide to capturing authentic moments in street photography, including composition techniques and ethical considerations.',
      date: '2024-03-08',
      content: 'Coming soon...',
      slug: 'street-photography-guide'
    }
  }
};
