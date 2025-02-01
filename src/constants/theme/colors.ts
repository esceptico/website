const textColors = {
  primary: {
    dark: 'rgb(229, 231, 235)',
    light: 'rgb(17, 24, 39)'
  },
  secondary: {
    dark: 'rgb(156, 163, 175)',
    light: 'rgb(75, 85, 99)'
  },
  muted: {
    dark: 'rgb(75, 85, 99)',
    light: 'rgb(156, 163, 175)'
  }
} as const;

const backgroundColors = {
  primary: {
    dark: 'rgb(3, 7, 18)',
    light: 'rgb(249, 250, 251)'
  },
  card: {
    dark: 'rgba(17, 24, 39, 0.5)',
    light: 'rgba(255, 255, 255, 0.5)'
  }
} as const;

const borderColors = {
  primary: {
    dark: 'rgb(31, 41, 55)',
    light: 'rgb(229, 231, 235)'
  }
} as const;

export const colors = {
  text: textColors,
  background: backgroundColors,
  border: borderColors
} as const;
