import { GOOGLE_MAPS_API_KEY } from '../config/maps';

export interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

class GooglePlacesService {
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private geocoder: google.maps.Geocoder | null = null;
  private directionsService: google.maps.DirectionsService | null = null;

  async initialize(): Promise<void> {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      this.autocompleteService = new window.google.maps.places.AutocompleteService();
      this.placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
      this.geocoder = new window.google.maps.Geocoder();
      this.directionsService = new window.google.maps.DirectionsService();
      return;
    }

    // Load Google Maps API if not already loaded
    await this.loadGoogleMapsAPI();
  }

  private async loadGoogleMapsAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window is not defined'));
        return;
      }

      // Check if already loaded
      if (window.google && window.google.maps) {
        this.autocompleteService = new window.google.maps.places.AutocompleteService();
        this.placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
        this.geocoder = new window.google.maps.Geocoder();
        this.directionsService = new window.google.maps.DirectionsService();
        resolve();
        return;
      }

      // Load the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.autocompleteService = new window.google.maps.places.AutocompleteService();
        this.placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
        this.geocoder = new window.google.maps.Geocoder();
        this.directionsService = new window.google.maps.DirectionsService();
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });
  }

  async getPlacePredictions(input: string): Promise<PlaceResult[]> {
    if (!this.autocompleteService) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.autocompleteService) {
        reject(new Error('Autocomplete service not initialized'));
        return;
      }

      const request: google.maps.places.AutocompletionRequest = {
        input,
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'us' }
      };

      this.autocompleteService.getPlacePredictions(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results as PlaceResult[]);
        } else {
          resolve([]);
        }
      });
    });
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!this.placesService) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('Places service not initialized'));
        return;
      }

      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types']
      };

      this.placesService.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const details: PlaceDetails = {
            place_id: place.place_id || '',
            name: place.name || '',
            formatted_address: place.formatted_address || '',
            geometry: {
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0
              }
            },
            types: place.types || []
          };
          resolve(details);
        } else {
          resolve(null);
        }
      });
    });
  }

  async optimizeRoute(waypoints: Array<{ lat: number; lng: number; name: string }>): Promise<{
    route: google.maps.DirectionsRoute;
    totalDistance: number;
    totalDuration: number;
  } | null> {
    if (!this.directionsService) {
      await this.initialize();
    }

    if (waypoints.length < 2) {
      return null;
    }

    return new Promise((resolve, reject) => {
      if (!this.directionsService) {
        reject(new Error('Directions service not initialized'));
        return;
      }

      const origin = waypoints[0];
      const destination = waypoints[waypoints.length - 1];
      const stops = waypoints.slice(1, -1);

      const request: google.maps.DirectionsRequest = {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        waypoints: stops.map(stop => ({ location: { lat: stop.lat, lng: stop.lng } })),
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
      };

      this.directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          const route = result.routes[0];
          const totalDistance = route.legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0);
          const totalDuration = route.legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0);

          resolve({
            route,
            totalDistance,
            totalDuration
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    if (!this.geocoder) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.geocoder) {
        reject(new Error('Geocoder not initialized'));
        return;
      }

      this.geocoder.geocode({ address }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          resolve(null);
        }
      });
    });
  }
}

export const googlePlacesService = new GooglePlacesService(); 