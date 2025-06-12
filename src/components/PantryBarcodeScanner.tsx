import { useState } from "react";
import { Button } from "./ui/button";
import { ScanLine, Package, CheckCircle } from "lucide-react";
import BarcodeScannerButton from "./BarcodeScannerButton";
import { ScannedItem } from "./BarcodeScannerButton";
import { toast } from "./ui/use-toast";
import { PantryItem } from "../context/PantryContext";

interface PantryBarcodeScannerProps {
  onAddPantryItem: (item: Omit<PantryItem, 'id'>) => void;
}

const PantryBarcodeScanner = ({ onAddPantryItem }: PantryBarcodeScannerProps) => {
  const [lastScannedItem, setLastScannedItem] = useState<string | null>(null);

  const handleBarcodeScan = (scannedItem: ScannedItem) => {
    // Convert scanned item to pantry item
    const pantryItem: Omit<PantryItem, 'id'> = {
      name: scannedItem.name || `Product (${scannedItem.upc})`,
      quantity: 1,
      expiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
      category: scannedItem.category || 'Pantry',
      lowStock: false
    };

    onAddPantryItem(pantryItem);
    setLastScannedItem(pantryItem.name);
    
    toast({
      title: "✅ Item Added Successfully!",
      description: `${pantryItem.name} has been added to your pantry`,
    });

    // Clear the last scanned item after 3 seconds
    setTimeout(() => setLastScannedItem(null), 3000);
  };

  return (
    <div className="space-y-3">
      <BarcodeScannerButton
        onItemScanned={handleBarcodeScan}
        buttonText="📱 Scan Barcode"
        buttonVariant="default"
        buttonSize="lg"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
      />
      
      {lastScannedItem && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-800 font-medium">
            Just added: {lastScannedItem}
          </span>
        </div>
      )}
    </div>
  );
};

export default PantryBarcodeScanner; 