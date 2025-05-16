import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScanLine, Camera, X } from "lucide-react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useToast } from "@/hooks/use-toast";

// Define the structure for the scanned item data
export interface ScannedItem {
  upc: string;
  name?: string;
  brand?: string;
  image?: string;
  // Potentially add other fields like description, category etc. from API
}

interface BarcodeScannerButtonProps {
  onItemScanned?: (item: ScannedItem) => void;
  onScan?: (barcode: string) => void; // Alternative prop for direct barcode access
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

// API integration function (as provided by user, with minor adjustments)
async function fetchFromUPCItemDB(upc: string): Promise<Omit<ScannedItem, 'upc'> | null> {
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`);
    // if (!res.ok) { // Basic error check for network issues
    //   console.error(\`API request failed with status: ${res.status}\`);
    //   return null;
    // }
    const data = await res.json();
    if (data.code === "OK" && data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        name: item.title,
        brand: item.brand,
        image: item.images && item.images.length > 0 ? item.images[0] : undefined,
      };
    }
    console.log("UPCItemDB: No items found or error in response", data);
    return null;
  } catch (error) {
    console.error("Error fetching from UPCItemDB:", error);
    return null;
  }
}

const BarcodeScannerButton = ({
  onItemScanned,
  onScan,
  buttonText = "Scan Barcode",
  buttonVariant = "outline",
  buttonSize = "sm",
  className = ""
}: BarcodeScannerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [isProcessingScan, setIsProcessingScan] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen && !cameraActive) {
      const timer = setTimeout(() => {
        setCameraActive(true);
        checkFlashAvailability();
      }, 100);
      return () => clearTimeout(timer);
    } else if (!isOpen && cameraActive) {
      setCameraActive(false);
      setTorchEnabled(false);
    }
  }, [isOpen]);

  const checkFlashAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      if (cameras.length > 0) {
        // Attempt to get a stream to check capabilities, then stop it.
        // This is a bit heavy just to check flash.
        // The `react-qr-barcode-scanner` might not expose the track for this easily.
        // For now, we'll assume if toggleTorch works, flash is available.
        // This part needs careful testing with how `react-qr-barcode-scanner` manages the stream.
        // The library might have its own torch controls.
        // The original code had a `videoRef.current.srcObject` which this library might not populate directly.
        // Let's assume the library handles torch if supported.
        // The component seems to handle torch via constraints.
        // setHasFlash(true); // Optimistically assume or test later.
        // The original `toggleTorch` will implicitly test this.
      }
    } catch (error) {
      console.error('Error checking flash availability:', error);
      setHasFlash(false);
    }
  };

  const handleScanResult = async (error: any, result: any) => {
    if (isProcessingScan) return;

    if (result) {
      setIsProcessingScan(true);
      const scannedCode = result.text;
      
      toast({
        title: "Barcode Detected",
        description: `UPC: ${scannedCode}. Fetching details...`,
      });

      // If onScan prop is provided, call it directly with the raw barcode
      if (onScan) {
        onScan(scannedCode);
        handleClose();
        return;
      }

      // Otherwise, use the UPCItemDB API
      if (onItemScanned) {
        const itemDetails = await fetchFromUPCItemDB(scannedCode);
        
        if (itemDetails) {
          onItemScanned({ upc: scannedCode, ...itemDetails });
          toast({
            title: "Item Found!",
            description: `${itemDetails.name || 'Product'} details fetched.`,
          });
        } else {
          onItemScanned({ upc: scannedCode });
          toast({
            title: "Details Not Found",
            description: `Could not find details for UPC: ${scannedCode}. You can add it manually.`,
            variant: "default" 
          });
        }
      }
      
      handleClose();
    } else if (error && error.name !== 'NotFoundException' && error.name !== 'NotFoundException2') {
      console.error("Barcode scanning error:", error);
      handleCameraError(error);
    }
  };

  const handleCameraError = (error: any) => {
    console.error("Camera error:", error);
    let errorMessage = "Failed to access camera";
    if (error.name === "NotAllowedError") errorMessage = "Camera access denied. Please enable camera permissions.";
    else if (error.name === "NotFoundError") errorMessage = "No camera found on your device.";
    else if (error.name === "NotReadableError") errorMessage = "Camera is already in use.";
    else if (error.name === "OverconstrainedError") errorMessage = "Could not find a suitable camera.";
    else if (error.name === "StreamApiNotSupportedError") errorMessage = "Browser doesn't support camera access.";
    else if (error.message && error.message.includes("Requested device not found")) errorMessage = "Requested camera not found. It might be disconnected or unavailable.";

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
  };

  const toggleTorch = async () => {
    toast({ title: "Torch Control", description: "Torch control is not currently supported with this scanner library.", variant: "default" });
    setHasFlash(false);
  };

  const handleOpenScanner = () => {
    setIsOpen(true);
    setCameraActive(false);
    setIsProcessingScan(false);
    setCameraError(null);
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
              </div>
            ) : (
              <div className="aspect-video bg-black relative rounded-md overflow-hidden">
                {isOpen && cameraActive && (
                  <BarcodeScannerComponent
                    width={"100%"}
                    height={"100%"}
                    onUpdate={handleScanResult}
                    torch={torchEnabled}
                  />
                )}
                {!cameraActive && isOpen && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
                    Starting camera...
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BarcodeScannerButton; 