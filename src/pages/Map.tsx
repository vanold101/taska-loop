import { useState, useEffect, useRef, useCallback } from "react";
import NavBar from "@/components/NavBar";
import FloatingActionButton from "@/components/FloatingActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, List, Navigation, MapPin, Clock, Search, Route } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { useTaskContext, Task } from "@/context/TaskContext";

// Mock tasks with location data
const mockLocationTasks = [
  {
    id: '1',
    title: 'Pick up dry cleaning',
    dueDate: '2025-05-05',
    location: 'Downtown Cleaners',
    coordinates: { lat: 39.9622, lng: -83.0007 },
    priority: 'high',
  },
  {
    id: '2',
    title: 'Return library books',
    dueDate: '2025-05-08',
    location: 'Columbus Public Library',
    coordinates: { lat: 39.9611, lng: -83.0101 },
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Get groceries from Trader Joe\'s',
    dueDate: '2025-05-02',
    location: 'Trader Joe\'s',
    coordinates: { lat: 39.9702, lng: -83.0150 },
    priority: 'high',
  }
];

// Global types are now defined in src/types/google-maps.d.ts

const MapPage = () => {
  const [isCreateTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  // Use tasks from the shared context instead of local mock data
  const { tasks: contextTasks, trips, syncTasksWithTrips } = useTaskContext();
  const [locationTasks, setLocationTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isRoutePlanned, setIsRoutePlanned] = useState(false);
  const [sortedRouteLocations, setSortedRouteLocations] = useState<Array<{
    task: typeof mockLocationTasks[0],
    distance: string,
    duration: string,
    legIndex: number
  }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [autocompleteSelectedPlace, setAutocompleteSelectedPlace] = useState<any>(null);
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMarkerRef = useRef<any>(null);

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number}>({ lat: 39.9622, lng: -83.0007 }); // Default to Columbus
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Helper function to get color based on priority
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return '#EA4335'; // Red
      case 'medium':
        return '#FBBC04'; // Yellow
      case 'low':
        return '#34A853'; // Green
      default:
        return '#4285F4'; // Blue
    }
  };

  // Helper function to assign default coordinates to tasks without valid coordinates
  const assignDefaultCoordinates = (tasks: Task[]): Task[] => {
    // Columbus, Ohio area - spread tasks around this central location
    const centralLat = 39.9622;
    const centralLng = -83.0007;
    const radius = 0.03; // Roughly 3km radius
    
    return tasks.map(task => {
      // If task already has valid coordinates, return it unchanged
      if (task.coordinates?.lat && task.coordinates?.lng && 
          Math.abs(task.coordinates.lat) > 0.01 && Math.abs(task.coordinates.lng) > 0.01) {
        return task;
      }
      
      // Generate random offset within radius to spread tasks
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const offsetLat = Math.sin(angle) * distance;
      const offsetLng = Math.cos(angle) * distance;
      
      // Create a new task with valid coordinates
      return {
        ...task,
        coordinates: {
          lat: centralLat + offsetLat,
          lng: centralLng + offsetLng
        }
      };
    });
  };

  // Helper function to safely render location values
  const getLocationString = (location: any): string => {
    if (location === null || location === undefined) {
      return 'Unknown Location';
    }
    if (typeof location === 'string') {
      return location;
    }
    if (typeof location === 'object' && location.name) {
      return location.name;
    }
    return 'Unknown Location';
  };

  // Sync tasks from context to local state
  useEffect(() => {
    // Update local state with tasks from context, assigning default coordinates if needed
    const tasksWithCoordinates = assignDefaultCoordinates(contextTasks);
    console.log("Updated tasks with valid coordinates:", tasksWithCoordinates);
    setLocationTasks(tasksWithCoordinates);
    // Only call syncTasksWithTrips on mount, not on every update
  }, [contextTasks]); // Remove syncTasksWithTrips from dependencies

  // Sync trips and tasks once on mount
  useEffect(() => {
    syncTasksWithTrips();
  }, []); // Empty dependency array = only run on mount

  useEffect(() => {
    let isMounted = true;
    setIsLoadingLocation(true);
    
    // Default to Columbus if geolocation fails or times out
    const locationTimeout = setTimeout(() => {
      if (isMounted && isLoadingLocation) {
        console.log("Location request timed out, using default location");
        setIsLoadingLocation(false);
        // Keep using the default location set in state initialization
      }
    }, 5000); // 5 second timeout
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted) return;
          clearTimeout(locationTimeout);
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log("Successfully got user location:", userLoc);
          setUserLocation(userLoc);
          setIsLoadingLocation(false);
        },
        (error) => {
          if (!isMounted) return;
          clearTimeout(locationTimeout);
          console.error("Error getting location:", error);
          let errorMessage = "Could not access your location. Using default location instead.";
          
          // Provide more specific error messages
          if (error.code === 1) {
            errorMessage = "Location access denied. Please enable location services to use your current location.";
          } else if (error.code === 2) {
            errorMessage = "Your location is currently unavailable. Using default location instead.";
          } else if (error.code === 3) {
            errorMessage = "Location request timed out. Using default location instead.";
          }
          
          setLocationError(errorMessage);
          setIsLoadingLocation(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      if (isMounted) {
        clearTimeout(locationTimeout);
        setLocationError("Geolocation is not supported by your browser. Using default location instead.");
        setIsLoadingLocation(false);
      }
    }
    
    return () => {
      isMounted = false;
      clearTimeout(locationTimeout);
    };
  }, []); // Only run on mount

  useEffect(() => {
    // Only load script if in map view
    if (viewMode !== 'map') return;
    
    // Define the callback function
    window.initMap = () => {
      console.log("InitMap called, checking map reference:", mapRef.current);
      if (!mapRef.current) {
        console.log("Map reference not found");
        return;
      }
      
      console.log("Initializing Google Maps...");
      
      if (!window.google || !window.google.maps) {
        console.error("Google Maps API not fully loaded");
        return;
      }
      
      try {
        // Create a new map
        const mapOptions = {
          center: userLocation,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true
        };
        
        googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
        
        console.log("Map created successfully");
        
        // Add markers for all tasks
        addTaskMarkers();
        
        // Add user location marker
        addUserLocationMarker();
        
        // Initialize search input if available
        if (searchInputRef.current && window.google.maps.places) {
          try {
            // Use standard Autocomplete
            autocompleteRef.current = new window.google.maps.places.Autocomplete(searchInputRef.current, {
              types: ['address']
            });
            
            autocompleteRef.current.addListener('place_changed', () => {
              try {
                const place = autocompleteRef.current.getPlace();
                if (!place.geometry || !place.geometry.location) {
                  toast({
                    title: "No location found",
                    description: "Please select a location from the dropdown",
                    variant: "destructive"
                  });
                  return;
                }
                
                // Store the selected place for use in handleSearchSubmit
                setAutocompleteSelectedPlace(place);
                
                // Auto-submit the form when a place is selected
                handleAddTaskAtLocation(place);
              } catch (error) {
                console.error("Error handling place selection:", error);
              }
            });
          } catch (error) {
            console.error("Error initializing autocomplete:", error);
          }
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        setLocationError("Error loading Google Maps. Please try again later.");
      }
    };
    
    // Check if script is already loaded
    if (window.google && window.google.maps) {
      console.log("Google Maps already loaded, initializing map");
      window.initMap();
      return;
    }
    
    // Load the script if it hasn't been loaded yet
    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
      console.log("Loading Google Maps script");
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCC9n6z-koJp5qiyOOPRRag3qudrcfOeK8&libraries=places,geometry&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Handle script load error
      script.onerror = () => {
        console.error("Failed to load Google Maps script");
        setLocationError("Failed to load Google Maps. Please check your internet connection.");
      };
      
      document.head.appendChild(script);
    }
    
    return () => {
      // Cleanup
      if (googleMapRef.current) {
        // Clean up markers and listeners
        clearMarkers();
        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
          userMarkerRef.current = null;
        }
      }
    };
  }, [viewMode, userLocation, toast]); // Remove functions that haven't been declared yet

  useEffect(() => {
    // Update markers when tasks change
    if (googleMapRef.current) {
      clearMarkers();
      addTaskMarkers();
    }
  }, [locationTasks]);

  useEffect(() => {
    // Update route when route planning is toggled
    if (googleMapRef.current) {
      if (isRoutePlanned) {
        calculateAndDisplayRoute();
      } else if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
    }
  }, [isRoutePlanned]);

  // Add user location marker to the map
  const addUserLocationMarker = useCallback(() => {
    if (!googleMapRef.current || !window.google || !window.google.maps) return;
    
    // Clear any existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }
    
    try {
      // Use standard Marker as fallback
      userMarkerRef.current = new window.google.maps.Marker({
        position: userLocation,
        map: googleMapRef.current,
        title: "Your Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
          scale: 8
        },
        zIndex: 1000 // Ensure it's on top of other markers
      });
    } catch (error) {
      console.error("Error adding user location marker:", error);
    }
  }, [userLocation]);

  // Add task markers to the map
  const addTaskMarkers = useCallback(() => {
    if (!googleMapRef.current || !window.google || !window.google.maps) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker) marker.setMap(null);
    });
    markersRef.current = [];
    
    if (locationTasks.length === 0) return;
    
    try {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(userLocation); // Include user location in bounds
      
      // Add markers for each task
      locationTasks.forEach(task => {
        try {
          // Skip tasks without valid coordinates
          if (!task.coordinates || typeof task.coordinates !== 'object' || !task.coordinates.lat || !task.coordinates.lng) {
            console.log(`Skipping task "${task.title}" due to missing/invalid coordinates`);
            return;
          }

          const markerColor = getPriorityColor(task.priority);
          
          // Use standard Marker as fallback
          const marker = new window.google.maps.Marker({
            position: { lat: task.coordinates.lat, lng: task.coordinates.lng },
            map: googleMapRef.current,
            title: task.title,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: markerColor,
              fillOpacity: 0.9,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              scale: 10
            }
          });
          
          // Add click event to the marker
          marker.addListener('click', () => {
            setSelectedTaskId(task.id);
          });
          
          markersRef.current.push(marker);
          
          // Add to bounds
          if (task.coordinates?.lat && task.coordinates?.lng) {
            bounds.extend(task.coordinates);
          }
        } catch (error) {
          console.error("Error adding marker for task:", task.title, error);
        }
      });
      
      // Fit map to show all markers
      googleMapRef.current.fitBounds(bounds);
      
      // If only one task, zoom out a bit
      if (locationTasks.length === 1) {
        googleMapRef.current.setZoom(14);
      }
    } catch (error) {
      console.error("Error in addTaskMarkers:", error);
    }
  }, [locationTasks, userLocation, setSelectedTaskId]);

  // Calculate and display the optimal route between tasks
  const calculateAndDisplayRoute = useCallback(() => {
    if (!googleMapRef.current || !window.google || !window.google.maps || locationTasks.length < 1) return;
    
    try {
      if (!directionsRendererRef.current) {
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#4285F4',
            strokeWeight: 5,
            strokeOpacity: 0.8
          }
        });
      }
      
      directionsRendererRef.current.setMap(googleMapRef.current);
      
      const directionsService = new window.google.maps.DirectionsService();
      
      // Sort tasks by priority and due date
      const sortedTasks = [...locationTasks].sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      
      // Create waypoints from all tasks except the last one
      const waypoints = sortedTasks.slice(0, -1).map(task => ({
        location: new window.google.maps.LatLng(task.coordinates?.lat || 0, task.coordinates?.lng || 0),
        stopover: true
      }));
      
      // If we have only one task, use it as destination with no waypoints
      const destination = sortedTasks.length > 0 
        ? new window.google.maps.LatLng(
            sortedTasks[sortedTasks.length - 1].coordinates?.lat || 0, 
            sortedTasks[sortedTasks.length - 1].coordinates?.lng || 0
          )
        : new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
      
      // Use user's current location as the origin
      directionsService.route({
        origin: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
        destination: destination,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (response, status) => {
        if (status === 'OK') {
          // Make sure directionsRendererRef.current exists before using it
          if (!directionsRendererRef.current) {
            console.log("Creating new DirectionsRenderer in calculateAndDisplayRoute");
            directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#4285F4',
                strokeWeight: 5,
                strokeOpacity: 0.8
              }
            });
            directionsRendererRef.current.setMap(googleMapRef.current);
          }
          
          // Now safely set directions
          directionsRendererRef.current.setDirections(response);
          
          // Process the optimized route
          const route = response.routes[0];
          
          // Get the order of waypoints from the optimized route
          const waypointOrder = response.routes?.[0]?.waypoint_order || [];
          
          // Create a sorted array of tasks based on the optimized route
          const sortedTasksData: Array<{
            task: typeof mockLocationTasks[0],
            distance: string,
            duration: string,
            legIndex: number
          }> = [];
          
          // First, add the first leg (from user location to first stop)
          if (route && route.legs && sortedTasks.length > 0) {
            const firstLeg = route.legs[0];
            let firstTask;
            
            // If we have waypoints, the first destination is the first waypoint in the optimized order
            if (waypointOrder.length > 0) {
              firstTask = sortedTasks[waypointOrder[0]];
            } else {
              // If no waypoints, the first destination is the final destination
              firstTask = sortedTasks[0];
            }
            
            sortedTasksData.push({
              task: firstTask,
              distance: firstLeg.distance.text,
              duration: firstLeg.duration.text,
              legIndex: 0
            });
            
            // Add the remaining legs based on the optimized waypoint order
            if (route.legs.length > 1 && waypointOrder.length > 0) {
              for (let i = 1; i < route.legs.length; i++) {
                const leg = route.legs[i];
                let taskIndex;
                
                if (i < waypointOrder.length) {
                  // This is a waypoint-to-waypoint leg
                  taskIndex = waypointOrder[i];
                } else {
                  // This is the final leg to the destination
                  taskIndex = sortedTasks.length - 1;
                }
                
                sortedTasksData.push({
                  task: sortedTasks[taskIndex],
                  distance: leg.distance.text,
                  duration: leg.duration.text,
                  legIndex: i
                });
              }
            }
          }
          
          // Store the sorted locations in state
          setSortedRouteLocations(sortedTasksData);
          
          // Convert to miles and minutes
          const distanceInMiles = (route.legs.reduce((total, leg) => total + leg.distance.value, 0) / 1609.34).toFixed(1);
          const durationInMinutes = Math.round(route.legs.reduce((total, leg) => total + leg.duration.value, 0) / 60);
          
          toast({
            title: "Route calculated",
            description: `Total trip: ${distanceInMiles} miles (${durationInMinutes} min)`,
          });
        } else {
          console.error("Error calculating route:", status);
          // Provide more specific error messages based on the status
          let errorMessage = "Could not calculate route. Please try again.";
          
          if (status === window.google.maps.DirectionsStatus.ZERO_RESULTS) {
            errorMessage = "No route found between these locations. Try locations that are closer together.";
          } else if (status === window.google.maps.DirectionsStatus.NOT_FOUND) {
            errorMessage = "One or more locations could not be found. Please check your task addresses.";
          } else if (status === window.google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED) {
            errorMessage = "Too many stops in your route. Please reduce the number of tasks.";
          } else if (status === window.google.maps.DirectionsStatus.INVALID_REQUEST) {
            errorMessage = "Invalid route request. Make sure all locations have valid coordinates.";
          }

          // Clear any existing directions
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current = null;
          }
          
          // Reset the route planning state
          setIsRoutePlanned(false);
          setSortedRouteLocations([]);
          
          toast({
            title: "Route calculation failed",
            description: errorMessage,
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error("Error calculating route:", error);
      toast({
        title: "Error calculating route",
        description: "There was a problem calculating your route",
        variant: "destructive"
      });
      setIsRoutePlanned(false);
    }
  }, [locationTasks, userLocation, setIsRoutePlanned, setSortedRouteLocations, toast]);

  // Handle adding a task at a specific location
  const handleAddTaskAtLocation = (place: any) => {
    setCreateTaskModalOpen(true);
    // Store the place data to use when creating the task
    sessionStorage.setItem('newTaskLocation', JSON.stringify({
      name: place.name || place.formatted_address,
      address: place.formatted_address,
      coordinates: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }
    }));
  };

  // Clear all markers from the map
  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      if (marker) marker.setMap(null);
    });
    markersRef.current = [];
  };

  const handleCreateTask = (data: { title: string; dueDate: string; location?: string; coordinates?: {lat: number, lng: number} }) => {
    // Generate valid coordinates if none are provided
    let coordinates = data.coordinates;
    
    // Check if coordinates are missing or invalid (near 0,0)
    if (!coordinates || !coordinates.lat || !coordinates.lng || 
        (Math.abs(coordinates.lat) < 0.01 && Math.abs(coordinates.lng) < 0.01)) {
      // Default to Columbus area with slight random variation for visual separation
      const centralLat = 39.9642;
      const centralLng = -82.9950;
      const radius = 0.02; // About 2km radius
      
      // Create a random offset
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      coordinates = {
        lat: centralLat + Math.sin(angle) * distance,
        lng: centralLng + Math.cos(angle) * distance
      };
      
      console.log(`Generated random coordinates for new task "${data.title}":`, coordinates);
    }
    
    const newTask = {
      id: Date.now().toString(),
      title: data.title,
      dueDate: data.dueDate,
      location: data.location || 'New Location',
      coordinates: coordinates,
      priority: 'medium' as 'low' | 'medium' | 'high',
    };
    
    setLocationTasks([newTask, ...locationTasks]);
    
    toast({
      title: "Task created!",
      description: `Task "${data.title}" added at ${getLocationString(newTask.location)}`,
    });
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'map' ? 'list' : 'map');
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
    
    if (googleMapRef.current) {
      const task = locationTasks.find(t => t.id === taskId);
      if (task && task.coordinates?.lat && task.coordinates?.lng) {
        googleMapRef.current.panTo(task.coordinates);
        googleMapRef.current.setZoom(15);
      }
    }
  };
  
  // Calculate the optimal route based on current location and tasks
  const calculateOptimalRoute = () => {
    if (!window.google || !window.google.maps || locationTasks.length < 1) {
      // Silent fail instead of showing notification
      console.log("Cannot calculate route: Google Maps is not loaded or no tasks available");
      return;
    }
    
    // Make sure we have the user's actual current location
    if (isLoadingLocation) {
      toast({
        title: "Getting your location",
        description: "Please wait while we access your current location",
        variant: "default"
      });
      return;
    }
    
    // Request fresh location for route calculation
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Use the fresh location data
        const freshLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log("Using fresh location for route calculation:", freshLocation);
        
        // Update the user location state
        setUserLocation(freshLocation);
        
        // Calculate route with fresh location
        calculateRouteWithLocation(freshLocation);
      },
      (error) => {
        console.error("Error getting current location:", error);
        toast({
          title: "Using default location",
          description: "Using your last known location for route calculation",
          variant: "default"
        });
        // Fall back to the stored user location
        calculateRouteWithLocation(userLocation);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  
  // Helper function to calculate route with a specific location
  const calculateRouteWithLocation = (currentLocation) => {
    const directionsService = new window.google.maps.DirectionsService();
    
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true, // Use our custom markers instead
        polylineOptions: {
          strokeColor: "#4285F4",
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      });
    }
    
    directionsRendererRef.current.setMap(googleMapRef.current);
    
    // Filter tasks that have valid coordinates
    const validTasks = locationTasks.filter(task => 
      task.coordinates && task.coordinates.lat && task.coordinates.lng
    );
    
    if (validTasks.length === 0) {
      // Silent fail instead of showing notification
      console.log("No valid locations: Tasks don't have valid coordinates");
      return;
    }

    console.log("Valid tasks for route:", validTasks.map(t => ({
      title: t.title,
      lat: t.coordinates?.lat, 
      lng: t.coordinates?.lng
    })));
    
    // Start from user's current location - using the fresh coordinates
    const origin = new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng);
    console.log("Route origin:", origin.toString());
    
    // All tasks are waypoints for optimization
    const waypoints = validTasks.map(task => {
      const lat = task.coordinates?.lat || 0;
      const lng = task.coordinates?.lng || 0;
      
      // Skip invalid coordinates (0,0 or near it)
      if (Math.abs(lat) < 0.001 && Math.abs(lng) < 0.001) {
        console.log(`Skipping invalid coordinates for task ${task.title}: near (0,0)`);
        return null;
      }
      
      return {
        location: new window.google.maps.LatLng(lat, lng),
        stopover: true
      };
    }).filter(wp => wp !== null); // Remove any null waypoints
    
    if (waypoints.length === 0) {
      toast({
        title: "Cannot calculate route",
        description: "No valid task locations found",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Route waypoints:", waypoints.map(wp => wp.location.toString()));
    
    // Return to starting point (round trip)
    const destination = origin;
    console.log("Route destination:", destination.toString());
    
    // Request for optimal route
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        optimizeWaypoints: true, // This is what makes the route optimal!
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          // Ensure the renderer is initialized before using it
          if (!directionsRendererRef.current) {
            console.log("Creating new DirectionsRenderer");
            directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#4285F4",
                strokeWeight: 5,
                strokeOpacity: 0.8
              }
            });
            directionsRendererRef.current.setMap(googleMapRef.current);
          }
          
          // Now it's safe to set directions
          directionsRendererRef.current.setDirections(result);
          
          // Process the optimized route
          const route = result.routes[0];
          
          // Get the order of waypoints from the optimized route
          const waypointOrder = result.routes?.[0]?.waypoint_order || [];
          
          // Create a sorted array of tasks based on the optimized route
          const sortedTasks = [];
          
          // Add all waypoints in the optimized order
          if (route && route.legs && waypointOrder) {
            waypointOrder.forEach((waypointIndex, i) => {
              // Make sure the waypointIndex is valid
              if (validTasks[waypointIndex] && route.legs[i]) {
                const task = validTasks[waypointIndex];
                const leg = route.legs[i];
                
                // Convert distance to miles (Google returns in meters)
                const distanceInMiles = (leg.distance?.value * 0.000621371 || 0).toFixed(1);
                
                sortedTasks.push({
                  task: task,
                  distance: `${distanceInMiles} miles`,
                  duration: leg.duration?.text || "Unknown",
                  legIndex: i
                });
              }
            });
          }
          
          // Update state
          setSortedRouteLocations(sortedTasks);
          setIsRoutePlanned(true);
          
          // Success message removed to reduce notifications
          console.log(`Optimal route calculated! Total distance: ${(route.legs.reduce((total, leg) => total + leg.distance.value, 0) * 0.000621371).toFixed(1)} miles`);
        } else {
          console.error("Error calculating route:", status);
          // Provide more specific error messages based on the status
          let errorMessage = "Could not calculate route. Please try again.";
          
          if (status === window.google.maps.DirectionsStatus.ZERO_RESULTS) {
            errorMessage = "No route found between these locations. Try locations that are closer together.";
          } else if (status === window.google.maps.DirectionsStatus.NOT_FOUND) {
            errorMessage = "One or more locations could not be found. Please check your task addresses.";
          } else if (status === window.google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED) {
            errorMessage = "Too many stops in your route. Please reduce the number of tasks.";
          } else if (status === window.google.maps.DirectionsStatus.INVALID_REQUEST) {
            errorMessage = "Invalid route request. Make sure all locations have valid coordinates.";
          }

          // Clear any existing directions
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current = null;
          }
          
          // Reset the route planning state
          setIsRoutePlanned(false);
          setSortedRouteLocations([]);
          
          toast({
            title: "Route calculation failed",
            description: errorMessage,
            variant: "destructive"
          });
        }
      }
    );
  };

  // Clear the calculated route
  const clearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    setSortedRouteLocations([]);
    setIsRoutePlanned(false);
  };

  // Function to handle showing route
  const handleShowRoute = useCallback(() => {
    // Toggle route planning state
    const newRoutePlannedState = !isRoutePlanned;
    setIsRoutePlanned(newRoutePlannedState);
    
    // Calculate optimal route if turning on, or clear if turning off
    if (newRoutePlannedState) {
      calculateOptimalRoute();
    } else {
      clearRoute();
      setSortedRouteLocations([]);
    }
  }, [isRoutePlanned, calculateOptimalRoute, clearRoute]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // If we have a place from autocomplete, use that directly
    if (autocompleteSelectedPlace) {
      handleAddTaskAtLocation(autocompleteSelectedPlace);
      setAutocompleteSelectedPlace(null);
      setIsSearching(false);
      return;
    }
    
    // Otherwise, perform a search with the Places API
    if (window.google && window.google.maps && window.google.maps.places) {
      try {
        // Create a PlacesService if we don't have one yet
        if (!placesServiceRef.current && googleMapRef.current) {
          placesServiceRef.current = new window.google.maps.places.PlacesService(googleMapRef.current);
        }
        
        if (placesServiceRef.current) {
          placesServiceRef.current.findPlaceFromQuery({
            query: searchQuery,
            fields: ['name', 'geometry', 'formatted_address']
          }, (results, status) => {
            setIsSearching(false);
            
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
              const place = results[0];
              handleAddTaskAtLocation(place);
            } else {
              toast({
                title: "Location not found",
                description: "Please try a different search term",
                variant: "destructive"
              });
            }
          });
        } else {
          setIsSearching(false);
          toast({
            title: "Search unavailable",
            description: "Places service could not be initialized",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error searching for place:", error);
        setIsSearching(false);
        toast({
          title: "Error searching",
          description: "An error occurred while searching for the location",
          variant: "destructive"
        });
      }
    } else {
      setIsSearching(false);
      toast({
        title: "Search unavailable",
        description: "Google Places API is not available",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="pb-20 pt-6 px-4 max-w-md mx-auto">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end">Tasks Map</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 premium-card hover:shadow-md"
          onClick={toggleViewMode}
        >
          {viewMode === 'map' ? (
            <>
              <List className="h-4 w-4 text-gloop-primary" />
              <span>List View</span>
            </>
          ) : (
            <>
              <MapIcon className="h-4 w-4 text-gloop-primary" />
              <span>Map View</span>
            </>
          )}
        </Button>
      </header>

      {viewMode === 'map' && (
        <form onSubmit={handleSearchSubmit} className="mb-4 relative">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a location or business..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Clear the selected place when the user types
              if (autocompleteSelectedPlace) {
                setAutocompleteSelectedPlace(null);
              }
            }}
          />
          <Button 
            type="submit" 
            size="sm" 
            variant="ghost" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            disabled={isSearching}
          >
            {isSearching ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gloop-primary border-t-transparent" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </form>
      )}

      <div className="mb-4">
        <Button 
          variant={isRoutePlanned ? "default" : "outline"}
          className={`flex items-center gap-2 w-full ${isRoutePlanned ? "premium-gradient-btn" : "premium-card"}`}
          onClick={handleShowRoute}
          disabled={locationTasks.length < 1}
        >
          <Navigation className="h-4 w-4" />
          {isRoutePlanned ? "Hide Optimal Route" : "Show Optimal Route"}
        </Button>
        
        {/* Simple Optimal Route List */}
        {isRoutePlanned && sortedRouteLocations.length > 0 && (
          <div className="mt-3 bg-white dark:bg-gloop-dark-surface rounded-lg shadow p-3">
            <h3 className="text-sm font-medium mb-2">Optimal Route Order:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              {sortedRouteLocations.map((item) => (
                <li key={item.task.id} className="text-sm cursor-pointer hover:text-gloop-primary" onClick={() => setSelectedTaskId(item.task.id)}>
                  {item.task.title} <span className="text-xs text-gloop-text-muted">({item.distance})</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {viewMode === 'map' && (
        <div className="mb-4">
          <Card className="premium-card overflow-hidden">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gloop-primary" />
                Location Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-2">
              {locationTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks with locations yet</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {locationTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="flex items-start gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        if (googleMapRef.current && task.coordinates?.lat && task.coordinates?.lng) {
                          googleMapRef.current.panTo(task.coordinates);
                          googleMapRef.current.setZoom(15);
                        }
                      }}
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        task.priority === 'high' ? 'bg-red-500' : 
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{getLocationString(task.location)}</p>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {task.dueDate && task.dueDate.trim() !== '' ? 
                          format(new Date(task.dueDate), 'MMM d') : 
                          'No date'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === 'map' ? (
        <div className="relative">
          {isLoadingLocation && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gloop-primary mx-auto mb-2"></div>
                <p>Getting your location...</p>
              </div>
            </div>
          )}
          <div 
            ref={mapRef} 
            className="h-[500px] w-full rounded-lg overflow-hidden shadow-md"
            style={{ minHeight: "500px", background: "#f0f0f0" }}
          >
            {/* Google Map will be rendered here */}
            {!googleMapRef.current && !isLoadingLocation && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gloop-primary mx-auto mb-2"></div>
                  <p>Loading map...</p>
                  <p className="text-xs mt-2 text-gray-500">If the map doesn't appear, please try refreshing the page.</p>
                </div>
              </div>
            )}
          </div>
          
          {locationError && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/50 p-2 rounded-md text-sm text-red-700 dark:text-red-200">
              {locationError}
            </div>
          )}
          {/* Selected task info */}
          {selectedTaskId && (
            <motion.div 
              className="absolute bottom-4 left-4 right-4 glass-effect p-4 rounded-lg shadow-lg"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
            >
              {(() => {
                const task = locationTasks.find(t => t.id === selectedTaskId);
                return task ? (
                  <div className="relative">
                    <button
                      className="absolute top-0 right-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setSelectedTaskId(null)}
                      aria-label="Close"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                    <h3 className="font-medium pr-6">{task.title}</h3>
                    <p className="text-sm text-gloop-text-muted flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {getLocationString(task.location)}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gloop-text-muted flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Due: {task.dueDate && task.dueDate.trim() !== '' ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                      </p>
                      <Button 
                        size="sm" 
                        className="text-xs premium-gradient-btn"
                        onClick={() => {
                          // Open Google Maps directions
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${task.coordinates?.lat || 0},${task.coordinates?.lng || 0}`;
                          window.open(url, '_blank');
                        }}
                      >
                        Get Directions
                      </Button>
                    </div>
                  </div>
                ) : null;
              })()}
            </motion.div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {locationTasks.map((task) => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="hover-lift"
            >
              <Card 
                className={`hover:shadow-md transition-shadow cursor-pointer premium-card border-l-4 ${
                  task.priority === 'high' ? 'priority-high' : 
                  task.priority === 'medium' ? 'priority-medium' : 'priority-low'
                }`}
                onClick={() => handleTaskClick(task.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-gloop-text-muted" />
                        <p className="text-sm text-gloop-text-muted">
                          {getLocationString(task.location)}
                        </p>
                      </div>
                      <p className="text-xs text-gloop-text-muted mt-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Due: {task.dueDate && task.dueDate.trim() !== '' ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 rounded-full hover:bg-gloop-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task.id);
                      }}
                    >
                      <MapIcon className="h-4 w-4 text-gloop-primary" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <FloatingActionButton onClick={() => setCreateTaskModalOpen(true)} />
      
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <NavBar />
    </div>
  );
};

export default MapPage;
