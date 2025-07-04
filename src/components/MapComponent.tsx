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
import { CreateTaskModal } from "../components/CreateTaskModal";

export default function MapComponent() {
  const { toast } = useToast();
  const { tasks, trips, addTask } = useTaskContext();
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
        
        toast({
          title: "Map loaded",
          description: "Google Maps has been loaded successfully."
        });
        
      } catch (error) {
        console.error("Failed to initialize map:", error);
        toast({
          title: "Map loading failed",
          description: "There was an error loading the map. Please try again.",
          variant: "destructive"
        });
      }
    };

    initializeMap();
  }, [loading, location]);

  // Add all markers for the map
  const addAllMarkers = () => {
    if (!googleMapRef.current || !window.google) return;
    
    // Clear existing markers first
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Add user location marker (Always A)
    const userMarker = new google.maps.Marker({
      position: location,
      map: googleMapRef.current,
      title: 'Your Location',
      label: {
        text: 'A',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold'
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#2563EB', // Blue for user location
        fillOpacity: 1,
        strokeWeight: 3,
        strokeColor: '#FFFFFF',
        scale: 14,
        labelOrigin: new google.maps.Point(0, 0)
      }
    });
    markersRef.current.push(userMarker);
    
    let letterIndex = 1; // Start at 1 since A is user location
    
    // Add task markers - only for tasks with coordinates
    tasks.filter(task => task.coordinates).forEach((task) => {
      const letter = String.fromCharCode(65 + letterIndex); // B, C, D, etc.
      const marker = new google.maps.Marker({
        position: { lat: task.coordinates.lat, lng: task.coordinates.lng },
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
          fillColor: '#EF4444', // Red for tasks
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
          scale: 12,
          labelOrigin: new google.maps.Point(0, 0)
        }
      });
      
      marker.addListener('click', () => {
        setSelectedTask(task);
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div>
              <h4>${task.title}</h4>
              <p>${task.location}</p>
              <p>Priority: ${task.priority}</p>
              <p>Due: ${format(new Date(task.dueDate), 'PPP')}</p>
            </div>
          `);
          infoWindowRef.current.open(googleMapRef.current, marker);
        }
      });
      
      markersRef.current.push(marker);
      letterIndex++;
    });
    
    // Add trip markers - only for trips with coordinates
    trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled').forEach((trip) => {
      const coordinates = trip.coordinates!; // Safe to assert since we filtered for coordinates
      const letter = String.fromCharCode(65 + letterIndex); // Continue lettering sequence
      const marker = new google.maps.Marker({
        position: { lat: coordinates.lat, lng: coordinates.lng },
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
          fillColor: '#3B82F6', // Blue for trips
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
          scale: 12,
          labelOrigin: new google.maps.Point(0, 0)
        }
      });
      
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div>
              <h4>Trip to ${trip.store}</h4>
              <p>ETA: ${trip.eta}</p>
              <p>Status: ${trip.status}</p>
              <p>Items: ${trip.items.length}</p>
            </div>
          `);
          infoWindowRef.current.open(googleMapRef.current, marker);
        }
      });
      
      markersRef.current.push(marker);
      letterIndex++;
    });
    
    console.log(`Created ${markersRef.current.length} markers on map`);
  };

  // Update markers when tasks, trips, or location changes
  useEffect(() => {
    if (googleMapRef.current) {
      addAllMarkers();
    }
  }, [tasks, trips, location]);

  // Route optimization and preferences
  const handleRoutePreferencesChange = (newPreferences: RoutePreferences) => {
    setRoutePreferences(newPreferences);
  };

  const showOptimizedRoute = async () => {
    if (!googleMapRef.current || !window.google) return;
    
    // Get all locations with coordinates
    const taskLocations = tasks.filter(task => task.coordinates).map(task => ({
      location: {
        lat: task.coordinates!.lat,
        lng: task.coordinates!.lng
      },
      priority: task.priority,
      dueDate: new Date(task.dueDate)
    } as StopTimeWindow));
    
    const tripLocations = trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled').map(trip => ({
      location: {
        lat: trip.coordinates!.lat,
        lng: trip.coordinates!.lng
      },
      priority: 'medium' as const,
      dueDate: new Date(trip.date)
    } as StopTimeWindow));
    
    const allLocations = [...taskLocations, ...tripLocations];
    
    if (allLocations.length === 0) {
      toast({
        title: "No locations to optimize",
        description: "Add some tasks or trips with locations to optimize your route.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const origin = new google.maps.LatLng(location.lat, location.lng);
      const route = await calculateOptimalRoute(origin, allLocations, routePreferences);
      setOptimizedRoute(route);
      
      // Display route on map
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        draggable: true,
        panel: document.createElement('div') // We'll handle this ourselves
      });
      
      directionsRendererRef.current.setMap(googleMapRef.current);
      
      // Create directions request using the waypoints from the optimized route
      const waypoints = route.waypoints.slice(0, -1).map(wp => ({
        location: new google.maps.LatLng(wp.location.lat, wp.location.lng),
        stopover: true
      }));
      
      const directionsService = new google.maps.DirectionsService();
      const destination = routePreferences.returnToStart ? 
        new google.maps.LatLng(location.lat, location.lng) : 
        new google.maps.LatLng(route.waypoints[route.waypoints.length - 1].location.lat, route.waypoints[route.waypoints.length - 1].location.lng);
      
      const directionsRequest: google.maps.DirectionsRequest = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
        avoidHighways: routePreferences.avoidHighways,
        avoidTolls: routePreferences.avoidTolls
      };
      
      directionsService.route(directionsRequest, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current?.setDirections(result);
          
          toast({
            title: "Route optimized",
            description: `Optimized route with ${route.waypoints.length} stops. Total distance: ${(route.totalDistance / 1000).toFixed(1)} km, time: ${Math.round(route.totalDuration / 60)} minutes.`
          });
        } else {
          toast({
            title: "Route optimization failed",
            description: "Unable to calculate the optimal route. Please try again.",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error('Route optimization error:', error);
      toast({
        title: "Route optimization failed",
        description: "There was an error calculating the route. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateTask = (taskData: any) => {
    addTask(taskData);
    toast({
      title: "Task created",
      description: "Your task has been successfully created.",
    });
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
          <div className="flex flex-1 gap-4 p-4">
            {/* Left Sidebar - Route Options and Locations */}
            <div className="w-80 flex-shrink-0 flex flex-col gap-4">
              {/* Route Options */}
              <Card className="shadow-md flex-shrink-0">
                <CardHeader className="py-3">
                  <CardTitle>Route Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setShowRoutePreferences(true)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Route className="mr-2 h-4 w-4" />
                        Preferences
                      </Button>
                      
                      <Button 
                        onClick={showOptimizedRoute}
                        variant={optimizedRoute ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        disabled={
                          tasks.filter(t => t.coordinates).length === 0 && 
                          trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled').length === 0
                        }
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        {optimizedRoute ? "Update" : "Optimize"}
                      </Button>
                    </div>
                    
                    {optimizedRoute && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-sm font-medium text-green-900">
                          {optimizedRoute.waypoints.length + 1} stops • {(optimizedRoute.totalDistance / 1609.34).toFixed(1)} miles • {Math.round(optimizedRoute.totalDuration / 60)} min
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Locations */}
              <Card className="shadow-md flex-1 min-h-0">
                <CardHeader className="py-3 flex-shrink-0">
                  <CardTitle className="flex items-center justify-between">
                    <span>Locations</span>
                    <span className="text-sm text-gray-500">
                      {tasks.filter(t => t.coordinates).length + trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled').length + 1} total
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <div className="h-full overflow-y-auto px-6 pb-6">
                    {(tasks.filter(t => t.coordinates).length > 0 || trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled').length > 0) ? (
                      <div className="space-y-2">
                        {/* User Location - Always A */}
                        <div className="p-3 border rounded-md bg-blue-50 border-blue-200">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">A</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm">Your Location</h4>
                              <p className="text-xs text-gray-600">Starting point</p>
                            </div>
                          </div>
                        </div>

                        {/* Tasks */}
                        {tasks.filter(task => task.coordinates).map((task, index) => {
                          const letter = String.fromCharCode(66 + index); // B, C, D, etc.
                          return (
                            <div
                              key={`task-${task.id}`}
                              className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
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
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{letter}</span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-sm truncate">{task.title}</h4>
                                    <p className="text-xs text-gray-500 truncate">{task.location}</p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs text-gray-500">
                                    {format(new Date(task.dueDate), 'MMM d')}
                                  </p>
                                  <span className={`text-xs px-2 py-1 rounded ${
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
                              className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => {
                                if (trip.coordinates && googleMapRef.current) {
                                  googleMapRef.current.panTo({ lat: trip.coordinates.lat, lng: trip.coordinates.lng });
                                  googleMapRef.current.setZoom(15);
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{letter}</span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-sm truncate">{trip.store}</h4>
                                    <p className="text-xs text-gray-500">{trip.items.length} items</p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs text-gray-500">ETA: {trip.eta}</p>
                                  <span className={`text-xs px-2 py-1 rounded ${
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
                        <MapPin className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500 font-medium">No locations to display</p>
                        <p className="text-xs text-gray-400 mt-1">Add tasks or trips with locations to see them here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Route Optimization Details */}
              {optimizedRoute && (
                <Card className="shadow-md flex-shrink-0">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Route Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {optimizedRoute.segments.map((segment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-600">
                              {index === 0 ? 'A' : String.fromCharCode(65 + index)} → {String.fromCharCode(66 + index)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {segment.distance}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{segment.duration}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between text-sm font-medium">
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
            <div className="flex-1 min-w-0">
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