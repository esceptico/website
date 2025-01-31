export const pageTransition = {
  duration: 0.4,
  ease: [0.43, 0.13, 0.23, 0.96]
} as const;

export const mountTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: 0.6,
    ease: [0.16, 1, 0.3, 1],
    delay: 0.1
  }
} as const;

export const gradientConfig = {
  mle: {
    dark: 'rgba(79, 70, 229, 0.15)',
    light: 'rgba(79, 70, 229, 0.1)',
    textDark: 'rgb(129, 140, 248)',
    textLight: 'rgb(67, 56, 202)'
  },
  photography: {
    dark: 'rgba(217, 119, 6, 0.15)',
    light: 'rgba(217, 119, 6, 0.1)',
    textDark: 'rgb(251, 146, 60)',
    textLight: 'rgb(217, 119, 6)'
  }
} as const; 