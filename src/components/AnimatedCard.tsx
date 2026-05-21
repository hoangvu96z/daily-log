import React from 'react';
import Animated, { FadeInUp, FadeInDown, ZoomIn, SlideOutRight } from 'react-native-reanimated';

export type AnimationVariant = 'fadeInUp' | 'fadeInDown' | 'scaleIn' | 'slideOutRight';

export interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  variant?: AnimationVariant;
  duration?: number;
  style?: any;
}

export function AnimatedCard({ 
  children, 
  delay = 0, 
  variant = 'fadeInDown', 
  duration = 350, 
  style 
}: AnimatedCardProps) {
  let enteringAnimation: any;
  let exitingAnimation: any;

  switch (variant) {
    case 'fadeInUp':
      enteringAnimation = FadeInUp.delay(delay).duration(duration).springify();
      break;
    case 'scaleIn':
      enteringAnimation = ZoomIn.delay(delay).duration(duration).springify();
      break;
    case 'slideOutRight':
      enteringAnimation = FadeInDown.delay(delay).duration(duration).springify(); // Fallback for entering
      exitingAnimation = SlideOutRight.duration(duration);
      break;
    case 'fadeInDown':
    default:
      enteringAnimation = FadeInDown.delay(delay).duration(duration).springify();
      break;
  }

  return (
    <Animated.View entering={enteringAnimation} exiting={exitingAnimation} style={style}>
      {children}
    </Animated.View>
  );
}
