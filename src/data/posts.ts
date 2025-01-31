import { Mode } from '@/types/theme';

export interface Post {
  id: number;
  title: string;
  description: string;
  date: string;
  content?: string;
  slug: string;
}

export type Posts = {
  [K in Mode]: {
    [slug: string]: Post;
  };
};

export const posts: Posts = {
  mle: {
    'to-be-added': {
      id: 1,
      title: 'To be added',
      description: 'To be added',
      date: '2024-03-15',
      slug: 'to-be-added',
      content: `
        Content would go here.
        This is just a placeholder for now.
      `
    }
  },
  photography: {
    'to-be-added': {
      id: 1,
      title: 'To be added',
      description: 'To be added',
      date: '2024-03-12',
      slug: 'to-be-added',
      content: `
        Content would go here.
        This is just a placeholder for now.
      `
    }
  }
}; 