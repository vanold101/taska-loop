import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, X, Search } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/context/TaskContext";
import { stores, findStoreByName } from "@/data/stores";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
  taskToEdit?: Task | null;
  isEditing?: boolean;
}

export function CreateTaskModal({ isOpen, onClose, onSubmit, taskToEdit, isEditing = false }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [priority, setPriority] = useState<Task['priority']>("medium");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [rotating, setRotating] = useState(false);
  const [rotationFrequency, setRotationFrequency] = useState<Task['rotationFrequency']>(null);
  const [difficulty, setDifficulty] = useState<Task['difficulty']>("Medium");
  
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesSessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  
  const [placeSearchResults, setPlaceSearchResults] = useState<Array<{
    description: string;
    place_id: string;
  }>>([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [showPlacesDropdown, setShowPlacesDropdown] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number }>({ lat: 39.9789, lng: -82.8677 }); // Default to Columbus, OH
  
  const { toast } = useToast();
  
  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Location access denied or error, use default
          console.log("Using default location for place search");
        }
      );
    }
  }, []);
  
  // Initialize Google Places services
  useEffect(() => {
    if (!isOpen) return;
    
    // Initialize Google Maps API if needed
    const initGoogleMapsAPI = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initializePlacesServices();
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCC9n6z-koJp5qiyOOPRRag3qudrcfOeK8&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initializePlacesServices;
      document.head.appendChild(script);
      
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    };
    
    // Initialize Places services
    const initializePlacesServices = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error("Google Maps Places API not available");
        return;
      }
      
      try {
        // Create a dummy div for PlacesService (required but not used)
        const dummyDiv = document.createElement('div');
        placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv);
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        placesSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        
        // Setup Place Autocomplete for the location input
        if (locationInputRef.current) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(locationInputRef.current, {
            types: ['establishment', 'address']
          });
          
          autocompleteRef.current.addListener('place_changed', () => {
            if (!autocompleteRef.current) return;
            
            const place = autocompleteRef.current.getPlace();
            if (place && place.geometry && place.geometry.location) {
              const address = place.formatted_address || place.name || "";
              setLocation(address);
              setCoordinates({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              });
              setShowPlacesDropdown(false);
            }
          });
        }
      } catch (error) {
        console.error("Error initializing Places services:", error);
      }
    };
    
    const cleanup = initGoogleMapsAPI();
    return () => {
      if (typeof cleanup === 'function') cleanup();
      // Clean up references
      autocompleteRef.current = null;
    };
  }, [isOpen]);
  
  // Reset form when modal opens or when taskToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && taskToEdit) {
        // Pre-fill form with task data for editing
        setTitle(taskToEdit.title || "");
        setDate(taskToEdit.dueDate ? parseISO(taskToEdit.dueDate) : undefined);
        setPriority(taskToEdit.priority || "medium");
        setLocation(taskToEdit.location || "");
        setCoordinates(taskToEdit.coordinates || null);
        setRotating(taskToEdit.isRotating || false);
        setRotationFrequency(taskToEdit.rotationFrequency || null);
        setDifficulty(taskToEdit.difficulty || "Medium");
      } else {
        // Reset form for new task
        setTitle("");
        setDate(undefined);
        setPriority("medium");
        setLocation("");
        setCoordinates(null);
        setRotating(false);
        setRotationFrequency(null);
        setDifficulty("Medium");
      }
      
      // Clear search results
      setPlaceSearchResults([]);
      setShowPlacesDropdown(false);
    }
  }, [isOpen, taskToEdit, isEditing]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const taskData: Partial<Task> = {
      ...(taskToEdit?.id ? { id: taskToEdit.id } : {}),
      title,
      dueDate: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      priority,
      isRotating: rotating,
      location: location || undefined,
      coordinates: coordinates || undefined,
      rotationFrequency: rotating ? rotationFrequency : null,
      difficulty: difficulty,
      ...(taskToEdit?.assignees ? { assignees: taskToEdit.assignees } : { assignees: [] }),
      ...(taskToEdit?.completed !== undefined ? { completed: taskToEdit.completed } : { completed: false }),
      ...(taskToEdit?.nextRotationDate ? { nextRotationDate: taskToEdit.nextRotationDate } : {})
    };
    
    onSubmit(taskData);
    onClose();
  };
  
  // Search places as user types
  const searchPlaces = (query: string) => {
    if (!query || query.length < 2) {
      setPlaceSearchResults([]);
      setShowPlacesDropdown(false);
      return;
    }
    
    // First, check if it matches a store name
    const storeMatches = stores
      .filter(store => store.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(store => ({
        description: `${store.name} - ${store.address}`,
        place_id: `store_${store.id}`,
        isStore: true,
        store: store
      }));
    
    if (storeMatches.length > 0) {
      setPlaceSearchResults(storeMatches);
      setShowPlacesDropdown(true);
      return;
    }
    
    // If no store matches, use Google Places API
    if (!autocompleteServiceRef.current || !placesSessionToken.current) {
      return;
    }
    
    setSearchingPlaces(true);
    setShowPlacesDropdown(true);
    
    // Create request for place predictions
    const request: google.maps.places.AutocompletionRequest = {
      input: query,
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'us' },
      location: new google.maps.LatLng(userLocation.lat, userLocation.lng),
      radius: 50000, // 50km radius
      sessionToken: placesSessionToken.current
    };
    
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
    // Check if it's a store place ID (custom format "store_123")
    if (placeId.startsWith('store_')) {
      const storeId = placeId.replace('store_', '');
      const store = stores.find(s => s.id === storeId);
      
      if (store) {
        setLocation(store.name);
        setCoordinates({
          lat: store.lat,
          lng: store.lng
        });
        setShowPlacesDropdown(false);
        return;
      }
    }
    
    // Otherwise, use Places API
    if (!placesServiceRef.current) return;
    
    placesServiceRef.current.getDetails(
      {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'geometry']
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          // Use formatted address if available, otherwise use the description
          setLocation(place.formatted_address || place.name || description);
          
          if (place.geometry?.location) {
            setCoordinates({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            });
          }
          
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
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    
    // Clear coordinates if user is typing a new location
    setCoordinates(null);
    
    // Debounce search
    const debounceTimeout = setTimeout(() => {
      searchPlaces(value);
    }, 300);
    
    return () => clearTimeout(debounceTimeout);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="title" className="sm:text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="date" className="sm:text-right">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "sm:col-span-3 justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="location" className="sm:text-right">
                Location
              </Label>
              <div className="sm:col-span-3 relative">
                <div className="flex">
                  <div className="relative flex-1">
                    <Input
                      id="location"
                      ref={locationInputRef}
                      placeholder="Enter a store or location (e.g. Trader Joe's, Walmart)"
                      value={location}
                      onChange={handleLocationChange}
                      className="pr-8 relative z-50"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {location ? (
                      <button
                        type="button"
                        onClick={() => {
                          setLocation('');
                          setCoordinates(null);
                        }}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gloop-text-muted hover:text-gloop-text"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                    <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gloop-text-muted" />
                  </div>
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
                        {placeSearchResults.map((place) => (
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
                    ) : location.length >= 2 ? (
                      <div className="p-2 text-center text-sm text-gray-500">
                        No places found
                      </div>
                    ) : (
                      <div className="p-2 text-center text-sm text-gray-500">
                        Type at least 2 characters to search
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="priority" className="sm:text-right">
                Priority
              </Label>
              <Select value={priority} onValueChange={(value: Task['priority']) => setPriority(value)}>
                <SelectTrigger className="sm:col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="difficulty" className="sm:text-right">
                Difficulty
              </Label>
              <Select value={difficulty} onValueChange={(value: Task['difficulty']) => setDifficulty(value)}>
                <SelectTrigger className="sm:col-span-3">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="rotating" className="sm:text-right">
                Rotating
              </Label>
              <div className="sm:col-span-3 flex items-center">
                <input
                  type="checkbox"
                  id="rotating"
                  checked={rotating}
                  onChange={(e) => setRotating(e.target.checked)}
                  className="mr-2 rounded border-gloop-outline focus:ring-gloop-primary h-4 w-4"
                />
                <Label htmlFor="rotating" className="text-sm">
                  This task rotates between assignees
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEditing ? "Save Changes" : "Create Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
