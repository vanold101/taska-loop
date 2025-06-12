import { useState, useEffect, useRef, Fragment } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { toast } from "@/components/ui/use-toast";
import { initGoogleMapsPlaces } from "@/services/googlePlaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, MapPin, X } from "lucide-react";

interface AddTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTripDialog({ open, onOpenChange }: AddTripDialogProps) {
  // Form state
  const [store, setStore] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken | undefined>();

  // Refs
  const storeInputRef = useRef<HTMLInputElement>(null);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout>();

  // Context
  const { addTrip } = useTaskContext();

  // Initialize Google Places services
  useEffect(() => {
    if (open) {
      initGoogleMapsPlaces().catch(error => {
        console.error("Failed to initialize Google Maps:", error);
        toast({
          title: "Location Search Unavailable",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      });
    }

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [open]);

  // Handle store input changes
  const handleStoreInput = (value: string) => {
    setStore(value);
    setCoordinates(null);
    setShowSuggestions(true);

    if (!sessionToken && window.google?.maps?.places) {
      setSessionToken(new google.maps.places.AutocompleteSessionToken());
    }

    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    suggestionTimeoutRef.current = setTimeout(async () => {
      if (!window.google?.maps?.places) {
        setSuggestions([]);
        return;
      }

      try {
        const request = {
          input: value,
          includedPrimaryTypes: ['establishment'],
          sessionToken: sessionToken,
        };
        const { suggestions: newSuggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        setSuggestions([]);
      }
    }, 300);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    if (!suggestion.placePrediction) return;

    setStore(suggestion.placePrediction.text.text);
    setShowSuggestions(false);
    storeInputRef.current?.blur();
  
    try {
      const place = new google.maps.places.Place({
        id: suggestion.placePrediction.placeId,
      });
  
      await place.fetchFields({ fields: ['location', 'formattedAddress', 'displayName'] });
  
      if (place.location) {
        setCoordinates({
          lat: place.location.lat(),
          lng: place.location.lng(),
        });
        setStore(place.displayName || suggestion.placePrediction.text.text);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      toast({
        title: "Error",
        description: "Could not fetch place details.",
        variant: "destructive",
      });
    } finally {
      setSessionToken(undefined); // End of session
    }
  };

  // Reset form
  const resetForm = () => {
    setStore("");
    setDate(undefined);
    setTime("");
    setDuration("");
    setBudget("");
    setNotes("");
    setCoordinates(null);
    setIsSubmitting(false);
    setSuggestions([]);
    setShowSuggestions(false);
    setSessionToken(undefined);
  };

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!store || !date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Store and Date)",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create trip object
      const tripData = {
        store,
        date: date.toISOString(),
        time: time || undefined,
        eta: duration,
        budget: budget ? parseFloat(budget) : undefined,
        notes,
        location: store,
        coordinates: coordinates || undefined,
        participants: [{ id: '1', name: 'You', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' }],
        shopper: { name: 'You', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' }
      };

      // Add trip
      addTrip(tripData);

      toast({
        title: "Success",
        description: "Trip created successfully"
      });

      // Close dialog and reset form
      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to create trip:", error);
      toast({
        title: "Error",
        description: "Failed to create trip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Shopping Trip</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new shopping trip. Search for a store to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Input */}
          <div className="space-y-2">
            <Label htmlFor="store">Store Location*</Label>
            <div className="relative">
              <Input
                id="store"
                ref={storeInputRef}
                value={store}
                onChange={(e) => handleStoreInput(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search for a store"
                className="pr-8"
                autoComplete="off"
              />
              {store && (
                <button
                  type="button"
                  onClick={() => {
                    setStore("");
                    setCoordinates(null);
                    setSuggestions([]);
                    storeInputRef.current?.focus();
                  }}
                  className="absolute right-8 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </button>
              )}
              <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                  <ul className="py-1">
                    {suggestions.map((suggestion) => {
                      if (!suggestion.placePrediction) return null;
                      
                      const [mainText, ...secondaryTextParts] = suggestion.placePrediction.text.text.split(',');
                      const secondaryText = secondaryTextParts.join(',').trim();

                      return (
                        <li
                          key={suggestion.placePrediction.placeId}
                          onMouseDown={() => handleSelectSuggestion(suggestion)}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                        >
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="font-semibold">{mainText}</p>
                              <p className="text-xs text-muted-foreground">{secondaryText}</p>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Select */}
          <div className="space-y-2">
            <Label>Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }).flatMap((_, i) => {
                  const hour = i;
                  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                  const period = hour < 12 ? 'AM' : 'PM';
                  const hourString = hour.toString().padStart(2, '0');
                  
                  return [
                    <SelectItem key={`${hour}:00`} value={`${hourString}:00`}>
                      {`${hour12}:00 ${period}`}
                    </SelectItem>,
                    <SelectItem key={`${hour}:30`} value={`${hourString}:30`}>
                      {`${hour12}:30 ${period}`}
                    </SelectItem>
                  ];
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Duration Select */}
          <div className="space-y-2">
            <Label>Estimated Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15 min">15 minutes</SelectItem>
                <SelectItem value="30 min">30 minutes</SelectItem>
                <SelectItem value="45 min">45 minutes</SelectItem>
                <SelectItem value="1 hour">1 hour</SelectItem>
                <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                <SelectItem value="2 hours">2 hours</SelectItem>
                <SelectItem value="2.5 hours">2.5 hours</SelectItem>
                <SelectItem value="3 hours">3 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget Input */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Enter budget amount"
              min="0"
              step="0.01"
            />
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this trip"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 