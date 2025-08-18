export const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAB-h4_VucPyVktYcdIW5At9edXaQXRL10';

export const GOOGLE_MAPS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geometry'],
  language: 'en',
  region: 'US'
}; 