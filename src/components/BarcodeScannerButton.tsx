import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScanLine, Camera, X, CheckCircle2, AlertCircle, XCircle, Plus } from "lucide-react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useToast } from "@/hooks/use-toast";
import { isCameraSupported as checkCameraSupport, requestCameraAccess, stopMediaStream, retryWithDifferentConstraints, toggleTorch as toggleTorchUtil } from "@/utils/cameraUtils";
import { fetchProductFromOpenFoodFacts } from "@/services/OpenFoodFactsService";
import { fetchWithProxy } from "@/services/ProxyService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
  const [manualBarcodeInput, setManualBarcodeInput] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [isCameraInitializing, setIsCameraInitializing] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

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
        initializeCamera();
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
      setCameraError(null);
      
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    }
  }, [isOpen]);

  // Initialize camera with retry attempts
  const initializeCamera = async () => {
    if (isCameraInitializing) return;
    
    try {
      setIsCameraInitializing(true);
      setCameraError(null);
      setScanStatus("Initializing camera...");
      
      // Use the retry mechanism for more reliable camera access
      const { stream, error } = await retryWithDifferentConstraints();
      
      if (error) {
        console.error("Camera initialization failed:", error);
        setCameraError(error);
        setScanStatus("Camera access failed");
        setCameraActive(false);
        return;
      }
      
      if (stream) {
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
      }
    } catch (err) {
      console.error("Error initializing camera:", err);
      setCameraError(`Error accessing camera: ${err}`);
      setScanStatus("Camera initialization failed");
    } finally {
      setIsCameraInitializing(false);
    }
  };

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
        processScannedBarcode(scannedCode);
      }
    }
  };

  // Separate function to process a barcode (can be called from manual input too)
  const processScannedBarcode = async (barcode: string) => {
    if (!barcode || barcode.trim() === '') return;
    
    setIsProcessingScan(true);
    setScanStatus("Processing barcode...");
    
    try {
      console.log(`[Scanner] Looking up product details for UPC: ${barcode}`);
      
      // Try Open Food Facts API first
      let productInfo = await fetchProductFromOpenFoodFacts(barcode);
      
      if (productInfo && Object.keys(productInfo).length > 0) {
        // We found the product in Open Food Facts
        console.log(`[Scanner] Found product in Open Food Facts: ${productInfo.name || 'Unknown'}`);
        
        onItemScanned?.({
          upc: barcode,
          ...productInfo
        });
        
        toast({
          title: "Product Found",
          description: `Found: ${productInfo.name || barcode} in Open Food Facts database.`,
        });
        
        handleClose();
        return;
      }
      
      console.log(`[Scanner] Product not found in Open Food Facts, trying UPCItemDB...`);
      
      // Try UPC Item DB as fallback
      const upcItemDbResult = await fetchFromUPCItemDB(barcode);
      
      if (upcItemDbResult) {
        // Success with UPC Item DB
        console.log(`[Scanner] Found product in UPCItemDB: ${upcItemDbResult.name || 'Unknown'}`);
        
        onItemScanned?.({
          upc: barcode,
          ...upcItemDbResult
        });
        
        toast({
          title: "Product Found",
          description: `Found: ${upcItemDbResult.name || barcode} in UPCItemDB.`,
        });
        
        handleClose();
        return;
      }
      
      // No results found in either database
      console.log(`[Scanner] Product not found in any database`);
      setScanResult("not_in_db");
      
      // Still add the item, but just with UPC
      onItemScanned?.({
        upc: barcode,
        name: `Item (${barcode})`,
      });
      
      toast({
        title: "Limited Information",
        description: "Product not found in database. Added with barcode only.",
        variant: "default",
      });
      
      handleClose();
      
    } catch (lookupError) {
      console.error("[Scanner] Error looking up product:", lookupError);
      setScanResult("error");
      
      // Still add the item with just the UPC
      onItemScanned?.({
        upc: barcode,
        name: `Item (${barcode})`,
      });
      
      toast({
        title: "Error Looking Up Product",
        description: "Added with barcode only. Network issue or database limitation.",
        variant: "destructive",
      });
      
      handleClose();
    }
  };

  const handleCameraError = (error: any) => {
    console.error("Camera error in scanner component:", error);
    
    // Don't close the dialog, but show a retry option
    setCameraActive(false);
    setCameraError(error.toString());
    setScanStatus("Camera access failed. You can try again or enter a barcode manually.");
    
    // Show manual input option automatically when camera fails
    setShowManualInput(true);
    
    // Show error toast
    toast({
      title: "Camera Error",
      description: "Could not access camera. You can enter a barcode manually or retry.",
      variant: "destructive"
    });
  };
  
  // Handle retry button click
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setCameraError(null);
    initializeCamera();
  };

  const handleClose = () => {
    // Clean up resources and reset state
    if (videoRef.current?.srcObject) {
      stopMediaStream(videoRef.current.srcObject as MediaStream);
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    
    setCameraActive(false);
    setIsProcessingScan(false);
    setScanResult("none");
    setDetectedBarcode(null);
    setScanAttempts(0);
    setCameraError(null);
    setShowManualInput(false);
    setManualBarcodeInput("");
    setIsOpen(false);
  };

  // Toggle torch implementation
  const toggleTorch = async () => {
    if (!videoRef.current?.srcObject) return;
    
    const newTorchStatus = !torchEnabled;
    const success = await toggleTorchUtil(videoRef.current.srcObject as MediaStream, newTorchStatus);
    
    if (success) {
      setTorchEnabled(newTorchStatus);
    } else {
      toast({
        title: "Torch Unavailable",
        description: "Your device doesn't support flash/torch control.",
        variant: "destructive",
      });
    }
  };

  const handleOpenScanner = async () => {
    // Check if browser supports camera
    const supported = checkCameraSupport();
    setIsCameraSupported(supported);
    
    if (!supported) {
      // Just show scanner dialog with manual input option if camera is not supported
      setShowManualInput(true);
      setCameraError("Your browser doesn't support camera access. Please enter the barcode manually.");
    }
    
    // Open the scanner dialog
    setIsOpen(true);
  };
  
  // Handle manual barcode input
  const handleManualBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (manualBarcodeInput.trim() === '') {
      toast({
        title: "Invalid Barcode",
        description: "Please enter a valid barcode.",
        variant: "destructive"
      });
      return;
    }
    
    processScannedBarcode(manualBarcodeInput);
  };
  
  // Toggle manual input visibility
  const toggleManualInput = () => {
    setShowManualInput(!showManualInput);
  };

  // Fix hasFlash detection function
  useEffect(() => {
    const checkFlashAvailability = async () => {
      if (videoRef.current?.srcObject) {
        try {
          const videoTrack = (videoRef.current.srcObject as MediaStream).getVideoTracks()[0];
          if (videoTrack) {
            const capabilities = videoTrack.getCapabilities();
            setHasFlash(capabilities.torch === true);
          }
        } catch (error) {
          console.warn("Failed to check flash capabilities:", error);
          setHasFlash(false);
        }
      }
    };

    if (cameraActive) {
      checkFlashAvailability();
    }
  }, [cameraActive]);

  return (
    <>
      <Button 
        variant={buttonVariant} 
        size={buttonSize} 
        onClick={handleOpenScanner} 
        className={className}
        aria-label={buttonText || "Scan Barcode"}
      >
        {buttonText && <span className="mr-2">{buttonText}</span>}
        <ScanLine className="h-4 w-4" />
      </Button>
      
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {cameraError ? 
                "Camera Error" : 
                detectedBarcode ? 
                  "Barcode Detected!" : 
                  "Scan Barcode"
              }
            </DialogTitle>
          </DialogHeader>
          
          {/* Camera view */}
          {!cameraError && cameraActive && (
            <div className="relative overflow-hidden w-full aspect-square max-h-80 bg-muted rounded-md">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full">
                  <BarcodeScannerComponent
                    width="100%"
                    height="100%"
                    onUpdate={handleScanResult}
                    onError={handleCameraError}
                    torch={torchEnabled}
                  />
                </div>
              </div>
              
              {/* Scanner UI overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5/6 h-1/4 border-2 border-white rounded-lg bg-transparent">
                  <div className="absolute inset-0 flex items-start justify-center mt-1">
                    <div className="bg-black/40 text-white px-2 py-1 text-xs rounded">
                      {scanStatus}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Torch button (if supported) */}
              {hasFlash && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute bottom-4 left-4 bg-white/80"
                  onClick={toggleTorch}
                >
                  {torchEnabled ? "Torch Off" : "Torch On"}
                </Button>
              )}
              
              {/* Close button */}
              <Button
                size="sm"
                variant="outline"
                className="absolute bottom-4 right-4 bg-white/80"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          )}
          
          {/* Camera error state */}
          {cameraError && (
            <div className="space-y-4">
              <div className="bg-destructive/10 p-4 rounded-md text-destructive flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium">Camera Error</p>
                  <p className="text-sm">{cameraError}</p>
                </div>
              </div>
              
              {/* Retry camera button */}
              <Button 
                variant="outline" 
                onClick={handleRetry} 
                className="w-full"
                disabled={isCameraInitializing}
              >
                {isCameraInitializing ? "Initializing..." : "Retry Camera"}
              </Button>
            </div>
          )}
          
          {/* Manual barcode input */}
          {(showManualInput || cameraError) && (
            <form onSubmit={handleManualBarcodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="manual-barcode" className="text-sm font-medium">
                  Enter barcode manually
                </label>
                <div className="flex gap-2">
                  <Input
                    id="manual-barcode"
                    placeholder="e.g., 1234567890"
                    value={manualBarcodeInput}
                    onChange={(e) => setManualBarcodeInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </form>
          )}
          
          {/* Manual input toggle if camera is active */}
          {cameraActive && !showManualInput && !cameraError && (
            <div className="text-center">
              <button 
                onClick={toggleManualInput} 
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Enter barcode manually
              </button>
            </div>
          )}
          
          <div className="text-center text-xs text-muted-foreground mt-2">
            Scan any product barcode to get information
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BarcodeScannerButton; 