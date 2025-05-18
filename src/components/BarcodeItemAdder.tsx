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
import { Plus, Trash, X } from "lucide-react";

interface BarcodeItemAdderProps {
  tripId: string;
  onAddItem: (tripId: string, item: Omit<TripItem, 'id'>) => void;
}

// Import TripItem interface from TripDetailModal instead of redefining it
import { TripItem } from "./TripDetailModal";

const BarcodeItemAdder = ({ tripId, onAddItem }: BarcodeItemAdderProps) => {
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<string>("");
  const { toast } = useToast();

  const handleBarcodeScan = (item: ScannedItem) => {
    setScannedProduct(item);
    setIsProductDrawerOpen(true);
  };

  const handleAddToTrip = () => {
    if (!scannedProduct || !tripId) return;

    const newItem = {
      name: scannedProduct.name || scannedProduct.upc,
      quantity: quantity,
      price: price ? parseFloat(price) : undefined,
      unit: "ea",
      category: scannedProduct.category || "other",
      checked: false,
      addedBy: {
        name: "You", 
        avatar: "https://example.com/you.jpg"
      },
      // Include any additional fields from the TripItem interface
      isRecurring: false,
      recurrenceFrequency: null
    };

    onAddItem(tripId, newItem);
    
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to your trip.`,
    });
    
    // Reset and close drawer
    resetForm();
  };

  const resetForm = () => {
    setScannedProduct(null);
    setQuantity(1);
    setPrice("");
    setIsProductDrawerOpen(false);
  };

  return (
    <>
      <BarcodeScannerButton
        onItemScanned={handleBarcodeScan}
        buttonText="Scan & Add Item"
        buttonVariant="default"
        buttonSize="default"
        className="w-full"
        tripId={tripId}
      />

      <Drawer open={isProductDrawerOpen} onOpenChange={setIsProductDrawerOpen}>
        <DrawerContent className="max-h-[90vh] overflow-hidden">
          <DrawerHeader className="px-4 py-3 sm:px-6">
            <DrawerTitle className="flex items-center justify-between">
              <span>Add Scanned Product</span>
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
              Review and add the scanned product to your trip
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
                    <Label htmlFor="price">Price (optional)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
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
                    onClick={handleAddToTrip}
                  >
                    Add to Trip
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

export default BarcodeItemAdder; 