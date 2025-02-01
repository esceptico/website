export type Mode = 'mle' | 'photography';

export interface Post {
  id?: number;
  title: string;
  description?: string;
  date: string;
  content?: string;
  slug: string;
}

export interface Photo {
  id: number;
  src: string;
  alt: string;
}

export interface RouteConfig {
  path: string;
  label: string;
  modes: Mode[];
  getPath: (mode: Mode) => string;
}

export interface Section {
  mode: Mode;
  title: string;
  subtitle: string;
  description: string;
}

export interface ThemeColors {
  '--theme-bg-primary': string;
  '--theme-text-primary': string;
  '--theme-text-secondary': string;
  '--theme-accent-primary': string;
  '--theme-border': string;
}
