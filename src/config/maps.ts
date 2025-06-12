// Google Maps API configuration
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Validate API key is present
if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key is not set. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.');
}

export const MAPS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  libraries: ['places'],
  region: 'US',
  language: 'en',
}; 