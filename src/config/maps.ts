// Google Maps API configuration
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCC9n6z-koJp5qiyOOPRRag3qudrcfOeK8';

// Validate API key is present
if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key is not set. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.');
  console.warn('See env.example for the required variables.');
}

export const MAPS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geometry'],
  region: 'US',
  language: 'en',
}; 