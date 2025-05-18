import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScanLine, Camera, X, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useToast } from "@/hooks/use-toast";
import { isCameraSupported as checkCameraSupport, requestCameraAccess, stopMediaStream } from "@/utils/cameraUtils";
import { fetchProductFromOpenFoodFacts } from "@/services/OpenFoodFactsService";
import { fetchWithProxy } from "@/services/ProxyService";

// Define the structure for the scanned item data
export interface ScannedItem {
  upc: string;
  name?: string;
  brand?: string;
  image?: string;
  // Additional fields from Open Food Facts
  category?: string;
  ingredients?: string;
  quantity?: string;
  nutriscore?: string;
  ecoscore?: string;
  novaGroup?: number;
  stores?: string;
  // Potentially add other fields like description, category etc. from API
}

interface BarcodeScannerButtonProps {
  onItemScanned?: (item: ScannedItem) => void;
  onScan?: (barcode: string) => void; // Alternative prop for direct barcode access
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  className?: string;
  tripId?: string; // Add tripId prop to know which trip to add the item to
}

// Add proxy support for UPC lookups to avoid CORS issues
const PROXY_ENABLED = true; // Set to true if you're experiencing CORS issues
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";

// Legacy API integration function - keeping as fallback
async function fetchFromUPCItemDB(upc: string): Promise<Omit<ScannedItem, 'upc'> | null> {
  try {
    console.log(`[UPCItemDB] Fetching data for barcode: ${upc}`);
    
    // Use our proxy service instead of direct fetch
    const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`;
    console.log(`[UPCItemDB] API URL: ${url}`);
    
    // Try with our new proxy service, using allOrigins as preferred strategy
    const data = await fetchWithProxy<any>(url, {}, 'allOrigins');
    
    if (!data) {
      console.error(`[UPCItemDB] Failed to fetch data`);
      return null;
    }
    
    console.log(`[UPCItemDB] API response code: ${data.code}`);
    
    if (data.code === "OK" && data.items && data.items.length > 0) {
      const item = data.items[0];
      console.log(`[UPCItemDB] Product found: ${item.title || 'Unknown title'}`);
      
      const result = {
        name: item.title,
        brand: item.brand,
        image: item.images && item.images.length > 0 ? item.images[0] : undefined,
      };
      
      console.log(`[UPCItemDB] Successfully extracted product details:`, result);
      return result;
    }
    
    console.log("[UPCItemDB] No items found or error in response", data);
    return null;
  } catch (error) {
    console.error("[UPCItemDB] Error fetching from UPCItemDB:", error);
    return null;
  }
}

const BarcodeScannerButton = ({
  onItemScanned,
  onScan,
  buttonText = "Scan Barcode",
  buttonVariant = "outline",
  buttonSize = "sm",
  className = "",
  tripId
}: BarcodeScannerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const [scanStatus, setScanStatus] = useState<string>("Waiting for barcode...");
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<"none" | "detected" | "not_in_db" | "error">("none");
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [scanAttempts, setScanAttempts] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Clean up camera and intervals on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        stopMediaStream(videoRef.current.srcObject as MediaStream);
      }
      
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  // Handle camera activation when dialog opens
  useEffect(() => {
    if (isOpen && !cameraActive) {
      const timer = setTimeout(() => {
        setCameraActive(true);
        setScanStatus("Waiting for barcode...");
        
        // Set up periodic scan attempts feedback
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
        }
        
        scanIntervalRef.current = setInterval(() => {
          setScanAttempts(prev => {
            const newValue = prev + 1;
            // Provide feedback every 5 attempts
            if (newValue % 5 === 0) {
              setScanStatus("Still searching for barcode... Please ensure good lighting and hold steady.");
            }
            return newValue;
          });
        }, 2000); // Check every 2 seconds
      }, 100);
      
      return () => {
        clearTimeout(timer);
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
        }
      };
    } else if (!isOpen && cameraActive) {
      setCameraActive(false);
      setTorchEnabled(false);
      setScanAttempts(0);
      
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    }
  }, [isOpen]);

  const handleScanResult = async (error: any, result: any) => {
    if (isProcessingScan) return;

    const currentTime = Date.now();
    // Allow new scan only after 3 seconds to prevent duplicates
    if (result && (currentTime - lastScanTime > 3000)) {
      setLastScanTime(currentTime);
      setIsProcessingScan(true);
      setScanStatus("Barcode detected! Processing...");
      setDetectedBarcode(result.text);
      setScanResult("detected");
      
      // Stop the scan attempts indicator
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      
      const scannedCode = result.text;
      console.log(`[Scanner] Barcode detected: ${scannedCode}`);
      
      toast({
        title: "Barcode Detected",
        description: `UPC: ${scannedCode}. Fetching details...`,
      });

      // If onScan prop is provided, call it directly with the raw barcode
      if (onScan) {
        console.log(`[Scanner] Using onScan callback with barcode: ${scannedCode}`);
        onScan(scannedCode);
        handleClose();
        return;
      }

      // Use Open Food Facts API to look up the product
      if (onItemScanned) {
        console.log(`[Scanner] Looking up product details for UPC: ${scannedCode}`);
        
        // Try Open Food Facts API first
        console.log(`[Scanner] Attempting Open Food Facts API lookup`);
        const productDetails = await fetchProductFromOpenFoodFacts(scannedCode);
        
        if (productDetails) {
          // Open Food Facts found the product
          console.log(`[Scanner] Product found in Open Food Facts:`, productDetails);
          setScanStatus("Product found in database!");
          setScanResult("detected");
          onItemScanned({ upc: scannedCode, ...productDetails });
          toast({
            title: "Product Found",
            description: `${productDetails.name || 'Product'} details fetched from Open Food Facts.`,
          });
        } else {
          // Fall back to UPCItemDB if Open Food Facts failed
          console.log(`[Scanner] Open Food Facts lookup failed, trying UPCItemDB`);
          const itemDetails = await fetchFromUPCItemDB(scannedCode);
          
          if (itemDetails) {
            console.log(`[Scanner] Product found in UPCItemDB:`, itemDetails);
            setScanStatus("Product found in alternate database!");
            setScanResult("detected");
            onItemScanned({ upc: scannedCode, ...itemDetails });
            toast({
              title: "Item Found",
              description: `${itemDetails.name || 'Product'} details fetched from alternate source.`,
            });
          } else {
            // No data found from either API
            console.log(`[Scanner] Product not found in any database for UPC: ${scannedCode}`);
            setScanStatus("Barcode detected but not in database");
            setScanResult("not_in_db");
            onItemScanned({ upc: scannedCode });
            toast({
              title: "Details Not Found",
              description: `Could not find details for barcode: ${scannedCode}. You can add it manually.`,
              variant: "default" 
            });
          }
        }
      }
      
      // Keep the dialog open for a moment so the user can see the status
      setTimeout(() => {
        handleClose();
      }, 1500);
    } else if (error && error.name !== 'NotFoundException' && error.name !== 'NotFoundException2') {
      console.error("[Scanner] Barcode scanning error:", error);
      setScanResult("error");
      handleCameraError(error);
    }
  };

  const handleCameraError = (error: any) => {
    console.error("Camera error:", error);
    let errorMessage = "Failed to access camera";
    
    if (error.name === "NotAllowedError") {
      errorMessage = "Camera access denied. Please enable camera permissions in your browser settings and try again.";
    } else if (error.name === "NotFoundError") {
      errorMessage = "No camera found on your device.";
    } else if (error.name === "NotReadableError") {
      errorMessage = "Camera is already in use by another application or tab.";
    } else if (error.name === "OverconstrainedError") {
      errorMessage = "Could not find a suitable camera.";
    } else if (error.name === "SecurityError") {
      errorMessage = "Camera access is blocked by browser security settings.";
    } else if (error.name === "StreamApiNotSupportedError" || !isCameraSupported) {
      errorMessage = "Your browser doesn't support camera access. Try using a modern browser.";
      setIsCameraSupported(false);
    }

    setCameraError(errorMessage);
    setCameraActive(false);
    toast({
      title: "Camera Error",
      description: errorMessage,
      variant: "destructive"
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setCameraActive(false);
    setTorchEnabled(false);
    setIsProcessingScan(false);
    setCameraError(null);
    setScanStatus("Waiting for barcode...");
    setScanAttempts(0);
    setDetectedBarcode(null);
    setScanResult("none");
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const toggleTorch = async () => {
    setTorchEnabled(!torchEnabled);
    toast({ 
      title: "Torch " + (!torchEnabled ? "Enabled" : "Disabled"), 
      description: "Camera light has been " + (!torchEnabled ? "turned on" : "turned off"), 
      variant: "default" 
    });
  };

  const handleOpenScanner = async () => {
    // First check if camera is supported at all
    const cameraSupported = checkCameraSupport();
    if (!cameraSupported) {
      setIsCameraSupported(false);
      setCameraError("Your browser doesn't support camera access. Try using a modern browser like Chrome, Firefox, or Safari.");
      setIsOpen(true);
      return;
    }
    
    setIsOpen(true);
    setCameraActive(false);
    setIsProcessingScan(false);
    setCameraError(null);
    setScanStatus("Waiting for barcode...");
    setScanAttempts(0);
  };

  // Don't render if neither callback is provided
  if (!onItemScanned && !onScan) {
    console.warn('BarcodeScannerButton: Either onItemScanned or onScan prop must be provided');
    return null;
  }

  return (
    <>
      <Button 
        variant={buttonVariant}
        size={buttonSize}
        className={`flex items-center gap-1 ${className}`}
        onClick={handleOpenScanner}
      >
        <ScanLine className="h-4 w-4" />
        {buttonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={(openState) => {
        if (!openState) handleClose();
      }}>
        <DialogContent className="sm:max-w-md p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanLine className="h-4 w-4" />
                Scan Product Barcode
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={toggleTorch}
                  aria-label="Toggle flashlight"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleClose}
                  aria-label="Close scanner"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="relative overflow-hidden rounded-md mt-4">
            {cameraError ? (
              <div className="bg-red-50 dark:bg-red-900/30 p-4 text-red-700 dark:text-red-300 rounded-md text-center">
                <p className="font-medium mb-2">Camera Error</p>
                <p className="text-sm mt-1 mb-3">{cameraError}</p>
                {isCameraSupported && (
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setCameraError(null);
                      setCameraActive(false);
                      setTimeout(() => setCameraActive(true), 50);
                    }}
                  >
                    Retry Camera
                  </Button>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-black relative rounded-md overflow-hidden">
                {isOpen && cameraActive && isCameraSupported && (
                  <BarcodeScannerComponent
                    width={"100%"}
                    height={"100%"}
                    onUpdate={handleScanResult}
                    torch={torchEnabled}
                    // The scanRate prop is not supported, so we'll use the default scanning rate
                    onError={(error) => {
                      console.error("BarcodeScannerComponent error:", error);
                      handleCameraError(error);
                    }}
                  />
                )}
                {!cameraActive && isOpen && !cameraError && isCameraSupported && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
                    Starting camera...
                  </div>
                )}
                {/* Add scanning animation overlay */}
                {cameraActive && !cameraError && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 opacity-70 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-2 border-white/30 rounded-lg"></div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className={`mt-4 p-3 rounded-md text-sm ${
            scanResult === "none" ? "bg-gray-100 dark:bg-gray-800" : 
            scanResult === "detected" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" :
            scanResult === "not_in_db" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" :
            "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {scanResult === "none" && <AlertCircle className="h-4 w-4" />}
              {scanResult === "detected" && <CheckCircle2 className="h-4 w-4" />}
              {scanResult === "not_in_db" && <AlertCircle className="h-4 w-4" />}
              {scanResult === "error" && <XCircle className="h-4 w-4" />}
              <p className="font-medium">{scanStatus}</p>
            </div>
            {detectedBarcode && (
              <div className="text-xs mt-1 font-mono bg-black/10 dark:bg-white/10 p-1 rounded">
                UPC: {detectedBarcode}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BarcodeScannerButton; 