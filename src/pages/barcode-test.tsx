import { useState } from "react";
import BarcodeScannerButton from "../components/BarcodeScannerButton";
import { ScannedItem } from "../components/BarcodeScannerButton";
import BarcodeTestingGuide from "../components/BarcodeTestingGuide";
import ProductDetails from "../components/ProductDetails";
import { Button } from "@/components/ui/button";

const BarcodeTestPage = () => {
  const [scannedProduct, setScannedProduct] = useState<ScannedItem | null>(null);
  const [scanHistory, setScanHistory] = useState<ScannedItem[]>([]);

  const handleItemScanned = (item: ScannedItem) => {
    setScannedProduct(item);
    setScanHistory(prev => [item, ...prev].slice(0, 5)); // Keep last 5 scans
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Enhanced Barcode Scanner Test</h1>
      
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <Button
          variant="outline" 
          size="sm" 
          onClick={() => window.location.href = '/api-test'}
        >
          Open API Test Tool
        </Button>
      </div>
      
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <BarcodeScannerButton
            onItemScanned={handleItemScanned}
            buttonText="Scan Product"
            buttonVariant="default"
            buttonSize="lg"
            className="w-full sm:w-auto"
          />
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => {
              setScannedProduct(null);
              setScanHistory([]);
            }}
            className="w-full sm:w-auto"
          >
            Clear Results
          </Button>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Scanner Status</h2>
          {!scannedProduct ? (
            <p className="text-muted-foreground">No products scanned yet. Click "Scan Product" to begin.</p>
          ) : (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-4">Last Scanned Product</h3>
              <ProductDetails product={scannedProduct} />
            </div>
          )}
        </div>
      </div>
      
      {scanHistory.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Scan History</h2>
          <div className="space-y-2">
            {scanHistory.map((item, index) => (
              <div 
                key={`${item.upc}-${index}`} 
                className="p-3 bg-white dark:bg-gray-800 border rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{item.name || "Unknown Product"}</div>
                  <div className="text-sm text-muted-foreground font-mono">UPC: {item.upc}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setScannedProduct(item)}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <BarcodeTestingGuide />

      <div className="mt-8 text-sm text-muted-foreground">
        <h3 className="font-medium mb-2">How This Enhanced Scanner Works:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>The scanner now provides clear feedback about barcode detection status</li>
          <li>Different status indicators show if a barcode is detected but not in the database</li>
          <li>Real UPC codes are used for testing with the Open Food Facts database</li>
          <li>Scan history is maintained for easier testing of multiple products</li>
          <li>The UI clearly shows whether product details were found or not</li>
        </ul>
      </div>
    </div>
  );
};

export default BarcodeTestPage; 