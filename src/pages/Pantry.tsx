import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Plus, 
  ShoppingCart, 
  Calendar, 
  Package, 
  AlertTriangle,
  Filter,
  ChevronRight,
  Refrigerator,
  Minus,
  Trash2,
  X,
  DollarSign,
  RefreshCw,
  ScanLine
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingActionButton from "@/components/FloatingActionButton";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PriceComparison from "@/components/PriceComparison";
import { GroceryStore } from "@/services/priceService";
import PantryBarcodeAdder from "@/components/PantryBarcodeAdder";
import { EmptyState } from "@/components/ui/empty-state";
import BarcodeScannerButton from "@/components/BarcodeScannerButton";

// Define the PantryItem type
export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  expiry: string;
  category: string;
  lowStock: boolean;
}

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'Dairy': <Refrigerator className="h-4 w-4 text-blue-500" />,
  'Bakery': <Package className="h-4 w-4 text-amber-600" />,
  'Produce': <Package className="h-4 w-4 text-green-500" />,
  'Pantry': <Package className="h-4 w-4 text-orange-500" />,
  'Meat': <Package className="h-4 w-4 text-red-500" />,
  'Seafood': <Package className="h-4 w-4 text-blue-400" />,
  'Snacks': <Package className="h-4 w-4 text-purple-500" />,
  'Beverages': <Package className="h-4 w-4 text-cyan-500" />,
  'Frozen': <Package className="h-4 w-4 text-blue-300" />,
  'Household': <Package className="h-4 w-4 text-gray-500" />
};

// Common categories
const COMMON_CATEGORIES = [
  'Dairy',
  'Meat',
  'Seafood',
  'Produce',
  'Bakery',
  'Pantry',
  'Snacks',
  'Beverages',
  'Frozen',
  'Household'
];

