import { Mode } from '@/types/theme';

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
    description: 'Developing intelligent systems and algorithms that push the boundaries of artificial intelligence. Specializing in computer vision and natural language processing.',
    path: '/projects'
  },
  {
    mode: 'photography',
    title: 'Visual Stories',
    subtitle: 'Photography',
    description: 'Capturing moments and emotions through the lens, specializing in portrait and landscape photography. Creating visual narratives that resonate.',
    path: '/portfolio'
  }
]; 