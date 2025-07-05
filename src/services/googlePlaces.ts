import { loadScript } from '../utils/scriptLoader';

// Google Places API Service
// This service handles Google Places API calls for location suggestions
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key is not set. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.');
}

const loadedLibraries: Set<string> = new Set();
let isGoogleMapsLoaded = false;

async function loadGoogleMapsLibrary(library: string): Promise<void> {
  // Check if Google Maps is already loaded
  if (window.google && window.google.maps && isGoogleMapsLoaded) {
    const isLoaded = (lib: string) => {
      switch(lib) {
        case 'places': return !!window.google.maps.places;
        case 'geometry': return !!window.google.maps.geometry;
        case 'core': return !!window.google.maps.DirectionsService; // DirectionsService is part of core
        default: return false;
      }
    };
    
    if (isLoaded(library)) {
      loadedLibraries.add(library);
      return;
    }
  }

  // If not loaded, load the script with all required libraries
  const libraries = new Set([...loadedLibraries, library]);
  // Remove 'core' from libraries string since it's not a real library
  const validLibraries = Array.from(libraries).filter(lib => lib !== 'core');
  const libraryString = validLibraries.length > 0 ? validLibraries.join(',') : '';

  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.');
  }

  try {
    const scriptUrl = libraryString 
      ? `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=${libraryString}`
      : `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    
    await loadScript(scriptUrl);
    
    // Wait for Google Maps to be fully loaded
    await new Promise<void>((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds with 100ms intervals
      
      const checkLoaded = () => {
        attempts++;
        
        if (window.google && window.google.maps) {
          // Check if the specific library is loaded
          const isLoaded = (lib: string) => {
            switch(lib) {
              case 'places': return !!window.google.maps.places;
              case 'geometry': return !!window.google.maps.geometry;
              case 'core': return !!window.google.maps.DirectionsService;
              default: return true;
            }
          };
          
          if (isLoaded(library)) {
            isGoogleMapsLoaded = true;
            libraries.forEach(lib => loadedLibraries.add(lib));
            console.log(`Google Maps API loaded successfully with ${library} library`);
            resolve();
            return;
          }
        }
        
        if (attempts >= maxAttempts) {
          reject(new Error('Google Maps API failed to load within 10 seconds'));
          return;
        }
        
        setTimeout(checkLoaded, 100);
      };
      
      // Start checking immediately
      checkLoaded();
    });
  } catch (error) {
    console.error('Failed to load Google Maps API:', error);
    throw error;
  }
}

export const initGoogleMapsPlaces = () => loadGoogleMapsLibrary('places');
export const initGoogleMapsDirections = () => loadGoogleMapsLibrary('core'); // Use 'core' instead of 'directions'
export const initGoogleMapsGeometry = () => loadGoogleMapsLibrary('geometry');

// Simple function to initialize core Google Maps API (includes DirectionsService)
export const initGoogleMapsCore = async (): Promise<void> => {
  console.log("Loading Google Maps API...");
  
  if (window.google && window.google.maps && window.google.maps.DirectionsService) {
    console.log("Google Maps API already loaded");
    return; // Already loaded
  }

  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.');
  }

  try {
    const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    console.log("Loading Google Maps script...");
    
    await loadScript(scriptUrl);
    console.log("Script loaded, waiting for Google Maps to initialize...");
    
    // Wait for Google Maps to be fully loaded
    await new Promise<void>((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds with 100ms intervals
      
      const checkLoaded = () => {
        attempts++;
        
        if (window.google && window.google.maps && window.google.maps.DirectionsService) {
          console.log('Google Maps API loaded successfully');
          resolve();
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.error("Google Maps API failed to load within 10 seconds");
          reject(new Error('Google Maps API failed to load within 10 seconds. This usually indicates an invalid API key or billing issue.'));
          return;
        }
        
        setTimeout(checkLoaded, 100);
      };
      
      // Start checking immediately
      checkLoaded();
    });
  } catch (error) {
    console.error('Failed to load Google Maps API:', error);
    throw new Error('Failed to load Google Maps API. Please check your API key and billing settings.');
  }
};

interface PlaceResult {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId: string;
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  await initGoogleMapsPlaces();

  const request = {
    textQuery: query,
    fields: ['displayName', 'formattedAddress', 'geometry', 'id'],
    includedType: 'store'
  };

  const { places } = await google.maps.places.Place.searchByText(request);

  if (places.length) {
    return places.map(place => ({
        name: place.displayName || '',
        address: place.formattedAddress || '',
        coordinates: {
            lat: place.location?.lat() || 0,
            lng: place.location?.lng() || 0
        },
        placeId: place.id || ''
    }));
  } else {
    return [];
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceResult> {
  await initGoogleMapsPlaces();
  
  const place = new google.maps.places.Place({ id: placeId });
  await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'geometry', 'id'] });

  if (!place.location) {
      throw new Error('Place details fetch failed: no geometry');
  }

  return {
      name: place.displayName || '',
      address: place.formattedAddress || '',
      coordinates: {
          lat: place.location.lat(),
          lng: place.location.lng()
      },
      placeId: place.id || ''
  };
} 