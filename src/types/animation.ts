import { TargetAndTransition, Transition } from 'framer-motion';

export interface AnimationConfig {
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  exit?: TargetAndTransition;
  transition?: Transition;
}

export interface GradientConfig {
  dark: string;
  light: string;
  textDark: string;
  textLight: string;
}
