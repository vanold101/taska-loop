// Google Maps type definitions
declare global {
  interface Window {
    google: any; // Using any to avoid type conflicts
    initMap: () => void;
  }
}

export {}; // This file needs to be a module
