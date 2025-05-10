import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Map as MapIcon, Navigation, MapPin, Route, Trash2, Clock, Plus, CalendarIcon, Search, ShoppingCart } from "lucide-react";
import NavBar from "../components/NavBar";
import { useToast } from "../hooks/use-toast";
import { useTaskContext } from "../context/TaskContext";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Link } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command";

// Define simplified interfaces
interface RoutePreferences {
  avoidHighways: boolean;
  avoidTolls: boolean;
  transportMode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
  returnToStart: boolean;
  considerTraffic: boolean;
  maxStops?: number;
}

interface OptimizedRoute {
  waypoints: Array<{
    location: {
      lat: number;
      lng: number;
    };
    stopover: boolean;
  }>;
  totalDistance: number;
  totalDuration: number;
  segments: Array<{
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
    priority: string;
    taskName?: string;
    fromLocation: string;
  }>;
}

// Define Google Maps types
declare global {
  interface Window {
    searchTimeout?: NodeJS.Timeout;
    google: typeof google;
    initMap: () => void;
  }
}

const MapPage = () => {
  const { toast } = useToast();
  const { tasks, addTask } = useTaskContext();
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showRoutePreferences, setShowRoutePreferences] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    location: "",
    dueDate: new Date(),
    priority: "medium" as "low" | "medium" | "high",
    coordinates: null as { lat: number, lng: number } | null
  });
  const [placesLoaded, setPlacesLoaded] = useState(false);
  const [placeSearchResults, setPlaceSearchResults] = useState<Array<{
    description: string;
    place_id: string;
  }>>([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [showPlacesDropdown, setShowPlacesDropdown] = useState(false);
  
  const [routePreferences, setRoutePreferences] = useState<RoutePreferences>({
    avoidHighways: false,
    avoidTolls: false,
    transportMode: 'DRIVING',
    returnToStart: true,
    considerTraffic: true,
    maxStops: undefined
  });
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesSessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  
  // Get user's location
  useEffect(() => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }
    
    // Get current position
    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      () => {
        setError("Unable to retrieve your location");
        setLoading(false);
        // Use a default location
        setLocation({ lat: 39.9789, lng: -82.8677 }); // Columbus, OH
      }
    );
  }, []);
  
  // Update map markers when tasks change
  useEffect(() => {
    if (googleMapRef.current && location && window.google && !loading) {
      console.log("Tasks changed, updating markers");
      addTaskMarkers();
    }
  }, [tasks, location]);
  
  // Load Google Maps with Places library
  useEffect(() => {
    if (!location) return;
    
    const initializeMap = () => {
      if (!mapRef.current || !location) return;
      
      // Check if Google Maps is loaded
      if (!window.google || !window.google.maps) {
        console.error("Google Maps not loaded");
        return;
      }
      
      // Create the map
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
      });
      
      infoWindowRef.current = new window.google.maps.InfoWindow();
      
      // Initialize DirectionsRenderer
      const renderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
          strokeOpacity: 0.7
        }
      });
      renderer.setMap(googleMapRef.current);
      setDirectionsRenderer(renderer);
      
      // Initialize Places services
      if (window.google.maps.places) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(googleMapRef.current);
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        placesSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        setPlacesLoaded(true);
      }
      
      // Add markers for tasks
      addTaskMarkers();
    };
    
    // Define callback for Google Maps API
    window.initMap = initializeMap;
    
    // If Google Maps is already loaded, initialize map immediately
    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      // Load Google Maps API with Places library
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCC9n6z-koJp5qiyOOPRRag3qudrcfOeK8&libraries=places,geometry&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [location]);
  
  // Search places as user types in location field
  const searchPlaces = (query: string) => {
    if (!query || query.length < 3 || !placesLoaded || !autocompleteServiceRef.current) {
      setPlaceSearchResults([]);
      setShowPlacesDropdown(false);
      return;
    }
    
    setSearchingPlaces(true);
    setShowPlacesDropdown(true);
    
    // Create request for place predictions
    const request: google.maps.places.AutocompletionRequest = {
      input: query,
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'us' },
      location: location ? new google.maps.LatLng(location.lat, location.lng) : undefined,
      radius: 50000 // 50km radius
    };
    
    // Only add session token if it exists
    if (placesSessionToken.current) {
      request.sessionToken = placesSessionToken.current;
    }
    
    // Get place predictions
    autocompleteServiceRef.current.getPlacePredictions(
      request,
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
          setPlaceSearchResults(predictions.map(p => ({
            description: p.description,
            place_id: p.place_id
          })));
        } else {
          setPlaceSearchResults([]);
        }
        setSearchingPlaces(false);
      }
    );
  };
  
  // Handle place selection
  const handlePlaceSelect = (placeId: string, description: string) => {
    if (!placesServiceRef.current) return;
    
    // Get place details
    placesServiceRef.current.getDetails(
      {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'geometry']
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          // Update task location and coordinates
          setNewTask(prev => ({
            ...prev,
            location: place.formatted_address || description,
            coordinates: place.geometry?.location ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            } : null
          }));
          
          // Reset places search
          setPlaceSearchResults([]);
          setShowPlacesDropdown(false);
          
          // Get a new session token for the next search
          placesSessionToken.current = new google.maps.places.AutocompleteSessionToken();
        } else {
          toast({
            title: "Error",
            description: "Couldn't get place details",
            variant: "destructive"
          });
        }
      }
    );
  };
  
  // Handle location input change with debounce
  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewTask(prev => ({ ...prev, location: value }));
    
    // Debounce search
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    window.searchTimeout = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };
  
  // Add markers for tasks on the map
  const addTaskMarkers = () => {
    if (!googleMapRef.current || !window.google || !location) {
      console.error("Map not ready for markers");
      return;
    }
    
    console.log("Adding markers for", tasks.length, "tasks");
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    const bounds = new window.google.maps.LatLngBounds();
    
    // Add task markers
    let hasValidTasks = false;
    tasks.forEach(task => {
      if (task.coordinates && task.coordinates.lat && task.coordinates.lng) {
        try {
          console.log("Adding marker for task:", task.title, task.coordinates);
          const marker = new window.google.maps.Marker({
            position: { lat: task.coordinates.lat, lng: task.coordinates.lng },
            map: googleMapRef.current,
            title: task.title,
            icon: {
              path: 'M10 27c-.2 0-.2 0-.5-1-.3-.8-.7-2-1.6-3.5-1-1.5-2-2.7-3-3.8-2.2-2.8-3.9-5-3.9-8.8C1 4.9 5 1 10 1s9 4 9 8.9c0 3.9-1.8 6-4 8.8-1 1.2-1.9 2.4-2.8 3.8-.3 1-.4 1-.6 1Z',
              fillColor: getPriorityColor(task.priority),
              fillOpacity: 1,
              strokeWeight: 1, 
              strokeColor: '#FFFFFF',
              anchor: new window.google.maps.Point(15, 29),
              scale: 1.2,
            }
          });
          
          // Add click listener to marker
          marker.addListener('click', () => {
            setSelectedTask(task);
            
            // Show info window with task details
            const content = `
              <div class="p-2 min-w-[200px]">
                <h3 class="font-bold text-base mb-1">${task.title}</h3>
                <p class="text-gray-500 text-sm mb-1">
                  <span class="inline-block mr-2">📍</span>${task.location}
                </p>
                <p class="text-gray-500 text-sm">
                  <span class="inline-block mr-2">⏰</span>${format(new Date(task.dueDate), 'PPP')}
                </p>
              </div>
            `;
            
            infoWindowRef.current?.setContent(content);
            infoWindowRef.current?.open(googleMapRef.current, marker);
          });
          
          markersRef.current.push(marker);
          bounds.extend({ lat: task.coordinates.lat, lng: task.coordinates.lng });
          hasValidTasks = true;
        } catch (error) {
          console.error("Error adding marker for task:", task.id, error);
        }
      } else {
        console.warn("Task missing coordinates:", task.id);
      }
    });
    
    // Add user location marker
    try {
      const userMarker = new window.google.maps.Marker({
        position: location,
        map: googleMapRef.current,
        title: "Your Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
          scale: 8
        }
      });
      
      markersRef.current.push(userMarker);
      bounds.extend(location);
      
      // Fit map to show all markers
      if (hasValidTasks) {
        googleMapRef.current.fitBounds(bounds);
        
        // If only one task marker, zoom out a bit
        if (tasks.filter(task => task.coordinates).length === 1) {
          googleMapRef.current.setZoom(14);
        }
      }
    } catch (error) {
      console.error("Error adding user location marker:", error);
    }
  };
  
  // Show optimized route
  const showOptimizedRoute = async () => {
    if (!googleMapRef.current || !window.google || !location) {
      toast({
        title: "Error",
        description: "Map not initialized or location not available",
        variant: "destructive"
      });
      return;
    }
    
    const tasksWithCoordinates = tasks.filter(task => 
      task.coordinates && task.coordinates.lat && task.coordinates.lng
    );
    
    if (tasksWithCoordinates.length === 0) {
      toast({
        title: "No tasks with locations",
        description: "Add tasks with locations to generate a route",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log("Calculating route for tasks:", tasksWithCoordinates.length);
      
      // Create or update directionsRenderer
      let renderer = directionsRenderer;
      if (!renderer) {
        renderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#4285F4',
            strokeWeight: 5,
            strokeOpacity: 0.7
          }
        });
        renderer.setMap(googleMapRef.current);
        setDirectionsRenderer(renderer);
      } else {
        // Ensure it's attached to the map
        renderer.setMap(googleMapRef.current);
      }
      
      // Calculate distances between points for proper optimization
      const userLatLng = new window.google.maps.LatLng(location.lat, location.lng);
      
      // Create an array of locations with calculated distances from user
      const locationsWithDistances = tasksWithCoordinates.map(task => {
        const taskLatLng = new window.google.maps.LatLng(
          task.coordinates.lat,
          task.coordinates.lng
        );
        
        // Calculate distance using Google's geometry library
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
          userLatLng,
          taskLatLng
        );
        
        return {
          task,
          distance,
          latLng: taskLatLng
        };
      });
      
      // Sort by distance from current location for the nearest neighbor approach
      locationsWithDistances.sort((a, b) => a.distance - b.distance);
      
      console.log("Sorted locations by distance:", 
        locationsWithDistances.map(loc => ({
          title: loc.task.title, 
          distance: (loc.distance / 1609.34).toFixed(2) + " mi"
        }))
      );
      
      // Convert to waypoints for directions request
      const waypoints = locationsWithDistances.map(location => ({
        location: location.latLng,
        stopover: true
      }));
      
      // Create DirectionsService
      const directionsService = new window.google.maps.DirectionsService();
      
      // If we have too many waypoints, we need to break it up
      // Google's API has a limit of 25 waypoints for a single request
      const MAX_WAYPOINTS = 23; // Leave some room for origin/destination
      let finalRoute = null;
      
      if (waypoints.length <= MAX_WAYPOINTS) {
        // We can handle this in a single request
        console.log("Calculating single route segment with", waypoints.length, "waypoints");
        
        const request = {
          origin: userLatLng,
          destination: routePreferences.returnToStart ? userLatLng : waypoints[waypoints.length - 1].location,
          waypoints: routePreferences.returnToStart ? waypoints : waypoints.slice(0, -1),
          optimizeWaypoints: false, // We've already optimized by distance
          travelMode: window.google.maps.TravelMode[routePreferences.transportMode],
          avoidHighways: routePreferences.avoidHighways,
          avoidTolls: routePreferences.avoidTolls
        };
        
        // Request directions
        finalRoute = await directionsService.route(request);
      } else {
        // Handle multiple segments
        console.warn("Too many waypoints, breaking into segments");
        toast({
          title: "Route optimization limited",
          description: "Due to API limits, the route may not be fully optimized",
          variant: "destructive"
        });
        
        // Simplified handling for many waypoints - not ideal but works
        const request = {
          origin: userLatLng,
          destination: routePreferences.returnToStart ? userLatLng : waypoints[waypoints.length - 1].location,
          waypoints: waypoints.slice(0, MAX_WAYPOINTS),
          optimizeWaypoints: false, // We've already optimized by distance
          travelMode: window.google.maps.TravelMode[routePreferences.transportMode],
          avoidHighways: routePreferences.avoidHighways,
          avoidTolls: routePreferences.avoidTolls
        };
        
        finalRoute = await directionsService.route(request);
      }
      
      // Set directions
      renderer.setDirections(finalRoute);
      
      // Process result to create OptimizedRoute object with correct units
      const route = finalRoute.routes[0];
      const legs = route.legs;
      
      // Calculate total distance and duration
      let totalDistance = 0;
      let totalDuration = 0;
      const segments: OptimizedRoute['segments'] = [];
      
      // Process each leg of the route
      let prevLocation = "Your Location"; // Starting point name
      let formattedSegments = [];
      
      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i];
        totalDistance += leg.distance?.value || 0;
        totalDuration += leg.duration?.value || 0;
        
        const distanceInMiles = leg.distance ? 
          `${(leg.distance.value / 1609.34).toFixed(1)} mi` : 
          "Unknown";
        
        // Get the destination for this leg
        const destinationTask = i < locationsWithDistances.length ? locationsWithDistances[i].task : null;
        const destinationName = destinationTask ? destinationTask.title : 
          (i === legs.length - 1 && routePreferences.returnToStart ? "Your Location" : "Unknown");
        
        // Create a segment (if not the last leg returning to start)
        if (!(i === legs.length - 1 && routePreferences.returnToStart)) {
          formattedSegments.push({
            startLocation: {
              lat: leg.start_location.lat(),
              lng: leg.start_location.lng()
            },
            endLocation: {
              lat: leg.end_location.lat(),
              lng: leg.end_location.lng()
            },
            distance: distanceInMiles,
            duration: leg.duration?.text || "Unknown",
            priority: destinationTask ? destinationTask.priority : "medium",
            taskName: destinationName,
            fromLocation: prevLocation
          });
        }
        
        // Update previous location for next segment
        prevLocation = destinationName;
      }
      
      // Create optimal route with the data
      const optimizedWaypoints = locationsWithDistances.map(loc => ({
        location: {
          lat: loc.task.coordinates.lat,
          lng: loc.task.coordinates.lng
        },
        stopover: true
      }));
      
      // Set optimized route state
      setOptimizedRoute({
        waypoints: optimizedWaypoints,
        totalDistance,
        totalDuration,
        segments: formattedSegments
      });
      
      // Show success toast
      toast({
        title: "Route optimized",
        description: `Total trip: ${(totalDistance / 1609.34).toFixed(1)} mi (${Math.round(totalDuration / 60)} min)`
      });
    } catch (error) {
      console.error('Error showing optimized route:', error);
      toast({
        title: "Route optimization failed",
        description: "Could not calculate optimal route. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Clear route
  const clearRoute = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] } as any);
    }
    setOptimizedRoute(null);
  };
  
  // Handle route preferences change
  const handleRoutePreferencesChange = (newPreferences: RoutePreferences) => {
    setRoutePreferences(newPreferences);
  };
  
  // Get color based on task priority
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#EF4444';   // Red
      case 'medium': return '#F59E0B'; // Amber
      case 'low': return '#10B981';    // Green
      default: return '#6B7280';       // Gray
    }
  };
  
  // Handle task form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If the location field changed, clear coordinates
    if (name === 'location') {
      handleLocationInputChange(e as React.ChangeEvent<HTMLInputElement>);
      return;
    }
    
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle priority change
  const handlePriorityChange = (value: string) => {
    setNewTask(prev => ({
      ...prev,
      priority: value as "low" | "medium" | "high"
    }));
  };
  
  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setNewTask(prev => ({
        ...prev,
        dueDate: date
      }));
    }
  };
  
  // Geocode location to get coordinates
  const geocodeLocation = async (address: string): Promise<{ lat: number, lng: number } | null> => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps not initialized for geocoding");
      return null;
    }
    
    // Initialize geocoder if not already done
    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
    
    try {
      console.log("Geocoding address:", address);
      return new Promise((resolve, reject) => {
        geocoderRef.current?.geocode(
          { address },
          (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
              const location = results[0].geometry.location;
              const coordinates = {
                lat: location.lat(),
                lng: location.lng()
              };
              console.log("Geocoded coordinates:", coordinates);
              resolve(coordinates);
            } else {
              console.error("Geocoding failed:", status);
              resolve(null);
            }
          }
        );
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };
  
  // Handle task submit
  const handleSubmitTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a task title",
        variant: "destructive"
      });
      return;
    }
    
    if (!newTask.location.trim()) {
      toast({
        title: "Missing location",
        description: "Please enter a task location",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // If we don't have coordinates yet, try to geocode the location
      let coordinates = newTask.coordinates;
      if (!coordinates) {
        console.log("Geocoding location:", newTask.location);
        coordinates = await geocodeLocation(newTask.location);
        
        if (!coordinates) {
          toast({
            title: "Location error",
            description: "Could not find coordinates for this location",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }
      
      console.log("Creating task with coordinates:", coordinates);
      
      // Create new task
      const task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        location: newTask.location,
        dueDate: newTask.dueDate.toISOString(),
        priority: newTask.priority,
        coordinates: coordinates,
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      // Add task to context
      addTask(task);
      
      // Reset form and close dialog
      setNewTask({
        title: "",
        description: "",
        location: "",
        dueDate: new Date(),
        priority: "medium",
        coordinates: null
      });
      
      setShowAddTaskDialog(false);
      
      // Clear any existing route
      if (directionsRenderer) {
        directionsRenderer.setDirections({ routes: [] } as any);
      }
      setOptimizedRoute(null);
      
      toast({
        title: "Task added",
        description: "Your new task has been added to the map"
      });
      
      // Refresh map markers
      setTimeout(() => {
        addTaskMarkers(); // Add a slight delay to ensure the context has updated
      }, 100);
      
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a function to open Google Maps with all waypoints
  const openInGoogleMaps = () => {
    if (!location || !optimizedRoute) return;
    
    // Start building the Google Maps URL without specifying origin
    // This will use the device's current location automatically
    let url = `https://www.google.com/maps/dir/?api=1`;
    
    // Add destination (either last waypoint or back to origin)
    if (routePreferences.returnToStart) {
      // If returning to start, use current coordinates as destination
      url += `&destination=${location.lat},${location.lng}`;
    } else if (optimizedRoute.waypoints.length > 0) {
      // Otherwise use the last waypoint
      const lastWaypoint = optimizedRoute.waypoints[optimizedRoute.waypoints.length - 1];
      url += `&destination=${lastWaypoint.location.lat},${lastWaypoint.location.lng}`;
    }
    
    // Add waypoints if any
    if (optimizedRoute.waypoints.length > 0) {
      // Google Maps API only allows 9 waypoints in the URL
      const maxWaypoints = Math.min(optimizedRoute.waypoints.length, 9);
      const waypointsParam = optimizedRoute.waypoints
        .slice(0, routePreferences.returnToStart ? maxWaypoints : maxWaypoints - 1)
        .map(wp => `${wp.location.lat},${wp.location.lng}`)
        .join('|');
      
      if (waypointsParam) {
        url += `&waypoints=${waypointsParam}`;
      }
    }
    
    // Add travel mode
    url += `&travelmode=${routePreferences.transportMode.toLowerCase()}`;
    
    // Open the URL in a new tab
    window.open(url, '_blank');
  };

  return (
    <div className="pb-20">
      {/* Page header */}
      <header className="px-4 pt-6 pb-4 bg-white dark:bg-gloop-dark-surface border-b border-gloop-outline dark:border-gloop-dark-outline">
        <h1 className="text-2xl font-semibold">Map</h1>
        <p className="text-sm text-gloop-text-muted dark:text-gloop-dark-text-muted">
          Find nearby tasks and locations
        </p>
      </header>
      
      <main className="p-4 space-y-6">
        {loading && !googleMapRef.current ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gloop-primary"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
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
                disabled={tasks.filter(t => t.coordinates).length < 1 || loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-4 w-4" />
                    {optimizedRoute ? "Update Route" : "Show Optimized Route"}
                  </>
                )}
              </Button>

              {optimizedRoute && (
                <Button 
                  onClick={clearRoute}
                  variant="outline"
                  className="flex items-center"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Route
                </Button>
              )}
            </div>
            
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Tasks Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative">
                <div ref={mapRef} className="h-[500px] w-full">
                  {/* Google Map will be rendered here */}
                </div>
                {loading && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-lg flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <span>Loading map...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Route info */}
            {optimizedRoute && (
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                  <CardTitle>Optimized Route</CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center"
                    onClick={openInGoogleMaps}
                  >
                    <MapIcon className="mr-2 h-4 w-4" />
                    Open in Google Maps
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Map visualization of the route is already shown in the main map */}
                  
                  {/* List of stops */}
                  <div className="p-4 divide-y">
                    {optimizedRoute.segments.map((segment, index) => (
                      <div key={index} className="py-4 first:pt-0 flex items-center">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
                             style={{ 
                               backgroundColor: getPriorityColor(segment.priority),
                               opacity: 0.9 
                            }}>
                          <ShoppingCart className="h-5 w-5 text-white" />
                        </div>
                        
                        <div className="flex-grow">
                          <div className="font-medium">{segment.taskName}</div>
                          <div className="text-sm text-gray-500">
                            {segment.duration} • {segment.distance}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Summary footer */}
                    <div className="pt-4 pb-2">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">Total trip:</div>
                        <div className="text-sm text-gray-500">
                          {Math.round(optimizedRoute.totalDuration / 60)} mins • {(optimizedRoute.totalDistance / 1609.34).toFixed(1)} mi
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Nearby Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.filter(task => task.coordinates).length > 0 ? (
                  <div className="space-y-2">
                    {tasks.filter(task => task.coordinates).map(task => (
                      <div 
                        key={task.id} 
                        className="p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          if (task.coordinates && googleMapRef.current) {
                            googleMapRef.current.panTo({ lat: task.coordinates.lat, lng: task.coordinates.lng });
                            googleMapRef.current.setZoom(15);
                            
                            // Find and click the corresponding marker
                            const marker = markersRef.current.find(
                              m => m.getPosition()?.lat() === task.coordinates.lat && 
                                  m.getPosition()?.lng() === task.coordinates.lng
                            );
                            
                            if (marker) {
                              window.google.maps.event.trigger(marker, 'click');
                            }
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-gloop-text-muted dark:text-gloop-dark-text-muted">
                              {task.location} • {format(new Date(task.dueDate), 'MMM d')}
                            </div>
                          </div>
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getPriorityColor(task.priority)
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gloop-text-muted dark:text-gloop-dark-text-muted">
                    No tasks with locations found
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      {/* Floating Action Button - Add Task */}
      <Button
        onClick={() => setShowAddTaskDialog(true)}
        size="lg"
        className="fixed z-50 bottom-24 right-6 h-16 w-16 rounded-full shadow-2xl bg-primary hover:bg-primary/90 flex items-center justify-center"
        style={{ 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          zIndex: 9999
        }}
      >
        <Plus size={32} />
      </Button>
      
      {/* Bottom navigation */}
      <NavBar />
      
      {/* Route Preferences Dialog */}
      <Dialog open={showRoutePreferences} onOpenChange={setShowRoutePreferences}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Route Preferences</DialogTitle>
            <DialogDescription>
              Customize how your route is calculated
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Avoid Highways</label>
              <input 
                type="checkbox" 
                checked={routePreferences.avoidHighways} 
                onChange={e => setRoutePreferences({...routePreferences, avoidHighways: e.target.checked})}
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Avoid Tolls</label>
              <input 
                type="checkbox" 
                checked={routePreferences.avoidTolls} 
                onChange={e => setRoutePreferences({...routePreferences, avoidTolls: e.target.checked})}
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Return to Start</label>
              <input 
                type="checkbox" 
                checked={routePreferences.returnToStart} 
                onChange={e => setRoutePreferences({...routePreferences, returnToStart: e.target.checked})}
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Consider Traffic</label>
              <input 
                type="checkbox" 
                checked={routePreferences.considerTraffic} 
                onChange={e => setRoutePreferences({...routePreferences, considerTraffic: e.target.checked})}
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Transport Mode</label>
              <select
                value={routePreferences.transportMode}
                onChange={e => setRoutePreferences({...routePreferences, transportMode: e.target.value as any})}
                className="p-2 border rounded"
              >
                <option value="DRIVING">Driving</option>
                <option value="WALKING">Walking</option>
                <option value="BICYCLING">Bicycling</option>
                <option value="TRANSIT">Transit</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowRoutePreferences(false)}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Task Dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task with location to add to your map.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Task title"
                value={newTask.title}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Task description"
                value={newTask.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2 relative">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <Input
                  id="location"
                  name="location"
                  placeholder="Search for a place (e.g. Menards, Central Park)"
                  value={newTask.location}
                  onChange={handleInputChange}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              
              {/* Place search results dropdown */}
              {showPlacesDropdown && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-md max-h-60 overflow-y-auto">
                  {searchingPlaces ? (
                    <div className="p-2 text-center text-sm text-gray-500">
                      Searching...
                    </div>
                  ) : placeSearchResults.length > 0 ? (
                    <ul className="py-1">
                      {placeSearchResults.map((place, i) => (
                        <li 
                          key={place.place_id} 
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                          onClick={() => handlePlaceSelect(place.place_id, place.description)}
                        >
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{place.description}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : newTask.location.length >= 3 ? (
                    <div className="p-2 text-center text-sm text-gray-500">
                      No places found
                    </div>
                  ) : (
                    <div className="p-2 text-center text-sm text-gray-500">
                      Type at least 3 characters to search
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(newTask.dueDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newTask.dueDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select onValueChange={handlePriorityChange} defaultValue={newTask.priority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowAddTaskDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSubmitTask} disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Adding...
                </>
              ) : (
                "Add Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapPage; 