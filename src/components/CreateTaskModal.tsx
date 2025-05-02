import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

// Add Google Maps type definitions
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement, options?: google.maps.places.AutocompleteOptions) => google.maps.places.Autocomplete;
        };
      };
    };
  }
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
}

export function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [priority, setPriority] = useState("medium");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  const { toast } = useToast();
  
  // Initialize Google Places Autocomplete
  useEffect(() => {
    console.log('CreateTaskModal: useEffect triggered', {
      isOpen,
      googleExists: !!window.google,
      mapsExists: window.google ? !!window.google.maps : false,
      placesExists: window.google && window.google.maps ? !!window.google.maps.places : false,
      inputRefExists: !!locationInputRef.current
    });
    
    // Wait a bit to ensure Google Maps API is fully loaded
    const initAutocomplete = setTimeout(() => {
      if (isOpen && locationInputRef.current) {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.error('Google Maps Places API not available');
          toast({
            title: "Google Maps not loaded",
            description: "Please refresh the page and try again",
            variant: "destructive"
          });
          return;
        }
        
        try {
          console.log('Initializing Google Places Autocomplete');
          // Create a new autocomplete instance
          autocompleteRef.current = new window.google.maps.places.Autocomplete(locationInputRef.current, {
            types: ['address']
          });
          
          console.log('Autocomplete instance created:', autocompleteRef.current);
          
          // Add listener for place selection
          autocompleteRef.current.addListener('place_changed', () => {
            try {
              console.log('Place changed event fired');
              // Check if autocompleteRef.current is still valid before trying to get the place
              if (!autocompleteRef.current) {
                console.error('Autocomplete reference is null');
                toast({
                  title: "Error selecting location",
                  description: "Please try again or enter the location manually",
                  variant: "destructive"
                });
                return;
              }
              const place = autocompleteRef.current.getPlace();
              console.log('Selected place:', place);
              
              if (place && place.geometry && place.geometry.location) {
                setLocation(place.formatted_address || place.name);
                setCoordinates({
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                });
                console.log('Location set to:', place.formatted_address || place.name);
              } else {
                console.warn('No place geometry found');
                toast({
                  title: "No location found",
                  description: "Please select a location from the dropdown",
                  variant: "destructive"
                });
              }
            } catch (error) {
              console.error("Error handling place selection:", error);
              toast({
                title: "Error selecting location",
                description: "Please try again or enter the location manually",
                variant: "destructive"
              });
            }
          });
        } catch (error) {
          console.error("Error initializing autocomplete:", error);
        }
      }
    }, 500); // Short delay to ensure API is loaded
    
    return () => {
      // Clean up
      clearTimeout(initAutocomplete);
      if (autocompleteRef.current) {
        console.log('Cleaning up autocomplete reference');
        autocompleteRef.current = null;
      }
    };
  }, [isOpen, toast]);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDate(undefined);
      setPriority("medium");
      setLocation("");
      setCoordinates(null);
    }
  }, [isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      title,
      dueDate: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      location: location,
      coordinates: coordinates || undefined
    });
    
    onClose();
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <div className="col-span-3 relative">
                <div className="flex">
                  <div className="relative flex-1">
                    <Input
                      id="location"
                      ref={locationInputRef}
                      placeholder="Enter a location"
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
                    <MapPin className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gloop-text-muted" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="col-span-3">
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
