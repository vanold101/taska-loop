import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Checkbox } from "../components/ui/checkbox"
import {
  AlertCircle,
  CalendarDays,
  Calculator,
  Clock,
  Coffee,
  Edit,
  Filter,
  ListTodo,
  MapPin,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Users,
  ChevronRight,
  Minus,
  X,
  ScanLine
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { AppLayout } from "../components/AppLayout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import PantryBarcodeScanner from "../components/PantryBarcodeScanner"
import { motion, AnimatePresence } from "framer-motion"
import FloatingActionButton from "../components/FloatingActionButton"
import NavBar from "../components/NavBar"
import { ScannedItem } from "../components/BarcodeScannerButton"
import { usePantry, PantryItem } from "../context/PantryContext"
import PantryBarcodeAdder from "../components/PantryBarcodeAdder"
import RecurringItemsManager from '../components/RecurringItemsManager'

// Define interfaces for new item form
interface NewItem {
  name: string;
  quantity: number;
  category: string;
  expiry?: string;
}

// Common categories and icons
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

const categoryIcons: Record<string, React.ReactNode> = {
  'Dairy': <Package className="h-4 w-4 text-blue-500" />,
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

export default function PantryPage() {
  const navigate = useNavigate();
  const { pantryItems, addPantryItem, updatePantryItem, removePantryItem } = usePantry();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState<NewItem>({
    name: '',
    quantity: 1,
    category: '',
  });
  const [showUpdateInventoryDialog, setShowUpdateInventoryDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(true);
  const [showAllItemsDialog, setShowAllItemsDialog] = useState(false);
  const [showExpiringDialog, setShowExpiringDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showShoppingListDialog, setShowShoppingListDialog] = useState(false);
  const [selectedCategoryForView, setSelectedCategoryForView] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [expiryTimeframe, setExpiryTimeframe] = useState<number>(7);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<'name' | 'expiry' | 'quantity'>('name');
  const [selectedShoppingList, setSelectedShoppingList] = useState<string>('default');
  const [addToCartQuantity, setAddToCartQuantity] = useState<number>(1);
  const [itemNote, setItemNote] = useState<string>('');

  // Handler for "Update Inventory" button
  const handleUpdateInventory = () => {
    setShowUpdateInventoryDialog(true);
  };

  // Handler for "Add Item" button
  const handleAddItem = () => {
    setShowAddItemDialog(true);
  };

  // Handler for "View All Items" button
  const handleViewAllItems = () => {
    setShowAllItemsDialog(true);
  };

  // Handler for "Add to ShoppingList" button
  const handleAddToShoppingList = (item: PantryItem) => {
    setShowShoppingListDialog(true);
  };

  // Handler for "View All Expiring" button
  const handleViewAllExpiring = () => {
    setShowExpiringDialog(true);
  };

  // Handler for search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handler for sort selection
  const handleSortChange = (value: 'name' | 'expiry' | 'quantity') => {
    setSortField(value);
  };

  // Handler for "Edit" menu item
  const handleEditItem = (itemId: string) => {
    const itemToEdit = pantryItems.find(item => item.id === itemId);
    if (itemToEdit) {
      setNewItem({
        name: itemToEdit.name,
        quantity: itemToEdit.quantity,
        category: itemToEdit.category,
        expiry: itemToEdit.expiry
      });
      setShowAddItemDialog(true);
    }
  };

  // Handler for "Add to List" menu item
  const handleAddItemToList = (itemId: string) => {
    const item = pantryItems.find(p => p.id === itemId);
    if (item) {
      // In a real app, this would add to a shopping list context
      // For now, we'll show a toast and navigate to trips page
      console.log(`${item.name} has been added to your shopping list`);
      
      // Navigate to trips page where user can create a new trip with this item
      navigate("/trips?action=add-item&item=" + encodeURIComponent(item.name));
    }
  };

  // Handler for "Remove" menu item
  const handleRemoveItem = (itemId: string) => {
    removePantryItem(itemId);
    console.log("Item removed from pantry");
  };

  // Handler for closing Add Item dialog
  const handleCloseAddItemDialog = () => {
    setShowAddItemDialog(false);
    setNewItem({
      name: '',
      quantity: 1,
      category: '',
    });
  };

  // Add Item form submission handler
  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.name || !newItem.quantity) {
      console.error("Please provide at least an item name and quantity.");
      return;
    }

    const itemToAdd: Omit<PantryItem, 'id'> = {
      ...newItem,
      lowStock: newItem.quantity <= 1
    };

    addPantryItem(itemToAdd);
    
    handleCloseAddItemDialog();
  };

  const handleBarcodeScan = (scannedItem: ScannedItem) => {
    setNewItem({
      name: scannedItem.name || 'Scanned Item',
      quantity: 1,
      category: scannedItem.category || '',
    });
    setShowAddItemDialog(true);
  };

  const getDaysUntilExpiry = (expiryDate?: string): number | null => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) return null;
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const lowStockItems = pantryItems.filter(item => item.lowStock);
  const expiringSoonItems = pantryItems.filter(item => {
    const daysUntilExpiry = getDaysUntilExpiry(item.expiry);
    return daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  });

  const mostUsedItems = pantryItems.slice(0, 3);
  
  const handleIncreaseQuantity = (itemId: string) => {
    const item = pantryItems.find(item => item.id === itemId);
    if (item) {
      updatePantryItem(itemId, { 
        quantity: item.quantity + 1,
        lowStock: (item.quantity + 1) <= 1
      });
    }
  };

  const handleDecreaseQuantity = (itemId: string) => {
    const item = pantryItems.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      updatePantryItem(itemId, { 
        quantity: item.quantity - 1,
        lowStock: (item.quantity - 1) <= 1
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterSelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleClearPantry = () => {
    pantryItems.forEach(item => removePantryItem(item.id));
    console.log("All items have been removed from your pantry.");
  };

  const handleAddLowStockToCart = () => {
    const lowStockItemNames = lowStockItems.map(item => item.name);
    
    if (lowStockItemNames.length === 0) {
      console.log("All items are adequately stocked.");
      return;
    }
    
    // In a real app, this would integrate with shopping list context
    console.log(`${lowStockItemNames.length} low stock items have been added to your shopping list: ${lowStockItemNames.join(", ")}`);
    
    // Navigate to trips page to create a shopping trip
    navigate("/trips?action=low-stock-refill");
  };

  // Enhanced search and filter logic
  const filteredItems = pantryItems
    .filter(item => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'food' && ['Dairy', 'Meat', 'Seafood', 'Produce', 'Bakery', 'Pantry', 'Snacks', 'Beverages', 'Frozen'].includes(item.category)) ||
        (activeTab === 'household' && item.category === 'Household') ||
        (activeTab === 'low-stock' && item.lowStock);

      return matchesSearch && matchesTab;
    });

  const sortItems = (items: PantryItem[]) => {
    return [...items].sort((a, b) => {
      if (sortField === 'expiry') {
        if (!a.expiry && !b.expiry) return 0;
        if (!a.expiry) return 1;
        if (!b.expiry) return -1;
        
        const aDate = new Date(a.expiry).getTime();
        const bDate = new Date(b.expiry).getTime();

        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      }

      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedItems = sortItems(filteredItems);

  const handleBulkAddToCart = () => {
    const selectedItemNames = Array.from(selectedItems).map(itemId => {
      const item = pantryItems.find(p => p.id === itemId);
      return item?.name;
    }).filter(Boolean);
    
    if (selectedItemNames.length === 0) {
      console.error("Please select items to add to your shopping list.");
      return;
    }
    
    console.log(`${selectedItems.size} items have been added to your shopping list: ${selectedItemNames.join(", ")}`);
    
    // Navigate to trips page to create a shopping trip
    navigate("/trips?action=bulk-add&items=" + encodeURIComponent(selectedItemNames.join(",")));
    
    setSelectedItems(new Set());
  };

  // Group items by category for the main view
  const groupedItems = filteredItems.reduce((acc, item) => {
    const { category } = item;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, PantryItem[]>);

  if (!isLoaded) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Pantry</h2>
            <p className="text-muted-foreground">
              Track and manage your household inventory
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleUpdateInventory}>
              <RefreshCw className="mr-2 h-4 w-4" /> Update Inventory
            </Button>
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        </div>

        {/* Barcode Scanner Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <ScanLine className="h-5 w-5" />
              Quick Add with Barcode Scanner
            </CardTitle>
            <CardDescription className="text-blue-600">
              Scan any product barcode to instantly add it to your pantry with product details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1">
                <PantryBarcodeScanner onAddPantryItem={(item) => {
                  addPantryItem(item);
                }} />
              </div>
              <div className="text-sm text-blue-600 max-w-xs">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="text-xs space-y-1">
                  <li>• Click scan and point camera at barcode</li>
                  <li>• Product info is automatically fetched</li>
                  <li>• Item is added to your pantry instantly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Inventory Summary */}
          <Card className="bg-teal-500 text-white">
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
              <CardDescription className="text-teal-100">
                You have {pantryItems.length} items in your pantry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <span>Low Stock</span>
                <span>{lowStockItems.length} items</span>
              </div>
              <div className="flex justify-between">
                <span>Expiring Soon</span>
                <span>{expiringSoonItems.length} items</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full" onClick={handleViewAllItems}>
                View All Items
              </Button>
            </CardFooter>
          </Card>
          
          {/* Most Used Items */}
          <Card>
            <CardHeader>
              <CardTitle>Most Used Items</CardTitle>
              <CardDescription>Based on your shopping history</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mostUsedItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {categoryIcons[item.category]}
                      <span className="ml-2">{item.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Bought 8 times</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => mostUsedItems.forEach(handleAddToShoppingList)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Shopping List
              </Button>
            </CardFooter>
          </Card>

          {/* Expiring Soon */}
          <Card>
            <CardHeader>
              <CardTitle>Expiring Soon</CardTitle>
              <CardDescription>Items to use in the next {expiryTimeframe} days</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {expiringSoonItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="text-red-500">Expires in {getDaysUntilExpiry(item.expiry)} days</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={handleViewAllExpiring}>
                <Clock className="mr-2 h-4 w-4" /> View All Expiring
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main Content Area - All Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Items</CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search pantry..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="max-w-sm"
                />
                <Select onValueChange={(value) => handleSortChange(value as 'name' | 'expiry' | 'quantity')} defaultValue={sortField}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="expiry">Expiry Date</SelectItem>
                    <SelectItem value="quantity">Quantity</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sortedItems.length > 0 ? (
              <ul className="space-y-4">
                {sortedItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={(checked) => {
                          const newSelectedItems = new Set(selectedItems);
                          if (checked) {
                            newSelectedItems.add(item.id);
                          } else {
                            newSelectedItems.delete(item.id);
                          }
                          setSelectedItems(newSelectedItems);
                        }}
                      />
                      <div className="ml-4">
                        <div className="font-medium">{item.name}</div>
                        {item.expiry && (
                          <div className="text-sm text-muted-foreground">
                            Expires in {getDaysUntilExpiry(item.expiry)} days
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleDecreaseQuantity(item.id)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => handleIncreaseQuantity(item.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleAddToShoppingList(item)}>
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditItem(item.id)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemoveItem(item.id)}>Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10">
                <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No items found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your pantry is empty or no items match your search.
                </p>
                <Button className="mt-4" onClick={handleAddItem}>
                  <Plus className="mr-2 h-4 w-4" /> Add your first item
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-muted-foreground">
                {selectedItems.size} of {pantryItems.length} items selected.
              </div>
              <Button onClick={handleBulkAddToCart} disabled={selectedItems.size === 0}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add Selected to Cart
              </Button>
            </div>
          </CardFooter>
        </Card>

      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={handleCloseAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Enter the details of the new item to add to your pantry.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddItemSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  className="col-span-3"
                  required
                  min="1"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  value={newItem.category}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expiry" className="text-right">
                  Expiry Date
                </Label>
                <Input
                  id="expiry"
                  type="date"
                  value={newItem.expiry || ''}
                  onChange={(e) => setNewItem({ ...newItem, expiry: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Inventory Dialog */}
      <Dialog open={showUpdateInventoryDialog} onOpenChange={setShowUpdateInventoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
            <DialogDescription>
              Scan items or manually update quantities
            </DialogDescription>
          </DialogHeader>
          
          {/* Add barcode scanner */}
          <div className="mb-4">
            <PantryBarcodeScanner onAddPantryItem={(item) => {
              addPantryItem(item);
            }} />
          </div>
          
          <div className="text-center text-sm text-muted-foreground mb-4">
            - or update quantities manually -
          </div>
          
          <div className="space-y-4 py-4">
            {pantryItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-slate-50">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDecreaseQuantity(item.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleIncreaseQuantity(item.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUpdateInventoryDialog(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expiring Items Dialog */}
      <Dialog open={showExpiringDialog} onOpenChange={setShowExpiringDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Expiring Items</DialogTitle>
            <div className="flex items-center justify-between mt-4">
              <Select 
                value={expiryTimeframe.toString()} 
                onValueChange={(value) => setExpiryTimeframe(parseInt(value))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Within 24 hours</SelectItem>
                  <SelectItem value="3">Within 3 days</SelectItem>
                  <SelectItem value="7">Within a week</SelectItem>
                  <SelectItem value="14">Within 2 weeks</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkAddToCart}
                disabled={selectedItems.size === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add Selected to Cart
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([category, items]) => {
              const expiringItems = items.filter(item => {
                const daysUntilExpiry = getDaysUntilExpiry(item.expiry);
                return daysUntilExpiry !== null && daysUntilExpiry <= expiryTimeframe && daysUntilExpiry > 0;
              });
              
              if (expiringItems.length === 0) return null;
              
              return (
                <div key={category}>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    {categoryIcons[category]}
                    {category}
                    <Badge variant="outline">{expiringItems.length}</Badge>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortItems(expiringItems).map((item) => {
                      const daysUntilExpiry = getDaysUntilExpiry(item.expiry);
                      return (
                        <Card 
                          key={item.id}
                          className={`shadow-sm ${
                            selectedItems.has(item.id) ? 'ring-2 ring-primary' : ''
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={selectedItems.has(item.id)}
                                  onCheckedChange={(checked: boolean) => {
                                    const newSelected = new Set(selectedItems);
                                    if (checked) {
                                      newSelected.add(item.id);
                                    } else {
                                      newSelected.delete(item.id);
                                    }
                                    setSelectedItems(newSelected);
                                  }}
                                />
                                <div>
                                  <h4 className="font-medium">{item.name}</h4>
                                  <p className={`text-sm ${
                                    daysUntilExpiry !== null && daysUntilExpiry <= 1 ? 'text-red-500' : 
                                    daysUntilExpiry !== null && daysUntilExpiry <= 3 ? 'text-amber-500' : 
                                    'text-muted-foreground'
                                  }`}>
                                    Expires in {daysUntilExpiry} days
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddToShoppingList(item)}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Add to List
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  Used
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Shopping List Dialog */}
      <Dialog open={showShoppingListDialog} onOpenChange={setShowShoppingListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Shopping List</DialogTitle>
            <DialogDescription>Customize your shopping list items</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Shopping List</Label>
              <Select value={selectedShoppingList} onValueChange={setSelectedShoppingList}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a list" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default List</SelectItem>
                  <SelectItem value="weekly">Weekly Shopping</SelectItem>
                  <SelectItem value="monthly">Monthly Stock-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity to Add</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddToCartQuantity(Math.max(1, addToCartQuantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={addToCartQuantity}
                  onChange={(e) => setAddToCartQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddToCartQuantity(addToCartQuantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                placeholder="e.g., Prefer organic, specific brand, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select defaultValue="normal">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High - Need ASAP</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low - When convenient</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShoppingListDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Implement add to cart with all selected options
              setShowShoppingListDialog(false);
              console.log(`${addToCartQuantity} items added to ${selectedShoppingList} list`);
            }}>
              Add to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
} 