import { Section } from '@/types';

export const sections: Section[] = [
  {
    mode: 'mle',
    title: 'Machine Learning',
    subtitle: 'Engineering',
    description: 'Exploring the intersection of machine learning and software engineering.'
  },
  {
    mode: 'photography',
    title: 'Photography',
    subtitle: 'Portfolio',
    description: 'Capturing moments and stories through the lens.'
  }
] as const; 