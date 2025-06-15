import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MapPin, 
  Users, 
  Plus, 
  Trash2, 
  Check, 
  ShoppingCart, 
  Calendar,
  DollarSign,
  Star,
  Package,
  Edit,
  Share2,
  BarChart3,
  Download,
  MessageCircle,
  Clock,
  Navigation,
  Mic,
  Scan,
  X,
  AlertTriangle,
  Crown,
  Camera,
  Zap,
  BookOpen,
  Search,
  UserPlus,
  CheckCircle,
  AlertCircle,
  SplitSquareVertical,
  Sparkles,
  BarChart2,
  ListPlus,
  Store
} from "lucide-react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/context/TaskContext";
import { usePantry, PantryItem } from "@/context/PantryContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BarcodeScannerButton from "./BarcodeScannerButton";
import BarcodeItemAdder from "./BarcodeItemAdder";
import TripBarcodeAdder from "./TripBarcodeAdder";
import PriceInput from "./PriceInput";
import UnitSelector from "./UnitSelector";
import SmartListParser from "./SmartListParser";
import ItemSplitSelector from "./ItemSplitSelector";
import BarcodeProductSaveDialog from "./BarcodeProductSaveDialog";
import DuplicateItemDialog from "./DuplicateItemDialog";
import ReceiptScannerButton from "./ReceiptScannerButton";
import ExportButton from "./ExportButton";
import PriceRecommendationsPanel from "./PriceRecommendation";
import CostSplitSummary from "./CostSplitSummary";
import AutocompleteInput from "./AutocompleteInput";
import { guessUnitForItem, formatValueWithUnit } from "@/services/UnitConversionService";
import { calculateNextDueDate, RecurrenceFrequency } from "@/services/RecurrenceService";
import { recordPrice } from "@/services/PriceHistoryService";
import { findProductByBarcode, Product } from "@/services/ProductService";
import { detectDuplicateOrSimilar, ItemSuggestion } from "@/services/DuplicateDetectionService";
import { fruits } from "@/data/fruits";
import { vegetables } from "@/data/vegetables";

// Add success variant to BadgeProps
declare module "@/components/ui/badge" {
  interface BadgeProps {
    variant?: "default" | "destructive" | "secondary" | "outline" | "success";
  }
}

export interface TripItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  price?: number;
  checked: boolean;
  isRecurring?: boolean;
  recurrenceFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | null;
  nextDueDate?: string;
  baseItemId?: string;
  lastAddedToTripDate?: string;
  addedBy: {
    name: string;
    avatar: string;
  };
}

export interface TripParticipant {
  id: string;
  name: string;
  avatar: string; // Required for CostSplitSummary
}

export interface TripShopper {
  name: string;
  avatar: string;  // Make avatar required to match TripCard expectations
}

export interface TripData {
  id: string;
  store: string;
  date: string;
  eta: string;
  status: 'open' | 'shopping' | 'completed' | 'cancelled';
  items: TripItem[];
  participants: TripParticipant[];
  shopper: TripShopper;
}

type RecurrenceFrequencyType = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | undefined;

type TripDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  trip: TripData | null;
  onAddItem: (tripId: string, item: Omit<TripItem, 'id'>) => void;
  onRemoveItem: (tripId: string, itemId: string) => void;
  onToggleItemCheck: (tripId: string, itemId: string) => void;
  onInviteParticipant: (tripId: string) => void;
  onCompleteTrip: (tripId: string) => void;
  onReactivateTrip?: (tripId: string) => void;
  onUpdateItemPrice?: (tripId: string, itemId: string, price: number) => void;
  onSettleUp?: (amount: number, toUserId: string, fromUserId: string) => void;
  onUpdateItemUnit?: (tripId: string, itemId: string, unit: string, newQuantity?: number) => void;
};

// Add unit definitions
const units = [
  { id: 'ea', name: 'Each' },
  { id: 'kg', name: 'Kilograms' },
  { id: 'g', name: 'Grams' },
  { id: 'lb', name: 'Pounds' },
  { id: 'oz', name: 'Ounces' },
  { id: 'l', name: 'Liters' },
  { id: 'ml', name: 'Milliliters' },
  { id: 'pkg', name: 'Package' },
  { id: 'box', name: 'Box' },
  { id: 'can', name: 'Can' },
  { id: 'bottle', name: 'Bottle' }
];

