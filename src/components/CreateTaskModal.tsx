import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/context/TaskContext";

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
                // Explicitly handle type casting
                const address = place.formatted_address ? String(place.formatted_address) : 
                               (place.name ? String(place.name) : "");
                                
                setLocation(address);
                setCoordinates({
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                });
                console.log('Location set to:', address);
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
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
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
