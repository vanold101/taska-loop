declare module "*.json" {
  const value: any;
  export default value;
}

// React Native reanimated global
declare global {
  // eslint-disable-next-line no-var
  var __reanimatedWorkletInit: (() => void) | undefined;
}

export {};

