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
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingActionButton from "@/components/FloatingActionButton";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PriceComparison from "@/components/PriceComparison";
import { GroceryStore } from "@/services/priceService";

// Define the PantryItem type
interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  expiry: string;
  category: string;
  lowStock: boolean;
}

// Mock pantry items for demo
const mockPantryItems: PantryItem[] = [
  {
    id: '1',
    name: 'Milk',
    quantity: 1,
    expiry: '2025-05-05',
    category: 'Dairy',
    lowStock: true
  },
  {
    id: '2',
    name: 'Eggs',
    quantity: 6,
    expiry: '2025-05-10',
    category: 'Dairy',
    lowStock: false
  },
  {
    id: '3',
    name: 'Bread',
    quantity: 3,
    expiry: '2025-05-04',
    category: 'Bakery',
    lowStock: false
  },
  {
    id: '4',
    name: 'Bananas',
    quantity: 2,
    expiry: '2025-05-03',
    category: 'Produce',
    lowStock: true
  },
  {
    id: '5',
    name: 'Pasta',
    quantity: 4,
    expiry: '2025-07-15',
    category: 'Pantry',
    lowStock: false
  },
  {
    id: '6',
    name: 'Tomato Sauce',
    quantity: 1,
    expiry: '2025-08-20',
    category: 'Pantry',
    lowStock: true
  }
];

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'Dairy': <Refrigerator className="h-4 w-4 text-blue-500" />,
  'Bakery': <Package className="h-4 w-4 text-amber-600" />,
  'Produce': <Package className="h-4 w-4 text-green-500" />,
  'Pantry': <Package className="h-4 w-4 text-orange-500" />
};

const PantryPage = () => {
  console.log("PantryPage component rendering");
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(mockPantryItems);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [newItem, setNewItem] = useState<Partial<PantryItem>>({
    name: '',
    quantity: 1,
    expiry: new Date().toISOString().split('T')[0],
    category: 'Pantry',
    lowStock: false
  });
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number}>({ lat: 39.9622, lng: -83.0007 }); // Default to Columbus

  // Add an effect to ensure components are properly loaded
  useEffect(() => {
    setIsLoaded(true);
    
    // Initialize all categories as expanded by default
    const categories = Array.from(new Set(mockPantryItems.map(item => item.category)));
    const initialExpandedState = categories.reduce((acc, category) => {
      acc[category] = true; // Start with all categories expanded
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

  // Add a new pantry item
  const handleAddItem = () => {
    if (!newItem.name) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive"
      });
      return;
    }

    const item: PantryItem = {
      id: Date.now().toString(),
      name: newItem.name || '',
      quantity: newItem.quantity || 1,
      expiry: newItem.expiry || new Date().toISOString().split('T')[0],
      category: newItem.category || 'Pantry',
      lowStock: (newItem.quantity || 1) <= 1
    };

    setPantryItems([...pantryItems, item]);
    setShowAddItemDialog(false);
    setNewItem({
      name: '',
      quantity: 1,
      expiry: new Date().toISOString().split('T')[0],
      category: 'Pantry',
      lowStock: false
    });

    toast({
      title: "Item Added",
      description: `${item.name} has been added to your pantry.`
    });
  };

  // Increase item quantity
  const handleIncreaseQuantity = (itemId: string) => {
    setPantryItems(pantryItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + 1;
        return {
          ...item,
          quantity: newQuantity,
          lowStock: newQuantity <= 1
        };
      }
      return item;
    }));

    toast({
      title: "Quantity Updated",
      description: "Item quantity has been increased."
    });
  };

  // Decrease item quantity
  const handleDecreaseQuantity = (itemId: string) => {
    setPantryItems(pantryItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity - 1);
        
        if (newQuantity === 0) {
          toast({
            title: "Item Removed",
            description: `${item.name} has been removed from your pantry.`
          });
          return null;
        }
        
        return {
          ...item,
          quantity: newQuantity,
          lowStock: newQuantity <= 1
        };
      }
      return item;
    }).filter(Boolean) as PantryItem[]);
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
    const itemToDelete = pantryItems.find(item => item.id === itemId);
    
    if (itemToDelete) {
      setPantryItems(pantryItems.filter(item => item.id !== itemId));
      
      toast({
        title: "Item Removed",
        description: `${itemToDelete.name} has been removed from your pantry.`
      });
    }
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

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="premium-card"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
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

      {Object.entries(groupedItems).length > 0 ? (
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
                      const isExpiringSoon = daysUntilExpiry <= 3 && daysUntilExpiry > 0;
                      const isExpired = daysUntilExpiry <= 0;
                      
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
                                      {isExpired ? (
                                        <span className="text-red-500">Expired</span>
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
      ) : (
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
      )}

      <FloatingActionButton 
        onClick={() => setShowAddItemDialog(true)} 
        icon={<Plus className="h-6 w-6" />}
        label="Add Item"
      />
      
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="sm:max-w-[425px] premium-card">
          <DialogHeader>
            <DialogTitle>Add Pantry Item</DialogTitle>
          </DialogHeader>
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
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="quantity" className="sm:text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newItem.quantity || 1}
                onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                className="sm:col-span-3"
              />
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
                  {categories.map(category => (
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <NavBar />
    </div>
  );
};

export default PantryPage;
