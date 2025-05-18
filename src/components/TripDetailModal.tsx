import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Clock, 
  Plus, 
  Trash2, 
  UserPlus, 
  Share2, 
  CheckCircle,
  AlertCircle,
  Check,
  DollarSign,
  SplitSquareVertical,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import PriceInput from "./PriceInput";
import { recordPrice } from "@/services/PriceHistoryService";
import ItemSplitSelector from "./ItemSplitSelector";
import CostSplitSummary from "./CostSplitSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BarcodeScannerButton from "./BarcodeScannerButton";
import BarcodeItemAdder from "./BarcodeItemAdder";
import { findProductByBarcode, Product } from "@/services/ProductService";
import BarcodeProductSaveDialog from "./BarcodeProductSaveDialog";
import { detectDuplicateOrSimilar, ItemSuggestion } from "@/services/DuplicateDetectionService";
import DuplicateItemDialog from "./DuplicateItemDialog";
import UnitSelector from "./UnitSelector";
import { guessUnitForItem, formatValueWithUnit } from "@/services/UnitConversionService";
import { useTaskContext } from "@/context/TaskContext";
import ReceiptScannerButton from "./ReceiptScannerButton";
import { groceryCategories, suggestCategoryForItem, categoriesMap } from "@/services/CategoryService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { calculateNextDueDate, RecurrenceFrequency } from "@/services/RecurrenceService";
import ExportButton from "./ExportButton";
import SmartListParser from "./SmartListParser";

// Types for trip data
export type TripItem = {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  unit?: string; // Unit ID (e.g., 'kg', 'lb', 'ea')
  category?: string;
  addedBy: {
    name: string;
    avatar: string;
  };
  checked: boolean;
  isRecurring?: boolean;
  recurrenceFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | null;
  nextDueDate?: string;
  baseItemId?: string; 
  lastAddedToTripDate?: string;
};

