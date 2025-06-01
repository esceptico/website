// Theme Colors
const textColors = {
  primary: {
    dark: 'rgb(225, 225, 225)',
    light: 'rgb(30, 30, 30)'
  },
  secondary: {
    dark: 'rgb(160, 160, 160)',
    light: 'rgb(100, 100, 100)'
  }
} as const;

const backgroundColors = {
  primary: {
    dark: 'rgb(18, 18, 18)',
    light: 'rgb(250, 250, 250)'
  },
  card: {
    dark: 'rgba(50, 50, 50, 0.7)',
    light: 'rgba(235, 235, 235, 0.7)'
  }
} as const;

const borderColors = {
  primary: {
    dark: 'rgb(70, 70, 70)',
    light: 'rgb(200, 200, 200)'
  }
} as const;

export const colors = {
  text: textColors,
  background: backgroundColors,
  border: borderColors
} as const;

// Gradients
export const gradients = {
  mle: {
    dark: 'rgba(100, 100, 100, 0.1)',
    light: 'rgba(100, 100, 100, 0.05)',
    textDark: 'rgb(175, 175, 175)',
    textLight: 'rgb(70, 70, 70)'
  }
} as const;

// Animations
export const transitions = {
  page: {
    duration: 0.4,
    ease: [0.43, 0.13, 0.23, 0.96]
  }
} as const;
