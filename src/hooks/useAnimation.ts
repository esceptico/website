import { animations } from '@/constants';
import { AnimationConfig } from '@/types/animation';
import { useCallback } from 'react';

export function useAnimation() {
  const getPageTransition = useCallback((customConfig?: Partial<AnimationConfig>): AnimationConfig => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: animations.page,
    ...customConfig
  }), []);

  const getMountTransition = useCallback((customConfig?: Partial<AnimationConfig>): AnimationConfig => ({
    ...animations.mount,
    ...customConfig
  }), []);

  return {
    getPageTransition,
    getMountTransition
  };
}
