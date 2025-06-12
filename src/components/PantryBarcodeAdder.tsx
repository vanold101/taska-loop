import { useState } from "react";
import { ScannedItem } from "./BarcodeScannerButton";
import BarcodeScannerButton from "./BarcodeScannerButton";
import ProductDetails from "./ProductDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  expiry: string;
  category: string;
  lowStock: boolean;
}

interface PantryBarcodeAdderProps {
  onAddPantryItem: (item: PantryItem) => void;
}

// Common food categories with mapping from Open Food Facts categories
const CATEGORY_MAPPING: Record<string, string> = {
  'dairy': 'Dairy',
  'milk': 'Dairy',
  'cheese': 'Dairy',
  'yogurt': 'Dairy',
  'eggs': 'Dairy',
  'meat': 'Meat',
  'poultry': 'Meat',
  'fish': 'Seafood',
  'seafood': 'Seafood',
  'fruit': 'Produce',
  'vegetable': 'Produce',
  'produce': 'Produce',
  'bakery': 'Bakery',
  'bread': 'Bakery',
  'pastry': 'Bakery',
  'pasta': 'Pantry',
  'rice': 'Pantry',
  'cereal': 'Pantry',
  'canned': 'Pantry',
  'spice': 'Pantry',
  'sauce': 'Pantry',
  'oil': 'Pantry',
  'snack': 'Snacks',
  'candy': 'Snacks',
  'chocolate': 'Snacks',
  'beverage': 'Beverages',
  'drink': 'Beverages',
  'juice': 'Beverages',
  'soda': 'Beverages',
  'water': 'Beverages',
  'alcohol': 'Beverages',
  'frozen': 'Frozen',
  'ice cream': 'Frozen',
  'pizza': 'Frozen',
  'cleaning': 'Household',
  'paper': 'Household',
  'household': 'Household'
};

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

const PantryBarcodeAdder = ({ onAddPantryItem }: PantryBarcodeAdderProps) => {
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [expiry, setExpiry] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('Pantry');
  const { toast } = useToast();

  // Determine category from Open Food Facts category data
  const determineCategoryFromProduct = (product: ScannedItem): string => {
    if (!product.category) return 'Pantry'; // Default
    
    const lowerCategory = product.category.toLowerCase();
    
    // Try to find a matching category
    for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
      if (lowerCategory.includes(key)) {
        return value;
      }
    }
    
    // If no match, return default
    return 'Pantry';
  };

  const handleBarcodeScan = (item: ScannedItem) => {
    console.log("Scanned item:", item);
    
    setScannedProduct(item);
    setIsProductDrawerOpen(true);
    setQuantity(1);
    
    // Set expiry date to 2 weeks from now as a reasonable default
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    setExpiry(twoWeeksFromNow.toISOString().split('T')[0]);
    
    // Try to determine category from product data
    const detectedCategory = determineCategoryFromProduct(item);
    setCategory(detectedCategory);
    
    toast({
      title: "Product Scanned",
      description: `Found: ${item.name || item.upc}`,
    });
  };

  const handleAddToPantry = () => {
    if (!scannedProduct) return;
    
    // Validate item data
    if (!scannedProduct.name && !scannedProduct.upc) {
      toast({
        title: "Invalid Item",
        description: "The scanned item doesn't have enough information.",
        variant: "destructive"
      });
      return;
    }
    
    const newItem: PantryItem = {
      id: Date.now().toString(),
      name: scannedProduct.name || `Product (${scannedProduct.upc})`,
      quantity,
      expiry,
      category,
      lowStock: quantity <= 1
    };
    
    onAddPantryItem(newItem);
    
    toast({
      title: "Item Added to Pantry",
      description: `${newItem.name} has been added to your pantry.`,
    });
    
    resetForm();
  };

  const resetForm = () => {
    setScannedProduct(null);
    setQuantity(1);
    setExpiry(new Date().toISOString().split('T')[0]);
    setCategory('Pantry');
    setIsProductDrawerOpen(false);
  };

  return (
    <>
      <BarcodeScannerButton
        onItemScanned={handleBarcodeScan}
        buttonText="Scan & Add to Pantry"
        buttonVariant="default"
        buttonSize="default"
        className="w-full mb-2"
      />
      <Drawer open={isProductDrawerOpen} onOpenChange={setIsProductDrawerOpen}>
        <DrawerContent className="max-h-[90vh] overflow-hidden">
          <DrawerHeader className="px-4 py-3 sm:px-6">
            <DrawerTitle className="flex items-center justify-between">
              <span>Add Scanned Product to Pantry</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={resetForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerTitle>
            <DrawerDescription>
              Review and add the scanned product to your pantry
            </DrawerDescription>
          </DrawerHeader>
          {scannedProduct && (
            <div className="px-4 pb-0 sm:px-6 overflow-y-auto">
              <ProductDetails product={scannedProduct} />
              <Card className="mt-4 mb-4">
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Item Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-16 text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      type="date"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between space-x-2 py-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="w-full"
                    onClick={handleAddToPantry}
                  >
                    Add to Pantry
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PantryBarcodeAdder; 