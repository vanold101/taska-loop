import { useState } from "react";
import BarcodeScannerButton from "../components/BarcodeScannerButton";
import { ScannedItem } from "../components/BarcodeScannerButton";
import BarcodeTestingGuide from "../components/BarcodeTestingGuide";
import ProductDetails from "../components/ProductDetails";
import { Button } from "@/components/ui/button";
import BarcodeScannerTests from "@/components/BarcodeScannerTests";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Camera, Settings, Info, ScanLine } from "lucide-react";

const BarcodeTestPage = () => {
  const [scannedProduct, setScannedProduct] = useState<ScannedItem | null>(null);
  const [scanHistory, setScanHistory] = useState<ScannedItem[]>([]);

  const handleItemScanned = (item: ScannedItem) => {
    setScannedProduct(item);
    setScanHistory(prev => [item, ...prev].slice(0, 5)); // Keep last 5 scans
  };

  return (
    <div className="pb-24">
      <NavBar />
      <div className="container mx-auto px-4 pt-6">
        <header className="py-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end">
            Barcode Scanner Testing
          </h1>
          <p className="text-muted-foreground mt-2">
            Test the barcode scanner with known UPCs and troubleshoot camera issues
          </p>
        </header>
        
        <Tabs defaultValue="test">
          <TabsList className="mb-4">
            <TabsTrigger value="test"><ScanLine className="h-4 w-4 mr-2" /> Test Scanner</TabsTrigger>
            <TabsTrigger value="troubleshoot"><AlertCircle className="h-4 w-4 mr-2" /> Troubleshooting</TabsTrigger>
            <TabsTrigger value="compatibility"><Info className="h-4 w-4 mr-2" /> Compatibility</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test">
            <BarcodeScannerTests />
          </TabsContent>
          
          <TabsContent value="troubleshoot">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                    Common Issues & Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Camera access failed after showing camera briefly</h3>
                    <div className="pl-5 space-y-2">
                      <p><strong>Cause:</strong> This usually happens on mobile when the camera initialization takes too long or fails silently.</p>
                      <p><strong>Solutions:</strong></p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>Make sure you're using <strong>HTTPS</strong> (especially on GitHub Pages)</li>
                        <li>Try refreshing the page and granting camera permissions again</li>
                        <li>Try using a different browser (Chrome works best)</li>
                        <li>Use the manual entry option to add barcodes manually</li>
                      </ul>
                    </div>
                    
                    <h3 className="font-medium text-lg">Camera permissions denied or not appearing</h3>
                    <div className="pl-5 space-y-2">
                      <p><strong>Cause:</strong> Your browser's permission settings may be blocking camera access.</p>
                      <p><strong>Solutions:</strong></p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>Check your browser's site settings (click on the lock/info icon in URL bar)</li>
                        <li>Reset site permissions and try again</li>
                        <li>On iOS, make sure camera access is enabled in Settings</li>
                      </ul>
                    </div>
                    
                    <h3 className="font-medium text-lg">Scanner can't detect barcodes</h3>
                    <div className="pl-5 space-y-2">
                      <p><strong>Cause:</strong> Poor lighting, blurry camera, or barcode quality issues.</p>
                      <p><strong>Solutions:</strong></p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>Ensure good lighting - avoid glare on the barcode</li>
                        <li>Hold your device steady and ensure the barcode is in focus</li>
                        <li>Try moving closer or further from the barcode</li>
                        <li>Enter the barcode manually as a fallback</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="compatibility">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-500" />
                  Device & Browser Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">Best Compatible Browsers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-card border rounded-lg p-3 flex items-center">
                      <div className="bg-green-500/10 p-2 rounded-full mr-3">
                        <Camera className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Google Chrome</p>
                        <p className="text-sm text-muted-foreground">Best overall compatibility</p>
                      </div>
                    </div>
                    <div className="bg-card border rounded-lg p-3 flex items-center">
                      <div className="bg-green-500/10 p-2 rounded-full mr-3">
                        <Camera className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Safari</p>
                        <p className="text-sm text-muted-foreground">Good on iOS/macOS</p>
                      </div>
                    </div>
                    <div className="bg-card border rounded-lg p-3 flex items-center">
                      <div className="bg-green-500/10 p-2 rounded-full mr-3">
                        <Camera className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Firefox</p>
                        <p className="text-sm text-muted-foreground">Good on most devices</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">Manual Entry Option</h3>
                  <p>If camera scanning doesn't work on your device, you can always use the manual barcode entry option:</p>
                  <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>Click the barcode scanner button to open the scanner</li>
                    <li>Click "Enter barcode manually" at the bottom of the dialog</li>
                    <li>Enter the UPC/barcode number</li>
                    <li>Click "Add" to add the item</li>
                  </ol>
                </div>
                
                <Button 
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Return to Previous Page
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BarcodeTestPage; 