// Add recurrence frequency definitions
const recurrenceFrequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const TripDetailModal = ({ 
  isOpen, 
  onClose, 
  trip, 
  onAddItem, 
  onRemoveItem, 
  onToggleItemCheck,
  onInviteParticipant,
  onCompleteTrip,
  onReactivateTrip,
  onUpdateItemPrice,
  onSettleUp,
  onUpdateItemUnit,
}: TripDetailModalProps) => {
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState<number | undefined>(undefined);
  const [newItemUnit, setNewItemUnit] = useState<string>("ea");
  const [activeTab, setActiveTab] = useState("items");
  const [showSaveProductDialog, setShowSaveProductDialog] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [duplicateSuggestion, setDuplicateSuggestion] = useState<ItemSuggestion | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingItem, setPendingItem] = useState<Omit<TripItem, 'id'> | null>(null);
  const [newItemIsRecurring, setNewItemIsRecurring] = useState(false);
  const [newItemRecurrenceFrequency, setNewItemRecurrenceFrequency] = useState<RecurrenceFrequencyType>(undefined);
  const [showSmartParser, setShowSmartParser] = useState(false);
  const { pantryItems } = usePantry();
  const [pantrySearchQuery, setPantrySearchQuery] = useState("");
  const { toast } = useToast();
  
  const suggestions = useMemo(() => {
    const pantryNames = pantryItems.map(item => item.name);
    return Array.from(new Set([...fruits, ...vegetables, ...pantryNames]));
  }, [pantryItems]);
  
  // Reset form when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setNewItemName("");
      setNewItemQuantity(1);
      setNewItemPrice(undefined);
      setNewItemUnit("ea");
      setNewItemIsRecurring(false);
      setNewItemRecurrenceFrequency(undefined);
      setActiveTab("items");
    }
  }, [isOpen]);
  
  // Update unit when item name changes
  useEffect(() => {
    if (newItemName.trim()) {
      const suggestedUnit = guessUnitForItem(newItemName);
      setNewItemUnit(suggestedUnit.id);
    }
  }, [newItemName]);
  
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trip) return;
    
    if (!newItemName.trim()) {
      return;
    }
    
    let initialNextDueDate: string | undefined = undefined;
    if (newItemIsRecurring && newItemRecurrenceFrequency) {
      initialNextDueDate = calculateNextDueDate(new Date(), newItemRecurrenceFrequency as RecurrenceFrequency);
    }

    const newItem: Omit<TripItem, 'id'> = {
      name: newItemName,
      quantity: newItemQuantity,
      price: newItemPrice,
      unit: newItemUnit,
      checked: false,
      addedBy: {
        name: "You",
        avatar: "https://example.com/you.jpg"
      },
      isRecurring: newItemIsRecurring,
      recurrenceFrequency: newItemIsRecurring ? newItemRecurrenceFrequency : undefined
    };
    
    // Check for duplicates before adding
    const suggestion = detectDuplicateOrSimilar(newItemName, trip.items);
    
    if (suggestion) {
      // Found a duplicate or similar item
      setDuplicateSuggestion(suggestion);
      setShowDuplicateDialog(true);
      setPendingItem(newItem);
      return;
    }
    
    // No duplicates, proceed with adding
    addItemToTrip(newItem);
  };
  
  // New function to finalize adding an item
  const addItemToTrip = (itemToAdd: Omit<TripItem, 'id'>) => {
    if (!trip) return;
    
    // Call the parent component's onAddItem function
    onAddItem(trip.id, itemToAdd);
    
    // Record price in history if provided
    if (itemToAdd.price) {
      recordPrice(itemToAdd.name, itemToAdd.price, trip.store, itemToAdd.quantity);
    }
    
    // Reset form
    setNewItemName("");
    setNewItemQuantity(1);
    setNewItemPrice(undefined);
    setNewItemUnit("ea");
    setNewItemIsRecurring(false);
    setNewItemRecurrenceFrequency(undefined);
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Provide user feedback
    toast({
      title: "Item Added",
      description: `"${itemToAdd.name}" has been added to the trip.`,
    });
  };
  
  // Handle adding item anyway (ignoring duplicate warning)
  const handleAddAnyway = () => {
    if (pendingItem) {
      addItemToTrip(pendingItem);
      setPendingItem(null);
    }
  };
  
  // Handle merging with existing item (increase quantity)
  const handleMergeItems = (existingItem: TripItem, increaseBy: number) => {
    if (!trip) return;
    
    // Update the existing item by increasing its quantity
    const updatedItems = trip.items.map(item => {
      if (item.id === existingItem.id) {
        return {
          ...item,
          quantity: item.quantity + increaseBy
        };
      }
      return item;
    });
    
    // Reset form
    setNewItemName("");
    setNewItemQuantity(1);
    setNewItemPrice(undefined);
    setPendingItem(null);
  };
  
  // Handle updating existing item (for similar items)
  const handleUpdateExisting = (existingItem: TripItem) => {
    // Set the form to edit the existing item
    setNewItemName(existingItem.name);
    setNewItemQuantity(existingItem.quantity);
    setNewItemPrice(existingItem.price);
    setPendingItem(null);
  };
  
  const handleItemPriceChange = (itemId: string, price: number) => {
    if (!trip || !onUpdateItemPrice) return;
    
    onUpdateItemPrice(trip.id, itemId, price);
    
    // Find the item to record its price in history
    const item = trip.items.find(i => i.id === itemId);
    if (item) {
      recordPrice(item.name, price, trip.store, item.quantity);
    }
  };
  
  const handleItemUnitChange = (itemId: string, unit: string, newQuantity?: number) => {
    if (!trip || !onUpdateItemUnit) return;
    
    // Find the item
    const item = trip.items.find(i => i.id === itemId);
    if (!item) return;
    
    // Update the trip with the unit change
    onUpdateItemUnit(trip.id, itemId, unit, newQuantity);
  };
  
  const handleSplitUpdate = () => {
    // Refresh the cost split summary
    setActiveTab("splits");
  };
  
  // Add new function to handle barcode scan results
  const handleBarcodeScan = (barcode: string) => {
    if (!trip) return;
    
    // Look up the product in our database
    const product = findProductByBarcode(barcode);
    
    if (product) {
      // Product found in database
      setNewItemName(product.name);
      setNewItemPrice(product.defaultPrice);
      
      // Set unit if available
      if (product.unit) {
        setNewItemUnit(product.unit);
      } else {
        // Otherwise guess based on name
        const suggestedUnit = guessUnitForItem(product.name);
        setNewItemUnit(suggestedUnit.id);
      }
    } else {
      // Product not found - just use the barcode as the name for now
      setNewItemName(`Item (${barcode})`);
      
      // Save the barcode and show the save dialog
      setScannedBarcode(barcode);
      setShowSaveProductDialog(true);
    }
  };
  
  // Handle when user saves a product from the dialog
  const handleProductSave = (product: Product) => {
    // Update the form with the product info
    setNewItemName(product.name);
    if (product.defaultPrice) {
      setNewItemPrice(product.defaultPrice);
    }
    
    // Add the item with the current user's info
    const newItem: Omit<TripItem, "id"> = {
      name: product.name,
      quantity: 1,
      price: product.defaultPrice,
      unit: product.unit || 'ea',
      checked: false,
      addedBy: {
        name: "You",
        avatar: "https://example.com/you.jpg"
      },
      isRecurring: false,
      recurrenceFrequency: undefined
    };
    
    if (!trip) return;
    onAddItem(trip.id, newItem);
    
    // Reset form
    setNewItemName("");
    setNewItemQuantity(1);
    setNewItemPrice(undefined);
    setNewItemUnit("ea");
    setShowSaveProductDialog(false);
  };
  
  const handleAddItemsFromParser = (items: Omit<TripItem, 'id'>[]) => {
    if (!trip) return;
    
    console.log("Received items from parser:", items);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    // Process each item and add to trip if not a duplicate
    if (items.length === 0) {
      return;
    }
    
    // Create an array to batch-add all non-duplicate items
    const newItems: Omit<TripItem, 'id'>[] = [];
    
    // Check each item for duplicates
    items.forEach(item => {
      // Check for duplicates
      const isDuplicate = trip.items.some(
        existingItem => existingItem.name.toLowerCase() === item.name.toLowerCase()
      );
      
      if (!isDuplicate) {
        // Add to our batch array
        newItems.push(item);
        addedCount++;
      } else {
        skippedCount++;
      }
    });
    
    // Add all new items in one batch if we have any
    if (newItems.length > 0) {
      console.log("Adding non-duplicate items to trip:", newItems);
      newItems.forEach(item => {
        onAddItem(trip.id, item);
      });
    }
  };
  
  const handleAddItemFromPantry = (pantryItem: PantryItem) => {
    if (!trip) return;

    // Check if item already exists in trip
    const existingItem = trip.items.find(item => 
      item.name.toLowerCase() === pantryItem.name.toLowerCase()
    );

    if (existingItem) {
      // Item already exists, show warning toast
      toast({
        title: "Item Already Added",
        description: `"${pantryItem.name}" is already in this trip.`,
        variant: "destructive",
      });
      return;
    }

    const newItem: Omit<TripItem, 'id'> = {
      name: pantryItem.name,
      quantity: 1, // Default quantity when adding from pantry
      unit: 'ea', // Default unit
      checked: false,
      addedBy: {
        name: "You",
        avatar: "https://example.com/you.jpg"
      },
    };

    // Call the parent component's onAddItem function directly
    onAddItem(trip.id, newItem);
    
    // Provide user feedback with toast
    toast({
      title: "Added from Pantry",
      description: `"${pantryItem.name}" has been added to your trip.`,
    });
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };
  
  if (!trip) return null;
  
  const isUserShopper = trip.shopper ? trip.shopper.name === "You" : false; // TODO: Compare with actual authenticated user ID
  
  // Calculate total price of items
  const totalPrice = trip.items.reduce((sum, item) => {
    return sum + (item.price || 0);
  }, 0);
  
  // Ensure participants have avatars for CostSplitSummary
  const participantsWithAvatars = trip.participants.map(p => ({
    ...p,
    avatar: p.avatar || `https://api.dicebear.com/7.x/avatars/svg?seed=${p.id}`
  })) || [];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <DialogHeader className="animate-fade-in">
          <DialogTitle className="flex items-center gap-2">
            <Store /> {trip.store}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 animate-slide-up">
          <TabsList className="dark:bg-slate-800">
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="pantry">Add from Pantry</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="cost">Cost Split</TabsTrigger>
          </TabsList>
          <TabsContent value="items" className="mt-4">
            <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/50 dark:via-indigo-900/50 dark:to-purple-900/50 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700/50 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add new item form */}
                <div className="animate-slide-in">
                  <h3 className="text-lg font-medium dark:text-slate-200 mb-4">Add Item</h3>
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="dark:text-slate-300">Item Name</Label>
                        <AutocompleteInput
                          suggestions={suggestions}
                          value={newItemName}
                          onChange={setNewItemName}
                          onSelect={setNewItemName}
                          placeholder="Enter item name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity" className="dark:text-slate-300">Quantity</Label>
                        <div className="flex gap-2">
                          <Input
                            id="quantity"
                            type="number"
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                            min={1}
                            className="w-24 dark:bg-slate-800 dark:border-slate-700"
                          />
                          <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                            <SelectTrigger className="w-24 dark:bg-slate-800 dark:border-slate-700">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                              {units.map(unit => (
                                <SelectItem key={unit.id} value={unit.id}>
                                  {unit.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price" className="dark:text-slate-300">Price (optional)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newItemPrice || ''}
                          onChange={(e) => setNewItemPrice(Number(e.target.value))}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="recurring"
                        checked={newItemIsRecurring}
                        onCheckedChange={(checked) => setNewItemIsRecurring(checked as boolean)}
                      />
                      <Label htmlFor="recurring" className="dark:text-slate-300">Add to recurring items</Label>
                    </div>
                    {newItemIsRecurring && (
                      <div className="space-y-2 animate-fade-in">
                        <Label htmlFor="frequency" className="dark:text-slate-300">Recurrence Frequency</Label>
                        <Select
                          value={newItemRecurrenceFrequency || ''}
                          onValueChange={(value) => setNewItemRecurrenceFrequency(value as RecurrenceFrequencyType)}
                        >
                          <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                            {recurrenceFrequencies.map(freq => (
                              <SelectItem key={freq.value} value={freq.value}>
                                {freq.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowSmartParser(true)} className="hover:scale-105 transition-transform duration-200 dark:border-slate-600 dark:text-slate-300">
                        <ListPlus className="h-4 w-4 mr-2" />
                        Smart Add
                      </Button>
                      <Button type="submit" className="hover:scale-105 transition-transform duration-200">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="pantry" className="mt-4">
            <div className="bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 dark:from-emerald-900/50 dark:via-green-900/50 dark:to-teal-900/50 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-700/50 shadow-lg">
              <h3 className="text-lg font-medium dark:text-slate-200 mb-4">Add from Pantry</h3>
              <Input
                type="search"
                placeholder="Search pantry items..."
                value={pantrySearchQuery}
                onChange={(e) => setPantrySearchQuery(e.target.value)}
                className="mb-4 dark:bg-slate-800 dark:border-slate-700"
              />
              <div className="max-h-[60vh] overflow-y-auto">
                {(() => {
                  const availablePantryItems = pantryItems.filter(pItem => 
                    pItem.name.toLowerCase().includes(pantrySearchQuery.toLowerCase()) &&
                    !trip.items.some(tItem => tItem.name.toLowerCase() === pItem.name.toLowerCase())
                  );

                  if (pantryItems.length === 0) {
                    return (
                      <div className="text-center py-8 animate-fade-in">
                        <Package className="h-12 w-12 mx-auto text-emerald-400 dark:text-emerald-500 mb-4" />
                        <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Pantry Items</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          You don't have any items in your pantry yet.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => window.open('/pantry', '_blank')}
                          className="hover:scale-105 transition-transform duration-200"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Items to Pantry
                        </Button>
                      </div>
                    );
                  }

                  if (availablePantryItems.length === 0) {
                    return (
                      <div className="text-center py-8 animate-fade-in">
                        <Search className="h-12 w-12 mx-auto text-emerald-400 dark:text-emerald-500 mb-4" />
                        <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {pantrySearchQuery ? 'No Matching Items' : 'All Items Already Added'}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          {pantrySearchQuery 
                            ? `No pantry items match "${pantrySearchQuery}"`
                            : 'All your pantry items are already in this trip'
                          }
                        </p>
                        {pantrySearchQuery && (
                          <Button 
                            variant="outline" 
                            onClick={() => setPantrySearchQuery('')}
                            className="hover:scale-105 transition-transform duration-200"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear Search
                          </Button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {availablePantryItems.map((pantryItem, index) => (
                        <div 
                          key={pantryItem.id} 
                          className="flex items-center justify-between p-3 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg border border-emerald-200/50 dark:border-emerald-700/30 transition-all duration-200 animate-slide-in"
                          style={{animationDelay: `${index * 50}ms`}}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-slate-800 dark:text-slate-200">{pantryItem.name}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                In stock: <span className="font-medium">{pantryItem.quantity}</span>
                              </p>
                              {pantryItem.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {pantryItem.category}
                                </Badge>
                              )}
                              {pantryItem.lowStock && (
                                <Badge variant="destructive" className="text-xs">
                                  Low Stock
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddItemFromPantry(pantryItem)}
                            className="hover:scale-105 transition-transform duration-200 border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-600 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20"
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="details" className="mt-4">
            <div className="bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 dark:from-amber-900/50 dark:via-orange-900/50 dark:to-red-900/50 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-700/50 shadow-lg">
              <h3 className="text-lg font-medium dark:text-slate-200 mb-4">Trip Details</h3>
              {/* Details Content */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Store</Label>
                    <p className="text-lg font-semibold">{trip.store}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant={trip.status === 'completed' ? 'success' : 'default'} className="ml-2">
                      {trip.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                    <p className="text-lg">{format(new Date(trip.date), 'PPP')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ETA</Label>
                    <p className="text-lg">{trip.eta}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="cost" className="mt-4">
            <div className="bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 dark:from-violet-900/50 dark:via-purple-900/50 dark:to-fuchsia-900/50 rounded-xl p-6 border-2 border-violet-200 dark:border-violet-700/50 shadow-lg">
              <h3 className="text-lg font-medium dark:text-slate-200 mb-4">Cost Split</h3>
              <CostSplitSummary items={trip.items} participants={trip.participants} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      {/* Product Save Dialog */}
      <BarcodeProductSaveDialog
        isOpen={showSaveProductDialog}
        onClose={() => setShowSaveProductDialog(false)}
        barcode={scannedBarcode}
        onSave={handleProductSave}
      />
      
      {/* Duplicate Item Dialog */}
      <DuplicateItemDialog
        isOpen={showDuplicateDialog}
        onClose={() => setShowDuplicateDialog(false)}
        suggestion={duplicateSuggestion}
        onAddAnyway={handleAddAnyway}
        onMergeItems={handleMergeItems}
        onUpdate={handleUpdateExisting}
      />
      
      {/* Smart List Parser */}
      <SmartListParser
        isOpen={showSmartParser}
        onClose={() => setShowSmartParser(false)}
        onAddItems={handleAddItemsFromParser}
      />
    </Dialog>
  );
};

export default TripDetailModal;
