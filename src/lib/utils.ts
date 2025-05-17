import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Haptic feedback utility with different intensity levels
 */
export const haptics = {
  /**
   * Light haptic feedback for common UI interactions
   * (button clicks, navigation, toggles)
   */
  light: () => {
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  },

  /**
   * Medium haptic feedback for secondary actions
   * (selection changes, drag start/end)
   */
  medium: () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  },

  /**
   * Strong haptic feedback for significant actions
   * (form submission, confirmation)
   */
  heavy: () => {
    if (navigator.vibrate) {
      navigator.vibrate(75);
    }
  },

  /**
   * Success pattern for completed actions
   */
  success: () => {
    if (navigator.vibrate) {
      navigator.vibrate([25, 50, 75]);
    }
  },

  /**
   * Error pattern for failed actions
   */
  error: () => {
    if (navigator.vibrate) {
      navigator.vibrate([75, 50, 75]);
    }
  },

  /**
   * Warning pattern for confirmation or alerts
   */
  warning: () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  },

  /**
   * Soft double pulse for notifications
   */
  notification: () => {
    if (navigator.vibrate) {
      navigator.vibrate([25, 50, 25]);
    }
  },

  /**
   * Long press pattern
   */
  longPress: () => {
    if (navigator.vibrate) {
      navigator.vibrate([30, 30, 60]);
    }
  },

  /**
   * Custom pattern with array of durations (vibration, pause, vibration, etc.)
   */
  custom: (pattern: number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
};
