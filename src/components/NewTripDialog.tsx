import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Store as StoreIcon, X, Plus, Package, ShoppingCart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskContext } from "@/context/TaskContext";
import { usePantry } from "@/context/PantryContext";
import { toast } from "@/components/ui/use-toast";
import { initGoogleMapsPlaces } from "../services/googlePlaces";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NewTripDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewTripDialog({ isOpen, onClose }: NewTripDialogProps) {
  const { addTrip } = useTaskContext();
  const { pantryItems } = usePantry();
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [budget, setBudget] = useState("");
  const [eta, setEta] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPantryItems, setSelectedPantryItems] = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [newCustomItem, setNewCustomItem] = useState("");

  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Filter pantry items by category for better organization
  const pantryItemsByCategory = pantryItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof pantryItems>);

  // Handle pantry item toggle
  const handlePantryItemToggle = (itemId: string) => {
    setSelectedPantryItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Handle custom item addition
  const handleAddCustomItem = () => {
    if (newCustomItem.trim() && !customItems.includes(newCustomItem.trim())) {
      const trimmedItem = newCustomItem.trim();
      setCustomItems(prev => [...prev, trimmedItem]);
      setNewCustomItem("");
      toast({
        title: "Item Added",
        description: `"${trimmedItem}" has been added to your shopping list`,
      });
    } else if (customItems.includes(newCustomItem.trim())) {
      toast({
        title: "Item Already Added",
        description: `"${newCustomItem.trim()}" is already in your shopping list`,
        variant: "destructive"
      });
    }
  };

  // Handle Enter key press for adding custom items
  const handleCustomItemKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomItem();
    }
  };

  // Handle custom item removal
  const handleRemoveCustomItem = (item: string) => {
    setCustomItems(prev => prev.filter(i => i !== item));
  };

  // Add global styles for Google Places Autocomplete
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      .pac-container {
        z-index: 9999 !important;
        margin-top: 2px;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        font-family: inherit;
        border: 1px solid #e5e7eb;
      }
      .pac-item {
        padding: 8px 12px;
        cursor: pointer;
        font-family: inherit;
      }
      .pac-item:hover {
        background-color: #f3f4f6;
      }
      .pac-item-query {
        font-size: 14px;
        color: #111827;
      }
      .pac-icon {
        display: none;
      }
      .pac-item-selected {
        background-color: #f3f4f6;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;

    const initializeAutocomplete = async () => {
      if (!isOpen || !locationInputRef.current) return;

      try {
        await initGoogleMapsPlaces();
        
        if (!window.google?.maps?.places) {
          throw new Error('Google Maps Places API not available');
        }

        // Clean up existing autocomplete
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        }

        // Create new autocomplete instance
        const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current, {
          types: ['establishment'],
          fields: ['name', 'formatted_address', 'geometry', 'place_id']
        });

        // Add listener for place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.geometry?.location) {
            toast({
              title: "No location found",
              description: "Please select a location from the dropdown",
              variant: "destructive"
            });
            return;
          }

          const address = place.formatted_address || place.name || "";
          setLocation(address);
          setCoordinates({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
        });

        autocompleteRef.current = autocomplete;
      } catch (error) {
        console.error("Error initializing Places API:", error);
        if (retryCount < maxRetries) {
          retryCount++;
          timeoutId = setTimeout(initializeAutocomplete, 1000);
        } else {
          toast({
            title: "Error",
            description: "Failed to initialize location search. Please try refreshing the page.",
            variant: "destructive"
          });
        }
      }
    };

    initializeAutocomplete();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location || !date || !time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create items array from selected pantry items and custom items
      const tripItems = [
        // Add selected pantry items
        ...Array.from(selectedPantryItems).map(itemId => {
          const pantryItem = pantryItems.find(p => p.id === itemId);
          return {
            id: `item-${Date.now()}-${itemId}`,
            name: pantryItem?.name || 'Unknown Item',
            quantity: 1,
            checked: false,
            category: pantryItem?.category,
            notes: `From pantry (${pantryItem?.quantity} available)`,
            addedBy: {
              name: "You",
              avatar: "https://example.com/you.jpg"
            }
          };
        }),
        // Add custom items
        ...customItems.map((itemName, index) => ({
          id: `custom-${Date.now()}-${index}`,
          name: itemName,
          quantity: 1,
          checked: false,
          addedBy: {
            name: "You",
            avatar: "https://example.com/you.jpg"
          }
        }))
      ];

      // Create the trip object with required fields
      const tripData = {
        store: location,
        date: date.toISOString(),
        time,
        notes,
        budget: budget ? parseFloat(budget) : undefined,
        eta,
        location,
        coordinates,
        participants: [{ id: '1', name: 'You', avatar: 'https://example.com/you.jpg' }],
        shopper: { name: 'You', avatar: 'https://example.com/you.jpg' },
        items: tripItems
      };

      // Add the trip
      const newTrip = addTrip(tripData);
      
      toast({
        title: "Success",
        description: `Trip created successfully! ${selectedPantryItems.size + customItems.length > 0 ? `Added ${selectedPantryItems.size + customItems.length} items to your shopping list.` : ''}`,
      });
      
      // Reset form
      setLocation("");
      setCoordinates(undefined);
      setDate(undefined);
      setTime("");
      setNotes("");
      setBudget("");
      setEta("");
      setSelectedPantryItems(new Set());
      setCustomItems([]);
      setNewCustomItem("");
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error("Error creating trip:", error);
      toast({
        title: "Error",
        description: "Failed to create trip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle>Create New Trip</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="relative">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details">Trip Details</TabsTrigger>
              <TabsTrigger value="items">Shopping List</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-3 mt-0">
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-sm font-medium">Store*</Label>
                  <div className="relative">
                    <Input
                      ref={locationInputRef}
                      placeholder="Search for a store"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pr-8 h-9"
                      autoComplete="off"
                    />
                    {location && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocation('');
                          setCoordinates(undefined);
                          if (locationInputRef.current) {
                            locationInputRef.current.focus();
                          }
                        }}
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <MapPin className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className="text-sm font-medium">Date*</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal h-9",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "MMM dd") : "Pick date"}
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

                  <div className="grid gap-1.5">
                    <Label htmlFor="time" className="text-sm font-medium">Time*</Label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="eta" className="text-sm font-medium">Duration</Label>
                    <Select value={eta} onValueChange={setEta}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15 min">15 min</SelectItem>
                        <SelectItem value="30 min">30 min</SelectItem>
                        <SelectItem value="45 min">45 min</SelectItem>
                        <SelectItem value="1 hour">1 hour</SelectItem>
                        <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                        <SelectItem value="2 hours">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="budget" className="text-sm font-medium">Budget</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="$0.00"
                      min="0"
                      step="0.01"
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this trip"
                    className="h-9"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-3 mt-0">
              <div className="space-y-3">
                {/* Selected Items Summary */}
                {(selectedPantryItems.size > 0 || customItems.length > 0) && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                        <ShoppingCart className="h-4 w-4" />
                        Selected Items ({selectedPantryItems.size + customItems.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1">
                        {Array.from(selectedPantryItems).map(itemId => {
                          const item = pantryItems.find(p => p.id === itemId);
                          return item ? (
                            <Badge key={itemId} variant="secondary" className="text-xs">
                              {item.name}
                              <button
                                type="button"
                                onClick={() => handlePantryItemToggle(itemId)}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                        {customItems.map(item => (
                          <Badge key={item} variant="outline" className="text-xs">
                            {item}
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomItem(item)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Add Custom Item */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Add Custom Item</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter item name"
                        value={newCustomItem}
                        onChange={(e) => setNewCustomItem(e.target.value)}
                        onKeyPress={handleCustomItemKeyPress}
                        className="h-8 text-sm"
                      />
                      <Button
                        type="button"
                        onClick={handleAddCustomItem}
                        size="sm"
                        disabled={!newCustomItem.trim()}
                        className="h-8 px-3"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Pantry Items by Category */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Add from Pantry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {Object.entries(pantryItemsByCategory).map(([category, items]) => (
                      <div key={category}>
                        <h4 className="font-medium text-xs mb-1.5 text-gray-700 uppercase tracking-wide">{category}</h4>
                        <div className="space-y-1.5">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center space-x-2 py-1">
                              <Checkbox
                                id={item.id}
                                checked={selectedPantryItems.has(item.id)}
                                onCheckedChange={() => handlePantryItemToggle(item.id)}
                                className="h-4 w-4"
                              />
                              <Label
                                htmlFor={item.id}
                                className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between"
                              >
                                <span className="flex items-center gap-2">
                                  {item.name}
                                  {item.lowStock && (
                                    <Badge variant="destructive" className="text-xs px-1 py-0">
                                      Low
                                    </Badge>
                                  )}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Qty: {item.quantity}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {Object.keys(pantryItemsByCategory).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-6">
                        No items in pantry. Add items to your pantry first!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4 pt-3 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="h-9">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="h-9">
              {isLoading ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 