export interface TripData {
  id: string;
  store: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  eta: string;
  status: 'open' | 'shopping' | 'completed' | 'cancelled';
  items: TripItem[];
  participants: {
    id: string;
    name: string;
    avatar: string;
  }[];
  shopper?: {
    name: string;
    avatar: string;
  };
  date: string; // ISO string format
}

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
  onUpdateItemUnit
}: TripDetailModalProps) => {
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState<number | undefined>(undefined);
  const [newItemUnit, setNewItemUnit] = useState<string>("ea");
  const [newItemCategory, setNewItemCategory] = useState<string>('other');
  const [activeTab, setActiveTab] = useState("items");
  const [showSaveProductDialog, setShowSaveProductDialog] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [duplicateSuggestion, setDuplicateSuggestion] = useState<ItemSuggestion | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingItem, setPendingItem] = useState<Omit<TripItem, 'id'> | null>(null);
  const [newItemIsRecurring, setNewItemIsRecurring] = useState(false);
  const [newItemRecurrenceFrequency, setNewItemRecurrenceFrequency] = useState<'daily' | 'weekly' | 'bi-weekly' | 'monthly' | null>(null);
  const [showSmartParser, setShowSmartParser] = useState(false);
  const { toast } = useToast();
  
  // Reset form when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setNewItemName("");
      setNewItemQuantity(1);
      setNewItemPrice(undefined);
      setNewItemUnit("ea");
      setNewItemCategory('other');
      setNewItemIsRecurring(false);
      setNewItemRecurrenceFrequency(null);
      setActiveTab("items");
    }
  }, [isOpen]);
  
  // Update unit and category when item name changes
  useEffect(() => {
    if (newItemName.trim()) {
      const suggestedUnit = guessUnitForItem(newItemName);
      setNewItemUnit(suggestedUnit.id);
      const suggestedCategory = suggestCategoryForItem(newItemName);
      setNewItemCategory(suggestedCategory);
    }
  }, [newItemName]);
  
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trip) return;
    
    if (!newItemName.trim()) {
      toast({
        title: "Item Name Required",
        description: "Please enter a name for the item.",
        variant: "destructive",
      });
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
      category: newItemCategory,
      addedBy: {
        name: "You",
        avatar: "https://example.com/you.jpg"
      },
      checked: false,
      isRecurring: newItemIsRecurring,
      recurrenceFrequency: newItemIsRecurring ? newItemRecurrenceFrequency : null,
      nextDueDate: initialNextDueDate,
      baseItemId: newItemIsRecurring ? Date.now().toString() + '-base' : undefined,
      lastAddedToTripDate: newItemIsRecurring ? new Date().toISOString() : undefined,
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
    setNewItemCategory('other');
    setNewItemIsRecurring(false);
    setNewItemRecurrenceFrequency(null);
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Show success toast
    toast({
      title: "Item Added",
      description: `${itemToAdd.name} has been added to your trip.`
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
  };
  
  // Add new function to handle receipt scan results
  const handleReceiptScan = (items: { name: string; price: number; quantity: number }[]) => {
    if (!trip) return;
    
    // Add each item from the receipt
    items.forEach(item => {
      const newItem = {
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unit: "ea", // Default unit
        category: 'other',
        addedBy: {
          name: "You",
          avatar: "https://example.com/you.jpg"
        },
        checked: false
      };
      
      // Check for duplicates before adding
      const suggestion = detectDuplicateOrSimilar(item.name, trip.items);
      
      if (suggestion) {
        // Found a duplicate or similar item
        setDuplicateSuggestion(suggestion);
        setShowDuplicateDialog(true);
        setPendingItem(newItem);
      } else {
        // No duplicates, proceed with adding
        addItemToTrip(newItem);
      }
    });
  };
  
  const handleAddItemsFromParser = (items: Omit<TripItem, 'id'>[]) => {
    if (!trip) return;
    
    console.log("Received items from parser:", items);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    // Process each item and add to trip if not a duplicate
    if (items.length === 0) {
      toast({
        title: "No items to add",
        description: "No items were received from the parser.",
        variant: "destructive"
      });
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
    
    toast({
      title: `${addedCount} items added`,
      description: skippedCount > 0 
        ? `Added ${addedCount} items. ${skippedCount} items were skipped because they already exist in the trip.` 
        : `Added ${addedCount} items to your trip.`
    });
  };
  
  if (!trip) return null;
  
  const isUserShopper = trip.shopper ? trip.shopper.name === "You" : false; // TODO: Compare with actual authenticated user ID
  const uncheckedItems = trip.items.filter(item => !item.checked);
  const checkedItems = trip.items.filter(item => item.checked);
  
  // Calculate total price of items
  const totalPrice = trip.items.reduce((sum, item) => {
    return sum + (item.price || 0);
  }, 0);
  
  return (
    <>
      <Dialog 
        open={isOpen} 
        onOpenChange={onClose}
        modal={true}
      >
        <DialogContent 
          className="sm:max-w-md premium-card"
          style={{ 
            position: 'fixed', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            maxHeight: '85vh', /* Slightly reduced to ensure it doesn't touch screen edges */
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--padding, 1.5rem)',
            width: 'calc(100% - 2rem)' /* Ensure margin on smaller screens */
          }}
        >
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={cn(
                "capitalize flex items-center text-xs",
                trip.status === 'open' ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800" :
                trip.status === 'shopping' ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800" :
                trip.status === 'completed' ? "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800" :
                "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
              )}>
                {trip.status === 'open' && <Clock className="h-3 w-3 mr-1" />}
                {trip.status === 'shopping' && <ShoppingCart className="h-3 w-3 mr-1" />}
                {trip.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                {trip.status === 'cancelled' && <AlertCircle className="h-3 w-3 mr-1" />}
                {trip.status}
              </Badge>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => onInviteParticipant(trip.id)}
                >
                  <UserPlus className="h-4 w-4 text-gloop-primary" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 flex-shrink-0"
                >
                  <Share2 className="h-4 w-4 text-gloop-primary" />
                </Button>
                
                <ExportButton 
                  trip={trip}
                  size="sm"
                  variant="ghost"
                  label=""
                  className="h-8 w-8 p-0 flex-shrink-0"
                />
              </div>
            </div>
            
            <DialogTitle className="text-xl flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-gloop-primary" />
              Trip to {trip.store}
            </DialogTitle>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6 border-2 border-white dark:border-gloop-dark-surface">
                  <AvatarImage src={trip.shopper?.avatar} />
                  <AvatarFallback className="bg-gloop-primary text-white text-xs">
                    {trip.shopper?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gloop-text-muted">
                  Shopper: <span className="font-medium text-gloop-text-main dark:text-gloop-dark-text-main">{trip.shopper?.name}</span>
                </span>
              </div>
              
              <div className="text-sm text-gloop-text-muted flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                ETA: {trip.eta}
              </div>
            </div>
            
            {/* Participants row - updated to prevent overlapping */}
            {trip.participants.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gloop-text-muted mb-1">Participants:</p>
                <div className="flex flex-wrap gap-2">
                  {trip.participants.map((participant, index) => (
                    <div key={index} className="flex items-center bg-gloop-accent/50 dark:bg-gloop-dark-accent/50 rounded-full pl-1 pr-2 py-0.5">
                      <Avatar className="h-5 w-5 mr-1">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="bg-gloop-primary text-white text-[10px]">
                          {participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{participant.name}</span>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 rounded-full px-2 text-xs flex items-center gap-1"
                    onClick={() => onInviteParticipant(trip.id)}
                  >
                    <UserPlus className="h-3 w-3" />
                    Add
                  </Button>
                </div>
              </div>
            )}
            
            {/* Total price display */}
            {totalPrice > 0 && (
              <div className="mt-2 flex items-center justify-end">
                <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full flex items-center">
                  <DollarSign className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Total: ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </DialogHeader>
          
          {/* Tabs for items and cost splitting */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="flex w-full premium-card">
              <TabsTrigger value="items" className="flex-1 flex items-center gap-1">
                <ShoppingCart className="h-3.5 w-3.5" />
                Items
              </TabsTrigger>
              <TabsTrigger value="splits" className="flex-1 flex items-center gap-1">
                <SplitSquareVertical className="h-3.5 w-3.5" />
                Cost Split
              </TabsTrigger>
            </TabsList>
            
            {/* Items tab content */}
            <TabsContent value="items" className="space-y-2 mt-4 overflow-y-auto pb-16">
              {/* Add item form */}
              {(trip.status === 'open' || trip.status === 'shopping') && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                  <h3 className="font-medium mb-2">Add Item</h3>
                  <form onSubmit={handleAddItem}>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Item name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="flex-1"
                      />
                      <div className="flex gap-2 flex-shrink-0">
                        {/* Lazy load barcode scanner when button is clicked to prevent automatic camera activation */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <BarcodeScannerButton
                            onScan={handleBarcodeScan}
                            buttonText=""
                            buttonSize="icon"
                            className="h-10 w-10"
                          />
                        </div>
                        
                        {/* Lazy load receipt scanner when button is clicked to prevent automatic camera activation */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <ReceiptScannerButton
                            onScan={handleReceiptScan}
                            buttonText=""
                            buttonSize="icon"
                            className="h-10 w-10"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Add improved barcode scanner with product lookup */}
                    <div className="mb-3">
                      <BarcodeItemAdder
                        tripId={trip.id}
                        onAddItem={onAddItem}
                      />
                    </div>
                    
                    {/* Quantity and Price Row */}
                    <div className="flex flex-wrap gap-3 mb-3">
                      {/* Quantity Input with Unit Selector */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor="quantity" className="text-sm whitespace-nowrap">Quantity:</Label>
                        <div className="flex">
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            step="1"
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                            className="w-16 rounded-r-none"
                          />
                          <UnitSelector
                            itemName={newItemName}
                            quantity={newItemQuantity}
                            unit={newItemUnit}
                            onUnitChange={setNewItemUnit}
                            onQuantityChange={setNewItemQuantity}
                            className="h-10 rounded-l-none border-l-0"
                            compact={true}
                          />
                        </div>
                      </div>
                      
                      {/* Price Input */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor="price" className="text-sm whitespace-nowrap">Price:</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            id="price"
                            type="number"
                            min="0.00"
                            step="0.01"
                            placeholder="0.00"
                            value={newItemPrice === undefined ? '' : newItemPrice}
                            onChange={(e) => setNewItemPrice(e.target.value === '' ? undefined : Number(e.target.value))}
                            className="pl-7 w-24"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Category Selector */}
                    <div className="mb-3">
                      <Label htmlFor="category" className="text-sm">Category:</Label>
                      <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                        <SelectTrigger id="category" className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {groceryCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Recurrence Options - Added */}
                    <div className="mb-3 space-y-3 p-3 border rounded-md bg-muted/30 dark:bg-gloop-dark-surface/30">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="isRecurring" className="text-sm flex-grow">Make this item recurring?</Label>
                        <Switch
                          id="isRecurring"
                          checked={newItemIsRecurring}
                          onCheckedChange={setNewItemIsRecurring}
                        />
                      </div>
                      {newItemIsRecurring && (
                        <div>
                          <Label htmlFor="recurrenceFrequency" className="text-xs text-gloop-text-muted">How often?</Label>
                          <Select 
                            value={newItemRecurrenceFrequency || ''} 
                            onValueChange={(value) => setNewItemRecurrenceFrequency(value as 'daily' | 'weekly' | 'bi-weekly' | 'monthly')}
                          >
                            <SelectTrigger id="recurrenceFrequency" className="w-full mt-1">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="bi-weekly">Bi-weekly (Every 2 weeks)</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" size="sm" className="px-4">
                        Add Item
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              
              {uncheckedItems.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2">Items to get ({uncheckedItems.length})</h3>
                  <div className="space-y-1">
                    {uncheckedItems.map(item => (
                      <div key={item.id} className="p-2 bg-background dark:bg-gloop-dark-surface/50 rounded-md">
                        <div className="flex items-center">
                          <div 
                            className={`flex-shrink-0 w-5 h-5 rounded-md border cursor-pointer flex items-center justify-center transition-all duration-200 ${
                              item.checked ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700' : 'border-gray-300 dark:border-gray-700'
                            }`}
                            onClick={(e) => {
                              // Add haptic feedback for better user experience
                              if (navigator.vibrate) {
                                navigator.vibrate(25);
                              }
                              
                              if (trip) {
                                // Call the toggle function with both tripId and itemId
                                onToggleItemCheck(trip.id, item.id);
                              }
                            }}
                          >
                            {item.checked && <Check className="h-3 w-3 text-green-600 dark:text-green-400 transition-transform duration-200 transform scale-100" />}
                          </div>
                          <div className="flex-1 ml-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{item.name}</span>
                              <PriceInput 
                                itemName={item.name} 
                                value={item.price} 
                                onChange={(newPrice) => handleItemPriceChange(item.id, newPrice)} 
                              />
                            </div>
                            <div className="text-xs text-gloop-text-muted flex items-center flex-wrap">
                              <span>{formatValueWithUnit(item.quantity, item.unit || 'ea')}</span>
                              {item.category && categoriesMap[item.category] && (
                                <><span className="mx-1">·</span><span>{categoriesMap[item.category].name}</span></>
                              )}
                              <span className="mx-1">·</span>
                              <span>Added by {item.addedBy.name}</span>
                              {item.price && <span className="mx-1">·</span>}
                              {item.price && (
                                <span className="font-semibold text-gloop-text-main dark:text-gloop-dark-text-main">
                                  ${item.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 flex-shrink-0 ml-2">
                            {/* Split button */}
                            <ItemSplitSelector
                              tripId={trip.id}
                              itemId={item.id}
                              itemName={item.name}
                              itemPrice={item.price}
                              participants={trip?.participants?.filter(p => p && p.name) || []}
                              onSplitUpdated={handleSplitUpdate}
                            />
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gloop-text-muted hover:text-red-500 flex-shrink-0"
                              onClick={(e) => {
                                // Add haptic feedback
                                if (navigator.vibrate) {
                                  navigator.vibrate(25);
                                }
                                
                                // Use animation frame for visual feedback before removal
                                const parentRow = e.currentTarget.closest('.p-2');
                                if (parentRow instanceof HTMLElement) {
                                  parentRow.style.opacity = '0.5';
                                  parentRow.style.transition = 'opacity 0.2s';
                                }
                                
                                // Call the remove function with both tripId and itemId
                                onRemoveItem(trip.id, item.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Price input for existing item */}
                        {(trip.status === 'shopping' || trip.status === 'completed') && onUpdateItemPrice && (
                          <div className="mt-3 pl-8 pt-2 border-t border-gloop-outline/30 dark:border-gloop-dark-outline/30">
                            <div className="flex flex-col gap-3">
                              <PriceInput 
                                itemName={item.name}
                                value={item.price}
                                onChange={(price) => handleItemPriceChange(item.id, price)}
                              />
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gloop-text-muted">Unit:</span>
                                <UnitSelector
                                  itemName={item.name}
                                  quantity={item.quantity}
                                  unit={item.unit}
                                  onQuantityChange={(qty) => handleItemUnitChange(item.id, item.unit || 'ea', qty)}
                                  onUnitChange={(unit) => handleItemUnitChange(item.id, unit)}
                                  showConversion={true}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {checkedItems.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-sm mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    Checked items ({checkedItems.length})
                  </h3>
                  <div className="space-y-1">
                    {checkedItems.map(item => (
                      <div key={item.id} className="p-2 bg-muted/50 dark:bg-gloop-dark-surface/20 rounded-md group">
                        <div className="flex items-center">
                          <div 
                            className="flex-shrink-0 w-5 h-5 rounded-md border cursor-pointer flex items-center justify-center transition-all duration-200 bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700"
                            onClick={(e) => {
                              // Add haptic feedback for better user experience
                              if (navigator.vibrate) {
                                navigator.vibrate(25);
                              }
                              
                              if (trip) {
                                // Call the toggle function with both tripId and itemId
                                onToggleItemCheck(trip.id, item.id);
                              }
                            }}
                          >
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400 transition-transform duration-200 transform scale-100" />
                          </div>
                          
                          <div className="ml-3 flex-1 overflow-hidden">
                            <div className="font-medium text-sm text-gloop-text-muted line-through truncate">{item.name}</div>
                            <div className="text-xs text-gloop-text-muted/70 gap-1 flex items-center flex-wrap">
                              <span>
                                {formatValueWithUnit(item.quantity, item.unit || 'ea')}
                              </span>
                              {item.category && categoriesMap[item.category] && (
                                <><span className="mx-1">·</span><span>{categoriesMap[item.category].name}</span></>
                              )}
                              <span className="mx-1">·</span>
                              <span className="truncate">Added by: {item.addedBy?.name || 'Unknown User'}</span>
                              {item.price && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center">
                                    <DollarSign className="h-3 w-3 mr-0.5" />
                                    {item.price.toFixed(2)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 flex-shrink-0 ml-2">
                            {/* Split button */}
                            <ItemSplitSelector
                              tripId={trip.id}
                              itemId={item.id}
                              itemName={item.name}
                              itemPrice={item.price}
                              participants={trip?.participants?.filter(p => p && p.name) || []}
                              onSplitUpdated={handleSplitUpdate}
                            />
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gloop-text-muted/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={(e) => {
                                // Add haptic feedback
                                if (navigator.vibrate) {
                                  navigator.vibrate(25);
                                }
                                
                                // Use animation frame for visual feedback before removal
                                const parentRow = e.currentTarget.closest('.p-2');
                                if (parentRow instanceof HTMLElement) {
                                  parentRow.style.opacity = '0.5';
                                  parentRow.style.transition = 'opacity 0.2s';
                                }
                                
                                // Call the remove function with both tripId and itemId
                                onRemoveItem(trip.id, item.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Price display for checked items */}
                        {item.price === undefined && trip.status === 'completed' && onUpdateItemPrice && (
                          <div className="mt-2 pl-8">
                            <div className="flex flex-col gap-2">
                              <PriceInput 
                                itemName={item.name}
                                value={item.price}
                                onChange={(price) => handleItemPriceChange(item.id, price)}
                              />
                              
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gloop-text-muted">Unit:</span>
                                <UnitSelector
                                  itemName={item.name}
                                  quantity={item.quantity}
                                  unit={item.unit}
                                  onQuantityChange={(qty) => handleItemUnitChange(item.id, item.unit || 'ea', qty)}
                                  onUnitChange={(unit) => handleItemUnitChange(item.id, unit)}
                                  showConversion={true}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {trip.items.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gloop-text-muted">No items added yet</p>
                  <p className="text-sm mt-1">
                    Add items for {trip.shopper ? trip.shopper.name : 'the shopper'} to pick up
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Cost split tab content */}
            <TabsContent value="splits" className="mt-4 overflow-y-auto pb-16">
              <CostSplitSummary
                tripId={trip.id}
                tripName={trip.store}
                items={trip.items}
                participants={trip.participants}
                onSettleUp={onSettleUp}
                onSplitUpdated={() => {
                  // Force a refresh of the split summary when splits are updated
                  setActiveTab("splits");
                }}
              />
            </TabsContent>
          </Tabs>
          
          {isUserShopper && trip.status !== 'completed' && trip.status !== 'cancelled' && (
            <div className="mt-4 pt-4 border-t border-gloop-outline dark:border-gloop-dark-surface sticky bottom-0 bg-background dark:bg-gloop-dark-background pb-4 z-10">
              <Button 
                className="w-full premium-gradient-btn h-10"
                onClick={() => onCompleteTrip(trip.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {trip.status === 'open' ? 'Start Shopping' : 'Complete Trip'}
              </Button>
            </div>
          )}
          
          {/* Reactivate button for completed trips */}
          {trip.status === 'completed' && onReactivateTrip && (
            <div className="mt-4 pt-4 border-t border-gloop-outline dark:border-gloop-dark-surface sticky bottom-0 bg-background dark:bg-gloop-dark-background pb-4 z-10">
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => onReactivateTrip(trip.id)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Reactivate Trip
              </Button>
            </div>
          )}
          
          {/* Duplicate Item Dialog */}
          <DuplicateItemDialog
            suggestion={duplicateSuggestion}
            isOpen={showDuplicateDialog}
            onClose={() => setShowDuplicateDialog(false)}
            onAddAnyway={handleAddAnyway}
            onMergeItems={handleMergeItems}
            onUpdate={handleUpdateExisting}
          />
          
          {/* Product save dialog */}
          <BarcodeProductSaveDialog
            barcode={scannedBarcode}
            isOpen={showSaveProductDialog}
            onClose={() => setShowSaveProductDialog(false)}
            onSave={handleProductSave}
          />
          
          {/* Smart List Parser Button */}
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSmartParser(true)}
              className="flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span className="hidden sm:inline">Smart Parser</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Smart List Parser Dialog */}
      <SmartListParser 
        isOpen={showSmartParser}
        onClose={() => setShowSmartParser(false)}
        onAddItems={handleAddItemsFromParser}
      />
    </>
  );
};

export default TripDetailModal;
