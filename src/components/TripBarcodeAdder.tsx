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

// Import TripItem interface from TripDetailModal
import { TripItem } from "./TripDetailModal";

interface TripBarcodeAdderProps {
  tripId: string;
  onAddItem: (tripId: string, item: Omit<TripItem, 'id'>) => void;
  buttonText?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  className?: string;
  iconOnly?: boolean;
}

const TripBarcodeAdder = ({ 
  tripId, 
  onAddItem,
  buttonText = "Scan & Add Item",
  buttonVariant = "default",
  buttonSize = "default",
  className = "w-full mb-2",
  iconOnly = false
}: TripBarcodeAdderProps) => {
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<string>("");
  const [unit, setUnit] = useState<string>("ea");
  const { toast } = useToast();

  const handleBarcodeScan = (item: ScannedItem) => {
    setScannedProduct(item);
    setIsProductDrawerOpen(true);
    setQuantity(1);
    setPrice("");
    setUnit(item.quantity || "ea");
    
    // Show success toast
    toast({
      title: "Product Scanned",
      description: `Found: ${item.name || item.upc}`,
    });
  };

  const handleAddToTrip = () => {
    if (!scannedProduct || !tripId) return;
    
    const newItem: Omit<TripItem, 'id'> = {
      name: scannedProduct.name || scannedProduct.upc,
      quantity: quantity,
      price: price ? parseFloat(price) : undefined,
      unit: unit,
      checked: false,
      addedBy: {
        name: "You", 
        avatar: "https://example.com/you.jpg"
      },
      isRecurring: false,
      recurrenceFrequency: null
    };
    
    onAddItem(tripId, newItem);
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to your trip.`,
    });
    resetForm();
  };

  const resetForm = () => {
    setScannedProduct(null);
    setQuantity(1);
    setPrice("");
    setUnit("ea");
    setIsProductDrawerOpen(false);
  };

  return (
    <>
      <BarcodeScannerButton
        onItemScanned={handleBarcodeScan}
        buttonText={iconOnly ? "" : buttonText}
        buttonVariant={buttonVariant}
        buttonSize={buttonSize}
        className={className}
        tripId={tripId}
      />
      <Drawer open={isProductDrawerOpen} onOpenChange={setIsProductDrawerOpen}>
        <DrawerContent className="max-h-[90vh] overflow-hidden">
          <DrawerHeader className="px-4 py-3 sm:px-6">
            <DrawerTitle className="flex items-center justify-between">
              <span>Add Scanned Product to Trip</span>
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
              Review and add the scanned product to your shopping trip
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
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={scannedProduct.name || scannedProduct.upc}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (optional)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter price"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 py-3">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddToTrip}>
                    Add to Trip
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default TripBarcodeAdder; 