const PantryPage = () => {
  const { toast } = useToast();
  console.log("PantryPage component rendering");
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showUpdateInventoryDialog, setShowUpdateInventoryDialog] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [newItem, setNewItem] = useState<Partial<PantryItem>>({
    name: '',
    quantity: 1,
    expiry: new Date().toISOString().split('T')[0],
    category: 'Pantry',
    lowStock: false
  });
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number}>({ lat: 39.9622, lng: -83.0007 }); // Default to Columbus

  // Add debug logging for state changes
  useEffect(() => {
    console.log("showAddItemDialog changed:", showAddItemDialog);
  }, [showAddItemDialog]);

  useEffect(() => {
    console.log("showUpdateInventoryDialog changed:", showUpdateInventoryDialog);
  }, [showUpdateInventoryDialog]);

  // Add an effect to ensure components are properly loaded
  useEffect(() => {
    setIsLoaded(true);
    
    // Initialize all categories as expanded by default
    const categories = Array.from(new Set(pantryItems.map(item => item.category)));
    const initialExpandedState = categories.reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setExpandedCategories(initialExpandedState);
  }, []);

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
        (error) => {
          console.error("Error getting user location:", error);
          // Use default location (Columbus)
        }
      );
    }
  }, []);

  // Handle getting directions to a store
  const handleStoreDirections = (store: GroceryStore) => {
    // Open Google Maps with directions to the store
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}&destination_place_id=${store.name}`;
    window.open(url, '_blank');
    
    toast({
      title: "Opening Directions",
      description: `Getting directions to ${store.name}`
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  // Scan and update inventory
  const handleUpdateInventoryByBarcode = (barcode: string) => {
    console.log("[PantryPage] Scanning barcode for inventory update:", barcode);
    
    // Mock barcode to item mapping for demonstration
    const mockBarcodeToItemMap: Record<string, { name: string, quantity: number }> = {
      '049000042566': { name: 'Coca-Cola', quantity: 1 },
      '038000138416': { name: 'Cheerios', quantity: 1 },
      '021130126026': { name: 'Bread', quantity: 1 },
      '803275300005': { name: 'Milk', quantity: 1 },
      '011110038364': { name: 'Eggs', quantity: 12 },
      '024000018704': { name: 'Pasta', quantity: 1 },
      '051000012517': { name: 'Tomato Sauce', quantity: 1 }
    };

    const matchedItem = mockBarcodeToItemMap[barcode];
    
    if (matchedItem) {
      // Find the item in the pantry
      setPantryItems(prevItems => [
        ...prevItems,
        {
          id: Date.now().toString(),
          name: matchedItem.name,
          quantity: matchedItem.quantity,
          expiry: new Date().toISOString().split('T')[0],
          category: 'Pantry',
          lowStock: matchedItem.quantity <= 1
        }
      ]);
      toast({
        title: "Quantity Updated",
        description: `${matchedItem.name} quantity has been increased by ${matchedItem.quantity}.`
      });
    } else {
      toast({
        title: "Item Not Found",
        description: "This barcode is not recognized. Please add it as a new item.",
        variant: "destructive"
      });
    }
  };

  // Add a new pantry item
  const handleAddItem = () => {
    console.log("[PantryPage] Adding new item:", newItem);
    
    if (!newItem.name) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive"
      });
      return;
    }

    if (!newItem.expiry) {
      toast({
        title: "Error",
        description: "Please select an expiry date",
        variant: "destructive"
      });
      return;
    }

    if (!newItem.category) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive"
      });
      return;
    }

    const item: PantryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      quantity: newItem.quantity || 1,
      expiry: newItem.expiry,
      category: newItem.category,
      lowStock: (newItem.quantity || 1) <= 1
    };

    // Update state using functional update to ensure we have the latest state
    setPantryItems(prevItems => [...prevItems, item]);

    // Reset form and close dialog
    setNewItem({
      name: '',
      quantity: 1,
      expiry: new Date().toISOString().split('T')[0],
      category: 'Pantry',
      lowStock: false
    });
    setShowAddItemDialog(false);
  };

  // Handle adding item via barcode scanner
  const handleAddPantryItem = (item: PantryItem) => {
    // Check if item already exists by name
    setPantryItems(prevItems => [...prevItems, item]);
  };

  // Increase item quantity
  const handleIncreaseQuantity = (itemId: string, amount = 1) => {
    const item = pantryItems.find(item => item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + amount;
      setPantryItems(prevItems => prevItems.map(i =>
        i.id === itemId ? { ...i, quantity: newQuantity, lowStock: newQuantity <= 1 } : i
      ));
      
      toast({
        title: "Quantity Updated",
        description: `${item.name} quantity increased to ${newQuantity}.`
      });
    }
  };

  // Decrease item quantity
  const handleDecreaseQuantity = (itemId: string) => {
    const item = pantryItems.find(item => item.id === itemId);
    if (item) {
      const newQuantity = Math.max(0, item.quantity - 1);
      if (newQuantity === 0) {
        setPantryItems(prevItems => prevItems.filter(i => i.id !== itemId));
        toast({
          title: "Item Removed",
          description: `${item.name} has been removed from your pantry.`
        });
      } else {
        setPantryItems(prevItems => prevItems.map(i =>
          i.id === itemId ? { ...i, quantity: newQuantity, lowStock: newQuantity <= 1 } : i
        ));
        toast({
          title: "Quantity Updated",
          description: `${item.name} quantity decreased to ${newQuantity}.`
        });
      }
    }
  };

  // Add item to shopping list
  const handleAddToShoppingList = (item: PantryItem) => {
    toast({
      title: "Added to Shopping List",
      description: `${item.name} has been added to your shopping list.`
    });
  };

  // Delete item from pantry
  const handleDeleteItem = (itemId: string) => {
    setPantryItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Safety check for potentially undefined values
  const filteredItems = pantryItems ? pantryItems.filter(item => 
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === null || item.category === selectedCategory)
  ) : [];

  // Safety check for groupedItems
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

  // Get unique categories for filter buttons
  const categories = Array.from(new Set(pantryItems.map(item => item.category)));

  // Calculate days until expiry with proper negative handling
  const getDaysUntilExpiry = (expiryDate: string) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (isNaN(expiry.getTime())) return null; // Invalid date
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays; // Can be negative for expired items
  };

  console.log("PantryItems:", pantryItems);
  console.log("Filtered items:", filteredItems);
  console.log("Grouped items:", groupedItems);

  // Toggle category expansion
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
    
    // Add haptic feedback for better user experience
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  // Add function to clear the pantry (for testing the empty state)
  const handleClearPantry = () => {
    // Remove all items
    setPantryItems([]);
    toast({
      title: "Pantry Cleared",
      description: "All items have been removed from your pantry."
    });
  };

  // Function to handle opening the Add Item dialog
  const handleOpenAddItemDialog = () => {
    console.log("Opening Add Item dialog");
    setShowAddItemDialog(true);
  };

  // Function to handle closing the Add Item dialog
  const handleCloseAddItemDialog = () => {
    console.log("Closing Add Item dialog");
    setShowAddItemDialog(false);
    // Reset form state
    setNewItem({
      name: '',
      quantity: 1,
      expiry: new Date().toISOString().split('T')[0],
      category: 'Pantry',
      lowStock: false
    });
  };

  // Return loading state if not fully loaded
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gloop-primary"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-6 px-4 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end">My Pantry</h1>
      </header>
      
      {/* Buttons for Add Item and Update Inventory */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Button 
          className="premium-card flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
          onClick={handleOpenAddItemDialog}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="premium-card flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white"
              onClick={() => {
                toast({
                  title: "Update Inventory",
                  description: "Opening inventory management tools",
                });
                setShowUpdateInventoryDialog(true);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Inventory
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] premium-card">
            <DialogHeader>
              <DialogTitle>Update Inventory</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p className="text-center text-gray-600 dark:text-gray-400">
                Scan barcodes of items you already have in your pantry to quickly update their quantities.
              </p>
              <div className="flex justify-center py-4">
                <BarcodeScannerButton
                  onScan={(barcode) => {
                    console.log("Barcode scanned:", barcode);
                    handleUpdateInventoryByBarcode(barcode);
                  }}
                  buttonText="Scan to Update Quantity"
                  buttonVariant="default"
                  buttonSize="default"
                  className="w-full"
                />
              </div>
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-700 text-sm">
                <p className="flex items-start">
                  <AlertTriangle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                  <span>
                    For demonstration, scanning these barcodes will update quantities for:
                    <ul className="mt-2 ml-6 list-disc">
                      <li>049000042566 - Coca-Cola</li>
                      <li>038000138416 - Cheerios</li>
                      <li>021130126026 - Bread</li>
                      <li>803275300005 - Milk</li>
                      <li>011110038364 - Eggs</li>
                      <li>024000018704 - Pasta</li>
                      <li>051000012517 - Tomato Sauce</li>
                    </ul>
                  </span>
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  toast({
                    title: "Inventory Updated",
                    description: "Your inventory has been refreshed",
                  });
                  setShowUpdateInventoryDialog(false);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Barcode Scanner Button for Pantry */}
      <div className="mb-4">
        <PantryBarcodeAdder onAddPantryItem={handleAddPantryItem} />
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gloop-text-muted" />
        <Input
          placeholder="Search items or categories..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10 premium-card"
        />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="premium-card"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            
            {/* Add Clear Pantry Button for Testing */}
            {pantryItems.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleClearPantry}
                className="premium-card"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Pantry
              </Button>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="premium-card"
            onClick={() => {
              const lowStockItems = pantryItems.filter(item => item.lowStock);
              if (lowStockItems.length > 0) {
                lowStockItems.forEach(item => handleAddToShoppingList(item));
                toast({
                  title: "Low Stock Items Added",
                  description: `${lowStockItems.length} items added to your shopping list.`
                });
              } else {
                toast({
                  title: "No Low Stock Items",
                  description: "There are no low stock items to add to your shopping list."
                });
              }
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add Low Stock to Cart
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map(category => (
                  <Badge 
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {categoryIcons[category] || null}
                    <span className="ml-1">{category}</span>
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Comparison Component */}
      <Card className="premium-card mb-6 shadow-md">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gloop-primary" />
            Best Prices Finder
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <PriceComparison 
            items={pantryItems.map(item => item.name)} 
            userLocation={userLocation}
            onStoreDirections={handleStoreDirections}
          />
        </CardContent>
      </Card>

      {/* Show empty state when there are no pantry items */}
      {!pantryItems.length ? (
        <EmptyState
          title="Your pantry is empty"
          description="Add some food items to your pantry to keep track of what you have and get price recommendations."
          icon={<Package className="h-12 w-12" />}
          action={
            <Button 
              onClick={() => setShowAddItemDialog(true)}
              className="premium-card"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          }
          imageUrl="/images/empty-pantry.svg"
        />
      ) : (
        // If there are items but none match the filter, show filtered empty state
        filteredItems.length === 0 ? (
          <div className="text-center py-12 border rounded-lg glass-effect">
            <Package className="h-12 w-12 mx-auto mb-3 text-gloop-text-muted opacity-30" />
            <p className="text-gloop-text-muted">No items found</p>
            <p className="text-sm mt-2 text-gloop-text-muted">Try adjusting your search or filters</p>
            <Button 
              variant="outline" 
              className="mt-4 premium-card"
              onClick={() => setShowAddItemDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Items
            </Button>
          </div>
        ) : (
          // Regular view with categorized items
          Object.entries(groupedItems).map(([category, items]) => (
            <motion.div 
              key={category}
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="flex items-center gap-2 mb-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-sm cursor-pointer hover:bg-gloop-primary/10 transition-all duration-200"
                onClick={() => toggleCategoryExpansion(category)}
                role="button"
                tabIndex={0}
                aria-expanded={expandedCategories[category]}
                style={{ minHeight: '48px' }} // Ensures at least 48px height for better touch targets
              >
                {categoryIcons[category]}
                <h2 className="text-lg font-medium">{category}</h2>
                <Badge variant="outline" className="ml-auto">{items.length}</Badge>
                <ChevronRight 
                  className={`h-5 w-5 text-gloop-text-muted transition-transform duration-300 ${
                    expandedCategories[category] ? 'rotate-90' : ''
                  }`} 
                />
              </div>
              
              <AnimatePresence>
                {expandedCategories[category] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3">
                      {items.map((item) => {
                        const daysUntilExpiry = getDaysUntilExpiry(item.expiry);
                        const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 3 && daysUntilExpiry > 0;
                        const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;
                        
                        return (
                          <motion.div 
                            key={item.id}
                            whileHover={{ x: 5 }}
                            className="hover-lift"
                          >
                            <Card className="overflow-hidden premium-card">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-medium">{item.name}</h3>
                                    <div className="flex items-center text-sm text-gloop-text-muted mt-1">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      <span>
                                        {daysUntilExpiry === null ? (
                                          <span className="text-gray-500">No expiry date</span>
                                        ) : isExpired ? (
                                          <span className="text-red-500">
                                            {Math.abs(daysUntilExpiry) === 0 ? "Expired today" : `Expired ${Math.abs(daysUntilExpiry)} days ago`}
                                          </span>
                                        ) : isExpiringSoon ? (
                                          <span className="text-amber-500">Expires in {daysUntilExpiry} days</span>
                                        ) : (
                                          <span>Expires: {new Date(item.expiry).toLocaleDateString()}</span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right flex flex-col items-end">
                                    <div className="flex items-center">
                                      <span className="text-lg font-medium">{item.quantity}</span>
                                      {item.lowStock && (
                                        <Badge className="ml-2 bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0">
                                          Low
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex mt-1 gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 w-7 p-0 rounded-full hover:bg-gloop-primary/10"
                                        onClick={() => handleIncreaseQuantity(item.id)}
                                      >
                                        <Plus className="h-3 w-3 text-gloop-primary" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 w-7 p-0 rounded-full hover:bg-gloop-primary/10"
                                        onClick={() => handleDecreaseQuantity(item.id)}
                                      >
                                        <Minus className="h-3 w-3 text-gloop-primary" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 w-7 p-0 rounded-full hover:bg-gloop-primary/10"
                                        onClick={() => handleAddToShoppingList(item)}
                                      >
                                        <ShoppingCart className="h-3 w-3 text-gloop-primary" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 w-7 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20"
                                        onClick={() => handleDeleteItem(item.id)}
                                      >
                                        <Trash2 className="h-3 w-3 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )
      )}

      <FloatingActionButton 
        onClick={() => setShowAddItemDialog(true)} 
        icon={<Plus className="h-6 w-6" />}
        label="Add Item"
      />
      
      <NavBar />

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="sm:max-w-[425px] premium-card">
          <DialogHeader>
            <DialogTitle>Add Pantry Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddItem();
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="name" className="sm:text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="sm:col-span-3"
                  placeholder="Enter item name"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="quantity" className="sm:text-right">
                  Quantity
                </Label>
                <div className="flex items-center gap-2 sm:col-span-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setNewItem({...newItem, quantity: Math.max(1, (newItem.quantity || 1) - 1)})}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity || 1}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setNewItem({...newItem, quantity: (newItem.quantity || 1) + 1})}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="expiry" className="sm:text-right">
                  Expiry Date
                </Label>
                <Input
                  id="expiry"
                  type="date"
                  value={newItem.expiry || ''}
                  onChange={(e) => setNewItem({...newItem, expiry: e.target.value})}
                  className="sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="category" className="sm:text-right">
                  Category
                </Label>
                <Select 
                  value={newItem.category} 
                  onValueChange={(value) => setNewItem({...newItem, category: value})}
                >
                  <SelectTrigger className="sm:col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center">
                          {categoryIcons[category]}
                          <span className="ml-2">{category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="py-2">
                <Button 
                  variant="outline" 
                  className="w-full bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCloseAddItemDialog();
                    // Short delay to avoid modal conflicts
                    setTimeout(() => {
                      // Show barcode scanner
                      const scanButton = document.querySelector<HTMLElement>('button[aria-label="Scan & Add to Pantry"]');
                      if (scanButton) {
                        scanButton.click();
                      } else {
                        toast({
                          title: "Scanner Not Available",
                          description: "Please use the scan button in the main pantry view",
                          variant: "destructive"
                        });
                      }
                    }, 300);
                  }}
                  type="button"
                >
                  <ScanLine className="h-4 w-4 mr-2" />
                  Scan Barcode Instead
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  handleCloseAddItemDialog();
                }} 
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PantryPage;
