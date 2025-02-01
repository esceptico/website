import { Mode } from '@/types';

interface SectionContent {
  mode: Mode;
  title: string;
  subtitle: string;
  description: string;
  path: string;
}

export const sections: SectionContent[] = [
  {
    mode: 'mle',
    title: 'Machine Learning',
    subtitle: 'Engineer',
    description: 'Developing intelligent systems and algorithms that push the boundaries of artificial intelligence. Specializing in natural language processing.',
    path: '/about'
  },
  {
    mode: 'photography',
    title: 'Visual Stories',
    subtitle: 'Photography',
    description: 'Capturing moments and emotions through the lens, specializing in street and landscape photography. Creating visual narratives that resonate.',
    path: '/portfolio'
  }
];
