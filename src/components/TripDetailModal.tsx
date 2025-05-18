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
  Sparkles,
  BarChart2
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
import PriceRecommendationsPanel from "./PriceRecommendation";
import { Link } from "react-router-dom";

// Add success variant to BadgeProps
declare module "@/components/ui/badge" {
  interface BadgeProps {
    variant?: "default" | "destructive" | "secondary" | "outline" | "success";
  }
}

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> 
            <span>{trip?.store || "Trip"}</span>
            <Badge variant={trip?.status === 'completed' ? 'success' : trip?.status === 'shopping' ? 'default' : 'outline'}>
              {trip?.status === 'completed' ? 'Completed' : trip?.status === 'shopping' ? 'Shopping' : 'Planning'}
            </Badge>
          </DialogTitle>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground py-1">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" /> 
              {new Date(trip?.date || "").toLocaleDateString()} | {trip?.eta}
            </span>
            
            {trip?.status !== 'completed' && (
              <div className="flex ml-auto gap-2">
                <Button
                  size="sm" 
                  variant="outline"
                  onClick={() => onInviteParticipant(trip?.id || "")}
                >
                  <UserPlus className="h-4 w-4 mr-2" /> Invite
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onCompleteTrip(trip?.id || "")}
                  disabled={!trip?.items.some(item => item.checked)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Complete
                </Button>
              </div>
            )}
            
            {trip?.status === 'completed' && onReactivateTrip && (
              <div className="flex ml-auto gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReactivateTrip(trip?.id || "")}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" /> Reactivate
                </Button>
                <ExportButton tripData={trip} />
              </div>
            )}
          </div>
        </DialogHeader>
        
        {/* Tabs for different sections */}
        <Tabs defaultValue="items" value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="items">Items ({trip?.items.length || 0})</TabsTrigger>
            <TabsTrigger value="people">People ({trip?.participants.length || 0})</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="space-y-4">
            {/* Show price recommendations if trip is in planning phase */}
            {trip?.status === 'open' && (
              <PriceRecommendationsPanel items={trip?.items || []} currentStore={trip?.store} />
            )}
            
            {/* Item Input Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add Item</h3>
              <form onSubmit={handleAddItem} className="space-y-3">
                {/* Item Name */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label htmlFor="item-name">Item</Label>
                    <Input
                      id="item-name"
                      placeholder="e.g., Milk, Apples, Bread"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                    />
                  </div>
                  
                  {/* Smart List Parser Button */}
                  <div className="pt-6">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowSmartParser(true)}
                      title="Open smart list parser"
                    >
                      <Sparkles className="h-5 w-5 text-amber-500" />
                    </Button>
                  </div>
                  
                  {/* Barcode Scanner Button */}
                  <div className="pt-6">
                    <BarcodeScannerButton onScan={handleBarcodeScan} />
                  </div>
                  
                  {/* Receipt Scanner Button */}
                  <div className="pt-6">
                    <ReceiptScannerButton onScan={handleReceiptScan} />
                  </div>
                </div>
                
                {/* Bottom row with quantity, unit, and price */}
                <div className="grid grid-cols-4 gap-3">
                  {/* Quantity */}
                  <div>
                    <Label htmlFor="item-quantity">Quantity</Label>
                    <Input
                      id="item-quantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="1"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                    />
                  </div>
                  
                  {/* Unit */}
                  <div>
                    <Label htmlFor="item-unit">Unit</Label>
                    <UnitSelector
                      value={newItemUnit}
                      onChange={setNewItemUnit}
                    />
                  </div>
                  
                  {/* Price */}
                  <div>
                    <Label htmlFor="item-price">Price (optional)</Label>
                    <PriceInput
                      id="item-price"
                      value={newItemPrice}
                      onChange={setNewItemPrice}
                    />
                  </div>
                  
                  {/* Category */}
                  <div>
                    <Label htmlFor="item-category">Category</Label>
                    <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                      <SelectTrigger id="item-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoriesMap).map(([id, category]) => (
                          <SelectItem key={id} value={id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Recurring item options */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring-item"
                    checked={newItemIsRecurring}
                    onCheckedChange={setNewItemIsRecurring}
                  />
                  <Label htmlFor="recurring-item">Make this a recurring item</Label>
                  
                  {newItemIsRecurring && (
                    <Select 
                      value={newItemRecurrenceFrequency || ''} 
                      onValueChange={(val) => setNewItemRecurrenceFrequency(val as RecurrenceFrequency)}
                    >
                      <SelectTrigger className="w-[130px] ml-2">
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" /> Add to Trip
                </Button>
              </form>
            </div>
            
            {/* List of items */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Items</h3>
              
              {trip?.items.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No items added yet. Add some items above.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  <AnimatePresence initial={false}>
                    {trip?.items.map((item) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "flex items-center justify-between p-3 border rounded-lg",
                          item.checked && "bg-muted border-muted"
                        )}
                      >
                        <div className="flex items-center flex-1">
                          {/* Checkbox for marking item */}
                          <button 
                            className={cn(
                              "w-6 h-6 border rounded-md mr-3 flex items-center justify-center",
                              item.checked ? "bg-primary border-primary text-primary-foreground" : "border-input"
                            )}
                            onClick={() => onToggleItemCheck(trip.id, item.id)}
                          >
                            {item.checked && <Check className="h-4 w-4" />}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className={cn("font-medium", item.checked && "line-through text-muted-foreground")}>
                                {item.name}
                              </span>
                              
                              {/* Display category if available */}
                              {item.category && categoriesMap[item.category] && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {categoriesMap[item.category].name}
                                </Badge>
                              )}
                              
                              {/* Show recurring indicator */}
                              {item.isRecurring && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {item.recurrenceFrequency}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-sm text-muted-foreground flex gap-4">
                              <span>
                                {formatValueWithUnit(item.quantity, item.unit || 'ea')}
                              </span>
                              
                              {item.price && (
                                <span className="text-primary">
                                  ${item.price.toFixed(2)}
                                </span>
                              )}
                              
                              <span>
                                Added by {item.addedBy.name}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {/* Price input for items without price */}
                          {!item.price && trip.status !== 'completed' && (
                            <PriceInput
                              value={item.price}
                              onChange={(value) => handleItemPriceChange(item.id, value)}
                              className="w-24 mr-2"
                              placeholder="Add price"
                            />
                          )}
                          
                          {/* Unit selector for changing units */}
                          {trip.status !== 'completed' && (
                            <UnitSelector
                              value={item.unit || 'ea'}
                              onChange={(value) => handleItemUnitChange(item.id, value)}
                              className="w-20 mr-2"
                            />
                          )}
                          
                          {/* Remove item button */}
                          {trip.status !== 'completed' && (
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => onRemoveItem(trip.id, item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </TabsContent>
          
          {/* People tab content */}
          <TabsContent value="people">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Participants</h3>
              
              {trip?.participants.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No participants added yet.</p>
                </div>
              ) : (
                <ul className="grid grid-cols-2 gap-3">
                  {trip?.participants.map((participant) => (
                    <li 
                      key={participant.id}
                      className="flex items-center p-3 border rounded-lg"
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={participant.avatar} alt={participant.name} />
                        <AvatarFallback>{participant.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {participant.id === '123' ? 'Owner' : 'Participant'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="pt-4">
                <Button onClick={() => onInviteParticipant(trip?.id || "")}>
                  <UserPlus className="h-4 w-4 mr-2" /> Invite Participant
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Costs tab content */}
          <TabsContent value="costs">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Cost Summary</h3>
                {trip?.status === 'completed' && (
                  <Badge variant="success" className="px-2 py-1">
                    <CheckCircle className="h-3 w-3 mr-1" /> Trip Completed
                  </Badge>
                )}
              </div>
              
              {trip?.items.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No items added yet.</p>
                </div>
              ) : (
                <>
                  {/* Items with costs */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Items</h4>
                    <ul className="space-y-2">
                      {trip?.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground ml-2">
                              {formatValueWithUnit(item.quantity, item.unit || 'ea')}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {item.price ? (
                              <span className="font-medium">${item.price.toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground">No price</span>
                            )}
                            
                            {/* Split indicator */}
                            {item.price && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="ml-2"
                              >
                                <SplitSquareVertical className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4">
                    <CostSplitSummary 
                      items={trip?.items || []} 
                      participants={trip?.participants || []} 
                      onSettleUp={onSettleUp}
                    />
                  </div>
                </>
              )}
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
