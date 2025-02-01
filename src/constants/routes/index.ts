import { RouteConfig } from '@/types';

export const routes: RouteConfig[] = [
  {
    path: '/projects',
    label: 'Projects',
    modes: ['mle'],
    getPath: () => '/projects'
  },
  {
    path: '/portfolio',
    label: 'Portfolio',
    modes: ['photography'],
    getPath: () => '/portfolio'
  },
  {
    path: '/blog',
    label: 'Posts',
    modes: ['mle', 'photography'],
    getPath: (mode) => `/blog/${mode}`
  },
  {
    path: '/about',
    label: 'About',
    modes: ['mle', 'photography'],
    getPath: (mode) => `/about/${mode}`
  }
] as const; 