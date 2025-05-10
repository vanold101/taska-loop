import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Product, saveProduct } from "@/services/ProductService";
import { Barcode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UnitSelector from "./UnitSelector";
import { guessUnitForItem } from "@/services/UnitConversionService";

interface BarcodeProductSaveDialogProps {
  barcode: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const BarcodeProductSaveDialog = ({
  barcode,
  isOpen,
  onClose,
  onSave
}: BarcodeProductSaveDialogProps) => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState<number | undefined>(undefined);
  const [productCategory, setProductCategory] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);
  const [productUnit, setProductUnit] = useState("ea"); // Default unit
  const { toast } = useToast();

  // Update the unit when the product name changes
  const updateUnitFromName = (name: string) => {
    if (name.trim()) {
      const suggestedUnit = guessUnitForItem(name);
      setProductUnit(suggestedUnit.id);
    }
  };

  const handleSave = () => {
    if (!productName.trim()) {
      toast({
        title: "Product name required",
        description: "Please enter a name for this product",
        variant: "destructive"
      });
      return;
    }

    // Create new product
    const newProduct: Product = {
      barcode,
      name: productName,
      defaultPrice: productPrice,
      defaultCategory: productCategory || undefined,
      unit: productUnit
    };

    // Save to database
    saveProduct(newProduct);
    
    // Call callback
    onSave(newProduct);
    
    // Reset form and close
    setProductName("");
    setProductPrice(undefined);
    setProductCategory("");
    setProductQuantity(1);
    setProductUnit("ea");
    onClose();
    
    toast({
      title: "Product saved",
      description: `"${productName}" has been added to the product database`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Barcode className="h-5 w-5" />
            Save New Product
          </DialogTitle>
          <DialogDescription>
            Save this product to your database for future scans.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input 
              id="barcode" 
              value={barcode} 
              readOnly 
              className="bg-muted"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="productName">Product Name*</Label>
            <Input 
              id="productName" 
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                updateUnitFromName(e.target.value);
              }}
              placeholder="Enter product name"
              autoFocus
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="productPrice">Default Price (optional)</Label>
            <Input 
              id="productPrice" 
              type="number"
              step="0.01"
              min="0"
              value={productPrice === undefined ? "" : productPrice}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                setProductPrice(value);
              }}
              placeholder="0.00"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="productCategory">Category (optional)</Label>
            <Input 
              id="productCategory" 
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              placeholder="Enter category"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="productUnit">Unit</Label>
            <div className="flex gap-2 items-center">
              <UnitSelector
                itemName={productName}
                quantity={productQuantity}
                unit={productUnit}
                onQuantityChange={setProductQuantity}
                onUnitChange={setProductUnit}
                showConversion={false}
              />
              <span className="text-sm text-muted-foreground">
                Suggested based on product name
              </span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeProductSaveDialog; 