// Google Maps type definitions
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }

  namespace google.maps {
    interface DirectionsResult {
      routes: DirectionsRoute[];
      geocoded_waypoints: DirectionsGeocodedWaypoint[];
      status: DirectionsStatus;
    }
  }
}

export {}; // This file needs to be a module
