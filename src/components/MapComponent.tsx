"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Map as MapIcon, Navigation, MapPin, Clock, Route, Plus, Trash2, Settings, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { format } from 'date-fns';
import { useTaskContext, Task } from "../context/TaskContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { calculateOptimalRoute } from '../utils/routeOptimization';
import { RoutePreferences, OptimizedRoute, StopTimeWindow } from '../types/routing';
import RoutePreferencesComponent from '../components/RoutePreferences';
import { initGoogleMapsCore } from "@/services/googlePlaces";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

export default function MapComponent() {
  const { tasks, trips, addTask } = useTaskContext();
  const { isMobile, isTablet, screenWidth } = useDeviceDetection();
  const [location, setLocation] = useState<{ lat: number, lng: number }>({ lat: 39.9789, lng: -82.8677 }); // Default to Columbus, OH
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showRoutePreferences, setShowRoutePreferences] = useState(false);
  const [routePreferences, setRoutePreferences] = useState<RoutePreferences>({
    avoidHighways: false,
    avoidTolls: false,
    transportMode: 'DRIVING',
    returnToStart: true,
    considerTraffic: true,
    maxStops: undefined
  });
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [showLocationsList, setShowLocationsList] = useState(!isMobile); // Hide by default on mobile
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const locationInitializedRef = useRef(false);
  
  // Try to get user's location, fall back to default if needed
  useEffect(() => {
    console.log("Initializing geolocation...");
    
    // If we already initialized location, don't do it again
    if (locationInitializedRef.current) {
      return;
    }
    
    locationInitializedRef.current = true;
    
    // Set a timeout for geolocation
    const timeoutId = setTimeout(() => {
      console.log("Geolocation timed out, using default location");
      // We already set the default in the state initialization, just complete loading
      setLoading(false);
    }, 5000);
    
    // Try to get the user's actual location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Successfully got user location");
          clearTimeout(timeoutId);
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.log("Geolocation error:", error.message);
          // Just clear the timeout and complete loading with default location
          clearTimeout(timeoutId);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.log("Geolocation not supported, using default location");
      clearTimeout(timeoutId);
      setLoading(false);
    }
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Initialize map when component mounts
  useEffect(() => {
    if (loading) return;

    const initializeMap = async () => {
      if (!mapRef.current) {
        console.error("Map container not ready");
        return;
      }
      
      if (googleMapRef.current) {
        console.log("Map already initialized");
        return;
      }

      try {
        console.log("Initializing Google Maps...");
        await initGoogleMapsCore();
        
        console.log("Creating map instance...");
        googleMapRef.current = new google.maps.Map(mapRef.current, {
          center: location,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        infoWindowRef.current = new google.maps.InfoWindow();
        
        console.log("Adding markers...");
        addAllMarkers();
        
        console.log("Map loaded successfully.");
        
      } catch (error) {
        console.error("Failed to initialize map:", error);
        console.error("Map loading failed. Please try again.");
      }
    };

    initializeMap();
  }, [loading, location]);

  // Add all markers for the map
  const addAllMarkers = () => {
    if (!googleMapRef.current || !window.google) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    let letterIndex = 1; // Start at 1 since A is for user location

    // Add user location marker (A)
    const userMarker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: googleMapRef.current,
      title: "Your Location",
      label: {
        text: "A",
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold'
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#2563EB',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2
      }
    });
    markersRef.current.push(userMarker);

    // Add task markers - only for tasks with coordinates that are different from user location
    tasks.filter(task => 
      task.coordinates && 
      !(Math.abs(task.coordinates.lat - location.lat) < 0.0001 && Math.abs(task.coordinates.lng - location.lng) < 0.0001)
    ).forEach((task) => {
      const letter = String.fromCharCode(65 + letterIndex); // B, C, D, etc.
      const marker = new google.maps.Marker({
        position: { lat: task.coordinates!.lat, lng: task.coordinates!.lng },
        map: googleMapRef.current,
        title: task.title,
        label: {
          text: letter,
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#DC2626',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });
      markersRef.current.push(marker);
      letterIndex++;
    });

    // Add trip markers - only for active trips with coordinates that are different from user location
    trips.filter(trip => 
      trip.coordinates && 
      trip.status !== 'completed' && 
      trip.status !== 'cancelled' &&
      !(Math.abs(trip.coordinates.lat - location.lat) < 0.0001 && Math.abs(trip.coordinates.lng - location.lng) < 0.0001)
    ).forEach((trip) => {
      const letter = String.fromCharCode(65 + letterIndex); // Continue sequence
      const marker = new google.maps.Marker({
        position: { lat: trip.coordinates!.lat, lng: trip.coordinates!.lng },
        map: googleMapRef.current,
        title: trip.store,
        label: {
          text: letter,
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#2563EB',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });
      markersRef.current.push(marker);
      letterIndex++;
    });
  };

  // Effect to add all markers
  useEffect(() => {
    // Don't recreate markers if we're showing an optimized route
    if (optimizedRoute) return;
    
    addAllMarkers();
  }, [tasks, trips, location]);

  // Route optimization and preferences
  const handleRoutePreferencesChange = (newPreferences: RoutePreferences) => {
    setRoutePreferences(newPreferences);
  };

  const showOptimizedRoute = async () => {
    if (!googleMapRef.current || !window.google) return;
    
    // Get all locations with coordinates (excluding user location duplicates)
    const taskLocations = tasks.filter(task => 
      task.coordinates && 
      !(Math.abs(task.coordinates.lat - location.lat) < 0.0001 && Math.abs(task.coordinates.lng - location.lng) < 0.0001)
    ).map(task => ({
      location: {
        lat: task.coordinates!.lat,
        lng: task.coordinates!.lng
      },
      priority: task.priority,
      dueDate: new Date(task.dueDate)
    } as StopTimeWindow));
    
    const tripLocations = trips.filter(trip => 
      trip.coordinates && 
      trip.status !== 'completed' && 
      trip.status !== 'cancelled' &&
      !(Math.abs(trip.coordinates.lat - location.lat) < 0.0001 && Math.abs(trip.coordinates.lng - location.lng) < 0.0001)
    ).map(trip => ({
      location: {
        lat: trip.coordinates!.lat,
        lng: trip.coordinates!.lng
      },
      priority: 'medium' as const,
      dueDate: new Date(trip.date)
    } as StopTimeWindow));
    
    const allLocations = [...taskLocations, ...tripLocations];
    
    if (allLocations.length === 0) {
      console.log("No locations to optimize. Add some tasks or trips with locations.");
      return;
    }
    
    try {
      const origin = new google.maps.LatLng(location.lat, location.lng);
      const route = await calculateOptimalRoute(origin, allLocations, routePreferences);
      setOptimizedRoute(route);
      
      // Clear existing directions renderer
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      
      // Create new directions renderer with proper styling
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        draggable: false,
        suppressMarkers: true, // Don't show default markers, use our custom ones
        polylineOptions: {
          strokeColor: '#2563EB',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      
      directionsRendererRef.current.setMap(googleMapRef.current);
      
      // Create waypoints for directions service
      const waypoints = route.waypoints.map(wp => ({
        location: new google.maps.LatLng(wp.location.lat, wp.location.lng),
        stopover: true
      }));
      
      const directionsService = new google.maps.DirectionsService();
      const destination = routePreferences.returnToStart ? 
        origin : 
        waypoints.length > 0 ? waypoints[waypoints.length - 1].location : origin;
      
      // Remove the last waypoint from waypoints array if we're using it as destination
      const finalWaypoints = routePreferences.returnToStart ? waypoints : waypoints.slice(0, -1);
      
      const directionsRequest: google.maps.DirectionsRequest = {
        origin: origin,
        destination: destination,
        waypoints: finalWaypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false, // We already optimized, don't let Google re-optimize
        avoidHighways: routePreferences.avoidHighways,
        avoidTolls: routePreferences.avoidTolls
      };
      
      directionsService.route(directionsRequest, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current?.setDirections(result);
          
          // Don't zoom or change view - keep current map bounds
          
          console.log(`Optimized route with ${allLocations.length} stops. Total distance: ${(route.totalDistance / 1609.34).toFixed(1)} miles, time: ${Math.round(route.totalDuration / 60)} minutes.`);
        } else {
          console.error('Directions request failed:', status);
          console.error("Route optimization failed. Unable to calculate the optimal route.");
        }
      });
    } catch (error) {
      console.error('Route optimization error:', error);
      console.error("Route optimization failed. There was an error calculating the route.");
    }
  };

  const handleCreateTask = (taskData: any) => {
    addTask(taskData);
    console.log("Task created successfully.");
    setIsCreateTaskModalOpen(false);
  };

  return (
    <div className="w-full h-full">
      {/* Main content */}
      <div className="h-full flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} flex-1 gap-2 ${isMobile ? 'p-2' : 'p-4'}`}>
            {/* Left Sidebar - Route Options and Locations */}
            <div className={`${isMobile ? 'w-full' : 'w-80'} flex-shrink-0 flex flex-col gap-2`}>
              {/* Route Options */}
              <Card className="shadow-md flex-shrink-0">
                <CardHeader className={`${isMobile ? 'py-2' : 'py-3'}`}>
                  <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Route Options</CardTitle>
                </CardHeader>
                <CardContent className={`${isMobile ? 'p-2' : 'p-4'}`}>
                  <div className={`flex ${isMobile ? 'flex-col gap-1' : 'flex-wrap gap-2'}`}>
                    <Button
                      onClick={showOptimizedRoute}
                      disabled={tasks.filter(task => task.coordinates).length === 0 && trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled').length === 0}
                      className={`bg-primary text-white hover:bg-primary/90 ${isMobile ? 'text-xs py-2 h-8' : 'flex-1 min-w-[120px]'}`}
                    >
                      <Navigation className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                      {isMobile ? 'Optimize' : 'Optimize Route'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowRoutePreferences(true)}
                      className={`${isMobile ? 'text-xs py-2 h-8' : 'flex-1 min-w-[120px]'}`}
                    >
                      <Settings className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                      {isMobile ? 'Settings' : 'Preferences'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        // Get all valid locations
                        const validTasks = tasks.filter(task => 
                          task.coordinates && 
                          !(Math.abs(task.coordinates.lat - location.lat) < 0.0001 && Math.abs(task.coordinates.lng - location.lng) < 0.0001)
                        );
                        const validTrips = trips.filter(trip => 
                          trip.coordinates && 
                          trip.status !== 'completed' && 
                          trip.status !== 'cancelled' &&
                          !(Math.abs(trip.coordinates.lat - location.lat) < 0.0001 && Math.abs(trip.coordinates.lng - location.lng) < 0.0001)
                        );
                        const allLocations = [...validTasks, ...validTrips];
                        
                        if (allLocations.length === 0) {
                          console.log("No locations to view. Add some tasks or trips with locations first.");
                          return;
                        }
                        
                        // Create simple Google Maps URL with user location as starting point
                        let url = `https://www.google.com/maps/dir/${location.lat},${location.lng}`;
                        
                        // Add all destinations
                        allLocations.forEach(loc => {
                          if (loc.coordinates) {
                            url += `/${loc.coordinates.lat},${loc.coordinates.lng}`;
                          }
                        });
                        
                        window.open(url, '_blank');
                        
                        console.log(`Opening Google Maps to show route from your location to ${allLocations.length} destinations.`);
                      }}
                      disabled={tasks.filter(task => task.coordinates).length === 0 && trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled').length === 0}
                      className={`${isMobile ? 'text-xs py-2 h-8' : 'flex-1 min-w-[120px]'}`}
                    >
                      <ExternalLink className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                      {isMobile ? 'Maps' : 'View on Google Maps'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Locations - Collapsible on mobile */}
              {(!isMobile || showLocationsList) && (
                <Card className={`shadow-md ${isMobile ? 'max-h-64' : 'flex-1 min-h-0'}`}>
                  <CardHeader className={`${isMobile ? 'py-2' : 'py-3'} flex-shrink-0`}>
                    <CardTitle className="flex items-center justify-between">
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Locations</span>
                      <div className="flex items-center gap-2">
                        <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                          {tasks.filter(t => t.coordinates).length + trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled').length + 1} total
                        </span>
                        {isMobile && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowLocationsList(false)}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <div className={`h-full overflow-y-auto ${isMobile ? 'px-2 pb-2' : 'px-6 pb-6'}`}>
                      {(tasks.filter(t => t.coordinates).length > 0 || trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled').length > 0) ? (
                        <div className={`space-y-${isMobile ? '1' : '2'}`}>
                          {/* User Location - Always A */}
                          <div className={`${isMobile ? 'p-2' : 'p-3'} border rounded-md bg-blue-50 border-blue-200`}>
                            <div className="flex items-center space-x-2">
                              <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} bg-blue-600 rounded-full flex items-center justify-center`}>
                                <span className={`text-white ${isMobile ? 'text-xs' : 'text-xs'} font-bold`}>A</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Your Location</h4>
                                <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-600`}>Starting point</p>
                              </div>
                            </div>
                          </div>

                          {/* Tasks */}
                          {tasks.filter(task => task.coordinates).map((task, index) => {
                            const letter = String.fromCharCode(66 + index); // B, C, D, etc.
                            return (
                              <div
                                key={`task-${task.id}`}
                                className={`${isMobile ? 'p-2' : 'p-3'} border rounded-md bg-gray-50 transition-colors`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} bg-red-500 rounded-full flex items-center justify-center`}>
                                      <span className={`text-white ${isMobile ? 'text-xs' : 'text-xs'} font-bold`}>{letter}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>{task.title}</h4>
                                      <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 truncate`}>{task.location}</p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>
                                      {format(new Date(task.dueDate), 'MMM d')}
                                    </p>
                                    <span className={`${isMobile ? 'text-xs px-1 py-0.5' : 'text-xs px-2 py-1'} rounded ${
                                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* Trips */}
                          {trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled').map((trip, index) => {
                            const letter = String.fromCharCode(66 + tasks.filter(task => task.coordinates).length + index); // Continue from where tasks left off
                            return (
                              <div
                                key={`trip-${trip.id}`}
                                className={`${isMobile ? 'p-2' : 'p-3'} border rounded-md bg-gray-50 transition-colors`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} bg-blue-500 rounded-full flex items-center justify-center`}>
                                      <span className={`text-white ${isMobile ? 'text-xs' : 'text-xs'} font-bold`}>{letter}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>{trip.store}</h4>
                                      <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>{trip.items.length} items</p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>ETA: {trip.eta}</p>
                                    <span className={`${isMobile ? 'text-xs px-1 py-0.5' : 'text-xs px-2 py-1'} rounded ${
                                      trip.status === 'shopping' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {trip.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8">
                          <MapPin className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} text-gray-300 mb-3`} />
                          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 font-medium`}>No locations to display</p>
                          <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400 mt-1`}>Add tasks or trips with locations to see them here</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Show Locations Button for Mobile */}
              {isMobile && !showLocationsList && (
                <Button
                  variant="outline"
                  onClick={() => setShowLocationsList(true)}
                  className="text-xs py-2 h-8"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Show Locations ({tasks.filter(t => t.coordinates).length + trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled').length + 1})
                </Button>
              )}

              {/* Route Optimization Details */}
              {optimizedRoute && (
                <Card className="shadow-md flex-shrink-0">
                  <CardHeader className={`${isMobile ? 'py-2' : 'py-3'}`}>
                    <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Route Details</CardTitle>
                  </CardHeader>
                  <CardContent className={`${isMobile ? 'p-2' : 'p-4'}`}>
                    <div className={`space-y-2 ${isMobile ? 'max-h-32' : 'max-h-64'} overflow-y-auto`}>
                      {optimizedRoute.segments.map((segment, index) => {
                        // Calculate correct from and to letters based on actual waypoints
                        const fromLetter = index === 0 ? 'A' : String.fromCharCode(65 + index);
                        const toLetter = String.fromCharCode(65 + index + 1);
                        
                        // Don't show segment if it would exceed the number of actual locations
                        const totalLocations = 1 + optimizedRoute.waypoints.length; // 1 for start + waypoints
                        if (index + 1 >= totalLocations) return null;
                        
                        return (
                          <div key={index} className={`flex items-center justify-between ${isMobile ? 'p-1' : 'p-2'} bg-gray-50 rounded`}>
                            <div className="flex items-center space-x-2">
                              <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-gray-600`}>
                                {fromLetter} → {toLetter}
                              </span>
                              <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>
                                {segment.distance}
                              </span>
                            </div>
                            <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>{segment.duration}</span>
                          </div>
                        );
                      })}
                      <div className={`border-t ${isMobile ? 'pt-1 mt-1' : 'pt-2 mt-2'}`}>
                        <div className={`flex justify-between ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                          <span>Total:</span>
                          <span>{(optimizedRoute.totalDistance / 1609.34).toFixed(1)} mi • {Math.round(optimizedRoute.totalDuration / 60)} min</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Map - Now takes up more space */}
            <div className={`flex-1 min-w-0 ${isMobile ? 'h-64' : ''}`}>
              <div 
                ref={mapRef}
                className="w-full h-full rounded-lg border shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Task details panel */}
      {selectedTask && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 border"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{selectedTask.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTask(null)}
            >
              ×
            </Button>
          </div>
          
          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{selectedTask.location}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Due: {format(new Date(selectedTask.dueDate), 'PPP')}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`text-sm px-2 py-1 rounded ${
                selectedTask.priority === 'high' ? 'bg-red-100 text-red-800' :
                selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {selectedTask.priority} priority
              </span>
              {selectedTask.completed && (
                <span className="text-sm px-2 py-1 rounded bg-green-100 text-green-800">
                  Completed
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => {
                // Open Google Maps directions
                if (selectedTask.coordinates) {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedTask.coordinates.lat},${selectedTask.coordinates.lng}`;
                  window.open(url, '_blank');
                }
              }}
            >
              Get Directions
            </Button>
          </div>
        </motion.div>
      )}
      
      {/* Route Preferences Dialog */}
      <Dialog open={showRoutePreferences} onOpenChange={setShowRoutePreferences}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Route Preferences</DialogTitle>
            <DialogDescription>
              Customize how your route is calculated
            </DialogDescription>
          </DialogHeader>
          
          <RoutePreferencesComponent 
            preferences={routePreferences}
            onPreferencesChange={handleRoutePreferencesChange}
          />
          
          <DialogFooter>
            <Button onClick={() => setShowRoutePreferences(false)}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
} 