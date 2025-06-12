/**
 * Utility for providing consistent haptic feedback across the app
 */
export const haptics = {
  light: () => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  },
  
  medium: () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  },
  
  heavy: () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  },
  
  success: () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 100]);
    }
  },
  
  error: () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 30, 100, 30, 100]);
    }
  },
  
  warning: () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  },
  
  longPress: () => {
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }
}; 