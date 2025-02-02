import { transitions } from '@/constants/animation';
import { AnimationConfig } from '@/types/animation';
import { useCallback } from 'react';

export function useAnimation() {
  const getPageTransition = useCallback((customConfig?: Partial<AnimationConfig>): AnimationConfig => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: transitions.page,
    ...customConfig
  }), []);

  const getMountTransition = useCallback((customConfig?: Partial<AnimationConfig>): AnimationConfig => ({
    ...transitions.mount,
    ...customConfig
  }), []);

  return {
    getPageTransition,
    getMountTransition
  };
}
