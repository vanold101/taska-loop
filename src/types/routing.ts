export interface RoutePreferences {
  avoidHighways: boolean;
  avoidTolls: boolean;
  transportMode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
  returnToStart: boolean;
  considerTraffic: boolean;
  maxStops?: number;
}

export interface StopTimeWindow {
  location: {
    lat: number;
    lng: number;
  };
  earliestArrival?: Date;
  latestArrival?: Date;
  duration?: number; // Duration in minutes
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export interface RouteSegment {
  startLocation: {
    lat: number;
    lng: number;
  };
  endLocation: {
    lat: number;
    lng: number;
  };
  distance: string;
  duration: string;
  priority: 'low' | 'medium' | 'high';
}

export interface OptimizedRoute {
  waypoints: Array<{
    location: {
      lat: number;
      lng: number;
    };
    stopover: boolean;
  }>;
  totalDistance: number;
  totalDuration: number;
  segments: RouteSegment[];
  alternativeRoutes?: OptimizedRoute[];
} 