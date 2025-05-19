import { useState } from "react";
import BarcodeScannerButton from "../components/BarcodeScannerButton";
import { ScannedItem } from "../components/BarcodeScannerButton";
import BarcodeTestingGuide from "../components/BarcodeTestingGuide";
import ProductDetails from "../components/ProductDetails";
import { Button } from "@/components/ui/button";
import BarcodeScannerTests from "@/components/BarcodeScannerTests";
import NavBar from "@/components/NavBar";

const BarcodeTestPage = () => {
  const [scannedProduct, setScannedProduct] = useState<ScannedItem | null>(null);
  const [scanHistory, setScanHistory] = useState<ScannedItem[]>([]);

  const handleItemScanned = (item: ScannedItem) => {
    setScannedProduct(item);
    setScanHistory(prev => [item, ...prev].slice(0, 5)); // Keep last 5 scans
  };

  return (
    <div className="container mx-auto pb-20">
      <header className="py-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end">
          Barcode Scanner Testing
        </h1>
        <p className="text-muted-foreground mt-2">
          Test the barcode scanner with known UPCs to verify product lookups are working correctly.
        </p>
      </header>
      
      <BarcodeScannerTests />
      
      <div className="mt-8 px-4">
        <h3 className="text-xl font-semibold mb-4">Testing Instructions</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Click on any of the sample UPC codes to test if the product lookup API is working</li>
          <li>Or click "Run All Tests" to test all UPCs in sequence</li>
          <li>If a product is found, its details will be displayed below</li>
          <li>To test the barcode scanner in the app, navigate to the Trips or Pantry page and use the Scan button</li>
          <li>The same API lookups used here power the barcode scanner throughout the app</li>
        </ol>
        
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-4 mt-6">
          <h4 className="font-semibold text-amber-800 dark:text-amber-400">Troubleshooting</h4>
          <p className="text-amber-700 dark:text-amber-300 mt-2">
            If product lookups are failing, it could be due to:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2 text-amber-700 dark:text-amber-300">
            <li>Network connectivity issues</li>
            <li>CORS restrictions in your browser</li>
            <li>API rate limiting (try again later)</li>
            <li>The product might not exist in the Open Food Facts database</li>
          </ul>
        </div>
      </div>
      
      <NavBar />
    </div>
  );
};

export default BarcodeTestPage; 