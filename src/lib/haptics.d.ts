export interface Haptics {
  light: () => void;
  medium: () => void;
  heavy: () => void;
  success: () => void;
  error: () => void;
  warning: () => void;
  longPress: () => void;
}

export const haptics: Haptics; 