import { loadScript } from '../utils/scriptLoader';
import { GOOGLE_MAPS_API_KEY } from '../config/maps';

const loadedLibraries: Set<string> = new Set();

async function loadGoogleMapsLibrary(library: string): Promise<void> {
  const libraries = new Set([...loadedLibraries, library]);
  const libraryString = Array.from(libraries).join(',');

  const isLoaded = (lib: string) => {
    switch(lib) {
      case 'places': return !!window.google.maps.places;
      case 'directions': return !!window.google.maps.DirectionsService;
      case 'geometry': return !!window.google.maps.geometry;
      default: return false;
    }
  };

  if (!window.google || !window.google.maps || !isLoaded(library)) {
    await loadScript(`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=${libraryString}`);
    libraries.forEach(lib => loadedLibraries.add(lib));
  }
}

export const initGoogleMapsPlaces = () => loadGoogleMapsLibrary('places');
export const initGoogleMapsDirections = () => loadGoogleMapsLibrary('directions');
export const initGoogleMapsGeometry = () => loadGoogleMapsLibrary('geometry');

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