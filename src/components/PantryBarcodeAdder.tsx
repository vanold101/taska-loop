import { useState } from "react";
import { ScannedItem } from "./BarcodeScannerButton";
import BarcodeScannerButton from "./BarcodeScannerButton";
import ProductDetails from "./ProductDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const PantryBarcodeAdder = ({ onAddPantryItem }: PantryBarcodeAdderProps) => {
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [expiry, setExpiry] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('Pantry');
  const { toast } = useToast();

  const handleBarcodeScan = (item: ScannedItem) => {
    setScannedProduct(item);
    setIsProductDrawerOpen(true);
    setQuantity(1);
    setExpiry(new Date().toISOString().split('T')[0]);
    setCategory('Pantry');
  };

  const handleAddToPantry = () => {
    if (!scannedProduct) return;
    const newItem: PantryItem = {
      id: Date.now().toString(),
      name: scannedProduct.name || scannedProduct.upc,
      quantity,
      expiry,
      category,
      lowStock: quantity <= 1
    };
    onAddPantryItem(newItem);
    toast({
      title: "Item Added",
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
                    <Input
                      id="category"
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Pantry, Dairy, Produce, etc."
                    />
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