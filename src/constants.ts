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

// Animations
export const transitions = {
  page: {
    duration: 0.4,
    ease: [0.43, 0.13, 0.23, 0.96]
  }
} as const;
