import { RoutePreferences, StopTimeWindow, OptimizedRoute, RouteSegment } from '../types/routing';

// Calculate priority score based on task priority and due date
export const calculatePriorityScore = (stop: StopTimeWindow): number => {
  const priorityWeights = {
    high: 3,
    medium: 2,
    low: 1
  };

  const now = new Date().getTime();
  const dueDate = stop.dueDate ? new Date(stop.dueDate).getTime() : now + (7 * 24 * 60 * 60 * 1000); // Default to 7 days
  const daysUntilDue = Math.max(1, (dueDate - now) / (1000 * 60 * 60 * 24));
  
  return priorityWeights[stop.priority] * (1 + 1/daysUntilDue);
};

// Check if a stop is within its time window
export const isWithinTimeWindow = (
  stop: StopTimeWindow,
  estimatedArrival: Date
): boolean => {
  if (!stop.earliestArrival && !stop.latestArrival) return true;
  
  const arrivalTime = estimatedArrival.getTime();
  if (stop.earliestArrival && arrivalTime < stop.earliestArrival.getTime()) return false;
  if (stop.latestArrival && arrivalTime > stop.latestArrival.getTime()) return false;
  
  return true;
};

// Convert Google Maps route leg to RouteSegment
export const convertToRouteSegment = (
  leg: google.maps.DirectionsLeg,
  priority: 'high' | 'medium' | 'low'
): RouteSegment => ({
  startLocation: {
    lat: leg.start_location.lat(),
    lng: leg.start_location.lng()
  },
  endLocation: {
    lat: leg.end_location.lat(),
    lng: leg.end_location.lng()
  },
  distance: leg.distance?.text || '0 km',
  duration: leg.duration?.text || '0 mins',
  priority
});

// Calculate optimal route considering all constraints
export const calculateOptimalRoute = async (
  origin: google.maps.LatLng,
  stops: StopTimeWindow[],
  preferences: RoutePreferences
): Promise<OptimizedRoute> => {
  // Initialize Google Maps services
  const directionsService = new google.maps.DirectionsService();
  
  // Sort stops by priority score
  const sortedStops = [...stops].sort((a, b) => 
    calculatePriorityScore(b) - calculatePriorityScore(a)
  );
  
  // Limit number of stops if specified
  const limitedStops = preferences.maxStops 
    ? sortedStops.slice(0, preferences.maxStops) 
    : sortedStops;
  
  // Create waypoints for the route
  const waypoints = limitedStops.map(stop => ({
    location: new google.maps.LatLng(stop.location.lat, stop.location.lng),
    stopover: true
  }));
  
  try {
    const result = await directionsService.route({
      origin,
      destination: preferences.returnToStart ? origin : waypoints[waypoints.length - 1].location,
      waypoints: preferences.returnToStart ? waypoints : waypoints.slice(0, -1),
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode[preferences.transportMode || 'DRIVING'],
      avoidHighways: preferences.avoidHighways,
      avoidTolls: preferences.avoidTolls,
      drivingOptions: preferences.considerTraffic ? {
        departureTime: new Date(),
        trafficModel: google.maps.TrafficModel.BEST_GUESS
      } : undefined
    });

    if (!result.routes[0]) throw new Error('No route found');

    const route = result.routes[0];
    const segments: RouteSegment[] = [];
    let totalDistance = 0;
    let totalDuration = 0;

    // Process route legs and create segments
    route.legs.forEach((leg, index) => {
      const stop = limitedStops[index];
      segments.push(convertToRouteSegment(leg, stop?.priority || 'medium'));
      
      totalDistance += leg.distance?.value || 0;
      totalDuration += leg.duration?.value || 0;
    });

    const optimizedRoute: OptimizedRoute = {
      waypoints: waypoints.map(wp => ({
        location: {
          lat: wp.location.lat(),
          lng: wp.location.lng()
        },
        stopover: wp.stopover
      })),
      totalDistance,
      totalDuration,
      segments,
      alternativeRoutes: route.legs.length > 1 ? [] : undefined // Only calculate alternatives for multi-stop routes
    };

    return optimizedRoute;
  } catch (error) {
    console.error('Error calculating optimal route:', error);
    throw error;
  }
}; 