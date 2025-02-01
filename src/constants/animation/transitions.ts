export const transitions = {
  page: {
    duration: 0.4,
    ease: [0.43, 0.13, 0.23, 0.96]
  },
  mount: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.1
    }
  }
} as const;
