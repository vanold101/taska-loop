"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Map as MapIcon, Navigation, MapPin, Clock, Route, Plus, Trash2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { motion } from "framer-motion";
import { format } from 'date-fns';
import { useTaskContext, Task } from "../context/TaskContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { calculateOptimalRoute } from '../utils/routeOptimization';
import { RoutePreferences, OptimizedRoute, StopTimeWindow } from '../types/routing';
import RoutePreferencesComponent from '../components/RoutePreferences';
import { initGoogleMapsCore } from "@/services/googlePlaces";

export default function MapComponent() {
  const { toast } = useToast();
  const { tasks, trips } = useTaskContext();
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
        addLocationMarkers();
        addUserLocationMarker();
        
        toast({
          title: "Map loaded",
          description: "Google Maps has been loaded successfully."
        });
        
      } catch (error) {
        console.error("Failed to initialize Google Maps", error);
        
        // Show a helpful error message about the API key
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50 rounded-lg">
              <div class="mb-4">
                <svg class="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Google Maps API Key Required</h3>
              <p class="text-gray-600 mb-4 max-w-md">
                To display the map, you need a valid Google Maps API key. The current API key is invalid or expired.
              </p>
              <div class="text-sm text-gray-500 space-y-2">
                <p><strong>To fix this:</strong></p>
                <ol class="text-left space-y-1">
                  <li>1. Go to <a href="https://console.cloud.google.com" target="_blank" class="text-blue-600 hover:underline">Google Cloud Console</a></li>
                  <li>2. Create a new project or select existing one</li>
                  <li>3. Enable the Maps JavaScript API</li>
                  <li>4. Create an API key</li>
                  <li>5. Enable billing (required for Google Maps)</li>
                  <li>6. Update the VITE_GOOGLE_MAPS_API_KEY in your .env file</li>
                </ol>
              </div>
            </div>
          `;
        }
        
        toast({
          title: "Map Error",
          description: "Google Maps API key is invalid or expired. Please check the console for setup instructions.",
          variant: "destructive"
        });
      }
    };

    initializeMap();

  }, [loading, location]);

  // Add markers for tasks and trips on the map
  const addLocationMarkers = () => {
    if (!googleMapRef.current || !google.maps) return;
    
    console.log("Adding location markers...");
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Create a bounds object
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(location); // Include user location in bounds
    
    let markerIndex = 1;
    
    // Add task markers
    tasks.forEach((task) => {
      if (task.coordinates) {
        try {
          // Create marker for this task
          const marker = new google.maps.Marker({
            position: { lat: task.coordinates.lat, lng: task.coordinates.lng },
            map: googleMapRef.current,
            title: task.title,
            label: {
              text: `${markerIndex}`,
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: getPriorityColor(task.priority),
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              scale: 12,
              labelOrigin: new google.maps.Point(0, 0)
            }
          });
          
          // Add click listener to marker
          marker.addListener('click', () => {
            if (!infoWindowRef.current) return;
            
            setSelectedTask(task);
            
            // Show info window with task details
            const content = `
              <div style="padding: 8px; min-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 4px;">${task.title}</h3>
                <p style="color: #666; font-size: 14px; margin: 4px 0;">
                  <span style="display: inline-block; margin-right: 4px;">📍</span>${task.location}
                </p>
                <p style="color: #666; font-size: 14px; margin: 4px 0;">
                  <span style="display: inline-block; margin-right: 4px;">⏰</span>${format(new Date(task.dueDate), 'PPP')}
                </p>
                <p style="color: #666; font-size: 14px; margin: 4px 0;">
                  <span style="display: inline-block; margin-right: 4px;">🎯</span>Task - ${task.priority} priority
                </p>
              </div>
            `;
            
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(googleMapRef.current, marker);
          });
          
          markersRef.current.push(marker);
          bounds.extend({ lat: task.coordinates.lat, lng: task.coordinates.lng });
          markerIndex++;
        } catch (error) {
          console.error(`Error adding marker for task ${task.id}:`, error);
        }
      }
    });

    // Add trip markers
    trips.filter(trip => trip.status !== 'completed' && trip.status !== 'cancelled').forEach((trip) => {
      if (trip.coordinates) {
        try {
          // Create marker for this trip
          const marker = new google.maps.Marker({
            position: { lat: trip.coordinates.lat, lng: trip.coordinates.lng },
            map: googleMapRef.current,
            title: `Trip to ${trip.store}`,
            label: {
              text: `${markerIndex}`,
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#3B82F6', // Blue color for trips
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              scale: 12,
              labelOrigin: new google.maps.Point(0, 0)
            }
          });
          
          // Add click listener to marker
          marker.addListener('click', () => {
            if (!infoWindowRef.current) return;
            
            // Show info window with trip details
            const content = `
              <div style="padding: 8px; min-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 4px;">Trip to ${trip.store}</h3>
                <p style="color: #666; font-size: 14px; margin: 4px 0;">
                  <span style="display: inline-block; margin-right: 4px;">📍</span>${trip.store}
                </p>
                <p style="color: #666; font-size: 14px; margin: 4px 0;">
                  <span style="display: inline-block; margin-right: 4px;">📅</span>${format(new Date(trip.date), 'PPP')}
                </p>
                <p style="color: #666; font-size: 14px; margin: 4px 0;">
                  <span style="display: inline-block; margin-right: 4px;">🛒</span>Shopping Trip - ${trip.items.length} items
                </p>
                <p style="color: #666; font-size: 14px; margin: 4px 0;">
                  <span style="display: inline-block; margin-right: 4px;">📊</span>Status: ${trip.status}
                </p>
              </div>
            `;
            
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(googleMapRef.current, marker);
          });
          
          markersRef.current.push(marker);
          bounds.extend({ lat: trip.coordinates.lat, lng: trip.coordinates.lng });
          markerIndex++;
        } catch (error) {
          console.error(`Error adding marker for trip ${trip.id}:`, error);
        }
      }
    });
    
    // Add user location marker
    addUserLocationMarker();
    
    // Fit map to show all markers
    if (tasks.some(task => task.coordinates) && googleMapRef.current) {
      googleMapRef.current.fitBounds(bounds);
      
      // If only one marker plus user location, zoom out a bit
      if (tasks.filter(task => task.coordinates).length === 1) {
        googleMapRef.current.setZoom(14);
      }
    }
  };
  
  // Add user location marker
  const addUserLocationMarker = () => {
    if (!googleMapRef.current || !google.maps) return;
    
    try {
      const userMarker = new google.maps.Marker({
        position: location,
        map: googleMapRef.current,
        title: "Your Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
          scale: 8
        },
        zIndex: 999 // Ensure it's on top of other markers
      });
      
      markersRef.current.push(userMarker);
    } catch (error) {
      console.error("Error adding user location marker:", error);
    }
  };
  
  // Get color based on task priority
  const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
    switch (priority) {
      case 'high': return '#EF4444';   // Red
      case 'medium': return '#F59E0B'; // Amber
      case 'low': return '#10B981';    // Green
      default: return '#6B7280';       // Gray
    }
  };
  
  // Calculate and show optimized route
  const showOptimizedRoute = async () => {
    // Guard clauses to check requirements
    if (!googleMapRef.current) {
      toast({
        title: "Map not ready",
        description: "Please wait for the map to initialize",
        variant: "destructive"
      });
      return;
    }
    
    if (!google.maps || !google.maps.DirectionsService) {
      toast({
        title: "Google Maps not loaded",
        description: "Please wait for Google Maps to load completely",
        variant: "destructive"
      });
      return;
    }
    
    const tasksWithCoordinates = tasks.filter(task => task.coordinates);
    const tripsWithCoordinates = trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled');
    const allDestinations = [...tasksWithCoordinates, ...tripsWithCoordinates];
    
    if (allDestinations.length === 0) {
      toast({
        title: "No locations to route",
        description: "Add tasks or trips with locations to generate a route",
        variant: "destructive"
      });
      return;
    }

    // Limit to 25 waypoints (Google Maps API limit)
    if (allDestinations.length > 25) {
      toast({
        title: "Too many destinations",
        description: `Only the first 25 destinations will be included in the route optimization. You have ${allDestinations.length} destinations.`,
        variant: "default"
      });
    }

    const limitedDestinations = allDestinations.slice(0, 25);
    
    try {
      setLoading(true);
      console.log("Calculating optimized route for", limitedDestinations.length, "destinations...");
      
      // Clear any existing route first
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      
      // Create a new DirectionsRenderer
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: false, // Show route markers
        draggable: false,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
          strokeOpacity: 0.8
        },
        markerOptions: {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
            scale: 8
          }
        }
      });
      
      // Attach the renderer to the map
      directionsRendererRef.current.setMap(googleMapRef.current);
      
      // Create origin
      const origin = new google.maps.LatLng(location.lat, location.lng);
      
      // Create waypoints from destinations
      const waypoints = limitedDestinations.map(dest => ({
        location: new google.maps.LatLng(dest.coordinates!.lat, dest.coordinates!.lng),
        stopover: true
      }));
      
      // Use DirectionsService to get optimized route
      const directionsService = new google.maps.DirectionsService();
      
      console.log("Requesting directions with", waypoints.length, "waypoints...");
      
      // Request directions with optimization
      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        const requestConfig: google.maps.DirectionsRequest = {
          origin,
          destination: routePreferences.returnToStart ? origin : waypoints[waypoints.length - 1].location,
          waypoints: routePreferences.returnToStart ? waypoints : waypoints.slice(0, -1),
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode[routePreferences.transportMode || 'DRIVING'],
          avoidHighways: routePreferences.avoidHighways || false,
          avoidTolls: routePreferences.avoidTolls || false,
          unitSystem: google.maps.UnitSystem.IMPERIAL
        };

        directionsService.route(requestConfig, (result, status) => {
          console.log("Directions API response:", status, result);
          
          if (status === 'OK' && result) {
            resolve(result);
          } else {
            let errorMessage = `Directions request failed: ${status}`;
            switch (status) {
              case 'ZERO_RESULTS':
                errorMessage = 'No route could be found between the origin and destination.';
                break;
              case 'OVER_QUERY_LIMIT':
                errorMessage = 'Too many requests. Please try again later.';
                break;
              case 'REQUEST_DENIED':
                errorMessage = 'Directions request was denied. Please check your API key.';
                break;
              case 'INVALID_REQUEST':
                errorMessage = 'Invalid directions request. Please check your locations.';
                break;
              case 'UNKNOWN_ERROR':
                errorMessage = 'Unknown error occurred. Please try again.';
                break;
            }
            reject(new Error(errorMessage));
          }
        });
      });
      
      console.log("Directions service returned successfully");
      
      // Show directions on the map
      if (directionsRendererRef.current && result) {
        directionsRendererRef.current.setDirections(result);
        
        // Fit the map to show the entire route
        const bounds = new google.maps.LatLngBounds();
        result.routes[0].legs.forEach(leg => {
          bounds.extend(leg.start_location);
          bounds.extend(leg.end_location);
        });
        googleMapRef.current.fitBounds(bounds);
      }
      
      // Calculate total distance and duration
      let totalDistance = 0;
      let totalDuration = 0;
      
      if (result.routes[0] && result.routes[0].legs) {
        result.routes[0].legs.forEach(leg => {
          totalDistance += leg.distance?.value || 0;
          totalDuration += leg.duration?.value || 0;
        });
      }
      
      // Create optimized route info using the waypoint order from the result
      const waypointOrder = result.routes[0].waypoint_order || [];
      const orderedDestinations = waypointOrder.map(index => limitedDestinations[index]);
      
      const optimizedRouteInfo = {
        totalDistance,
        totalDuration,
        waypoints: orderedDestinations.map(dest => ({
          location: dest.coordinates!,
          stopover: true
        })),
        segments: result.routes[0].legs.map((leg, index) => ({
          distance: leg.distance?.text || '0 km',
          duration: leg.duration?.text || '0 mins',
          priority: (orderedDestinations[index] as any)?.priority || 'medium',
          startLocation: {
            lat: leg.start_location.lat(),
            lng: leg.start_location.lng()
          },
          endLocation: {
            lat: leg.end_location.lat(),
            lng: leg.end_location.lng()
          }
        }))
      };
      
      setOptimizedRoute(optimizedRouteInfo as any);
      
      // Show success message with route details
      const routeOrder = orderedDestinations.map(dest => 
        'title' in dest ? dest.title : `Trip to ${(dest as any).store}`
      ).join(' → ');
      
      toast({
        title: "Route optimized successfully!",
        description: `Total: ${Math.round(totalDuration / 60)} mins, ${(totalDistance / 1000).toFixed(1)} km\nRoute: ${routeOrder}`,
        duration: 5000
      });
      
    } catch (error) {
      console.error('Error showing optimized route:', error);
      toast({
        title: "Route optimization failed",
        description: error instanceof Error ? error.message : "Could not calculate the optimal route. Please try again.",
        variant: "destructive"
      });
      
      // Clear any partial route display
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Clear the route
  const clearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    setOptimizedRoute(null);
    
    // Restore original markers and map bounds
    if (googleMapRef.current) {
      addLocationMarkers();
      
      // Fit map to show all original markers
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(location); // Include user location
      
      // Add task and trip coordinates to bounds
      tasks.forEach(task => {
        if (task.coordinates) {
          bounds.extend({ lat: task.coordinates.lat, lng: task.coordinates.lng });
        }
      });
      
      trips.filter(trip => trip.status !== 'completed' && trip.status !== 'cancelled').forEach(trip => {
        if (trip.coordinates) {
          bounds.extend({ lat: trip.coordinates.lat, lng: trip.coordinates.lng });
        }
      });
      
      googleMapRef.current.fitBounds(bounds);
      
      // If only one location, zoom out a bit
      const totalLocations = tasks.filter(t => t.coordinates).length + 
                           trips.filter(t => t.coordinates && t.status !== 'completed' && t.status !== 'cancelled').length;
      if (totalLocations === 1) {
        googleMapRef.current.setZoom(14);
      }
    }
    
    toast({
      title: "Route cleared",
      description: "The optimized route has been removed from the map."
    });
  };
  
  // Handle route preferences change
  const handleRoutePreferencesChange = (newPreferences: RoutePreferences) => {
    setRoutePreferences(newPreferences);
  };
  
  // Re-add markers when tasks or trips change
  useEffect(() => {
    if (googleMapRef.current && !loading) {
      addLocationMarkers();
    }
  }, [tasks, trips]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-xl font-bold">Map View</h1>
          <div className="ml-auto flex items-center space-x-4">
            <Link to="/dashboard">
              <Button className="bg-primary text-white hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 relative p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Route buttons */}
            <div className="flex flex-wrap gap-2 mb-2">
              <Button 
                onClick={() => setShowRoutePreferences(true)}
                variant="outline"
                className="flex items-center"
              >
                <Route className="mr-2 h-4 w-4" />
                Route Preferences
              </Button>
              
              <Button 
                onClick={showOptimizedRoute}
                variant={optimizedRoute ? "default" : "outline"}
                className="flex items-center"
                disabled={
                  tasks.filter(t => t.coordinates).length === 0 && 
                  trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled').length === 0
                }
              >
                <Navigation className="mr-2 h-4 w-4" />
                {optimizedRoute ? "Update Route" : "Show Optimized Route"}
              </Button>
              
              {optimizedRoute && (
                <>
                  <Button 
                    onClick={clearRoute}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Route
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      // Open Google Maps with the optimized route
                      const waypoints = optimizedRoute.waypoints.map(wp => `${wp.location.lat},${wp.location.lng}`).join('|');
                      const originStr = `${location.lat},${location.lng}`;
                      const url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${routePreferences.returnToStart ? originStr : waypoints.split('|').pop()}&waypoints=${waypoints}&travelmode=${routePreferences.transportMode.toLowerCase()}`;
                      window.open(url, '_blank');
                    }}
                    variant="outline"
                    className="flex items-center"
                  >
                    <MapIcon className="mr-2 h-4 w-4" />
                    Open in Google Maps
                  </Button>
                </>
              )}
            </div>
            
            {/* Map */}
            <Card className="overflow-hidden shadow-lg">
              <CardHeader className="py-3">
                <CardTitle>Tasks Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div ref={mapRef} className="h-[400px] w-full rounded-b-lg">
                  {/* Google Map will be rendered here */}
                </div>
              </CardContent>
            </Card>
            
            {/* Route info */}
            {optimizedRoute && (
              <Card className="shadow-md">
                <CardHeader className="py-3">
                  <CardTitle>Optimized Route</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total distance:</span>
                      <span className="font-medium">{(optimizedRoute.totalDistance / 1000).toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total duration:</span>
                      <span className="font-medium">{Math.round(optimizedRoute.totalDuration / 60)} mins</span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Route segments:</h4>
                      <div className="space-y-2">
                        {optimizedRoute.segments.map((segment, index) => (
                          <div key={index} className="p-2 border rounded-md">
                            <div className="flex justify-between items-center">
                              <span className="text-sm flex items-center">
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-xs font-bold mr-2">{index + 1}</span>
                                Segment {index + 1}
                              </span>
                              <div className={`px-2 py-0.5 rounded-full text-xs font-medium 
                                ${segment.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                  segment.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 
                                  'bg-green-100 text-green-800'
                                }`}
                              >
                                {segment.priority}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {segment.distance} • {segment.duration}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Task and Trip list */}
            <Card className="shadow-md">
              <CardHeader className="py-3">
                <CardTitle>Locations</CardTitle>
              </CardHeader>
              <CardContent>
                {(tasks.length > 0 || trips.filter(trip => trip.status !== 'completed' && trip.status !== 'cancelled').length > 0) ? (
                  <div className="space-y-2">
                    {/* Tasks */}
                    {tasks.map((task, index) => (
                      <div
                        key={`task-${task.id}`}
                        className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          if (task.coordinates && googleMapRef.current) {
                            googleMapRef.current.panTo({ lat: task.coordinates.lat, lng: task.coordinates.lng });
                            googleMapRef.current.setZoom(15);
                            
                            // Find and click the corresponding marker
                            const marker = markersRef.current.find(
                              m => m.getPosition()?.lat() === task.coordinates?.lat && 
                                   m.getPosition()?.lng() === task.coordinates?.lng
                            );
                            
                            if (marker && google.maps) {
                              google.maps.event.trigger(marker, 'click');
                            }
                            
                            // Set the selected task to show task details
                            setSelectedTask(task);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold mr-3">{index + 1}</span>
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-gray-500 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" /> {task.location}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" /> {format(new Date(task.dueDate), 'PPP')}
                              </p>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                              task.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {task.priority}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Trips */}
                    {trips.filter(trip => trip.status !== 'completed' && trip.status !== 'cancelled').map((trip, index) => {
                      const tripIndex = tasks.length + index + 1;
                      return (
                        <div
                          key={`trip-${trip.id}`}
                          className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer border-blue-200 bg-blue-50/30"
                          onClick={() => {
                            if (trip.coordinates && googleMapRef.current) {
                              googleMapRef.current.panTo({ lat: trip.coordinates.lat, lng: trip.coordinates.lng });
                              googleMapRef.current.setZoom(15);
                              
                              // Find and click the corresponding marker
                              const marker = markersRef.current.find(
                                m => m.getPosition()?.lat() === trip.coordinates?.lat && 
                                     m.getPosition()?.lng() === trip.coordinates?.lng
                              );
                              
                              if (marker && google.maps) {
                                google.maps.event.trigger(marker, 'click');
                              }
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white text-xs font-bold mr-3">{tripIndex}</span>
                              <div>
                                <h3 className="font-medium">Trip to {trip.store}</h3>
                                <p className="text-sm text-gray-500 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" /> {trip.store}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" /> {format(new Date(trip.date), 'PPP')}
                                </p>
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium 
                              ${trip.status === 'shopping' ? 'bg-blue-100 text-blue-800' : 
                                'bg-green-100 text-green-800'
                              }`}
                            >
                              {trip.status}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No locations found</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Selected task info */}
      {selectedTask && (
        <motion.div 
          className="fixed bottom-28 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl z-50"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{selectedTask.title}</h3>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" /> {selectedTask.location}
              </p>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" /> Due: {format(new Date(selectedTask.dueDate), 'PPP')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={() => setSelectedTask(null)}
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
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
    </div>
  );
} 