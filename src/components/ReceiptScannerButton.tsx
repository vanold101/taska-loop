import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  isCameraSupported as checkCameraSupport, 
  requestCameraAccess, 
  stopMediaStream,
  toggleTorch,
  checkTorchAvailability 
} from "@/utils/cameraUtils";

// Add ImageCapture type definition
declare global {
  interface Window {
    ImageCapture: {
      new (track: MediaStreamTrack): {
        takePhoto(): Promise<Blob>;
      };
    };
  }
}

interface ReceiptScannerButtonProps {
  onScan: (items: { name: string; price: number; quantity: number }[]) => void;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const ReceiptScannerButton = ({
  onScan,
  buttonText = "Scan Receipt",
  buttonVariant = "outline",
  buttonSize = "sm",
  className = ""
}: ReceiptScannerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopMediaStream(cameraStream);
    };
  }, [cameraStream]);

  // Start camera when dialog opens AND camera should be active
  useEffect(() => {
    // Only start camera when dialog is open AND user has explicitly activated the camera
    if (isOpen && cameraActive && !cameraError) {
      // Small delay to ensure the dialog is fully mounted before accessing camera
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, cameraActive, cameraError]);

  const handleCapture = async () => {
    try {
      if (!videoRef.current || !cameraStream) return;

      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else throw new Error('Failed to create image from canvas');
        }, 'image/jpeg', 0.95);
      });
      
      // Here we would normally send the blob to a receipt OCR service
      // For now, we'll simulate a successful scan with mock data
      const mockItems = [
        { name: "Milk", price: 3.99, quantity: 1 },
        { name: "Bread", price: 2.49, quantity: 1 },
        { name: "Eggs", price: 4.99, quantity: 1 }
      ];
      
      onScan(mockItems);
      handleClose();
      
      toast({
        title: "Receipt Scanned",
        description: "Successfully processed receipt with 3 items",
      });
    } catch (error) {
      console.error("Error capturing image:", error);
      toast({
        title: "Scan Failed",
        description: "Failed to process receipt. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCameraError = (errorMessage: string) => {
    console.error("Camera error:", errorMessage);
    setCameraError(errorMessage);
    setCameraActive(false);
    
    toast({
      title: "Camera Error",
      description: errorMessage,
      variant: "destructive"
    });
  };

  const handleClose = () => {
    stopMediaStream(cameraStream);
    setCameraStream(null);
    setIsOpen(false);
    setCameraActive(false);
    setTorchEnabled(false);
    setCameraError(null);
  };

  const startCamera = async () => {
    // 1. First check if browser supports camera API
    const cameraSupported = checkCameraSupport();
    if (!cameraSupported) {
      setIsCameraSupported(false);
      handleCameraError("Your browser doesn't support camera access. Try using a modern browser like Chrome, Firefox, or Safari.");
      return;
    }
    
    // 2. Request camera access with proper error handling
    const { stream, error } = await requestCameraAccess({
      facingMode: 'environment',
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    });
    
    if (error) {
      handleCameraError(error);
      return;
    }
    
    if (stream && videoRef.current) {
      // Save stream to state for later cleanup
      setCameraStream(stream);
      
      // Set video source to camera stream
      videoRef.current.srcObject = stream;
      
      try {
        // Start playing the video
        await videoRef.current.play();
        
        // Check if torch is available
        const torchAvailable = await checkTorchAvailability(stream);
        setHasTorch(torchAvailable);
      } catch (playError) {
        console.error("Error playing video:", playError);
        handleCameraError("Failed to start video stream. Please try again.");
        stopMediaStream(stream);
      }
    }
  };

  const handleToggleTorch = async () => {
    if (!hasTorch || !cameraStream) {
      toast({
        title: "Torch Unavailable",
        description: "Torch control is not available on this device or browser.",
        variant: "default"
      });
      return;
    }
    
    const newTorchState = !torchEnabled;
    const success = await toggleTorch(cameraStream, newTorchState);
    
    if (success) {
      setTorchEnabled(newTorchState);
      toast({
        title: `Torch ${newTorchState ? 'On' : 'Off'}`,
        description: `Camera torch has been turned ${newTorchState ? 'on' : 'off'}.`,
      });
    } else {
      toast({
        title: "Torch Control Failed",
        description: "Failed to toggle torch. It may not be supported on this device.",
        variant: "default"
      });
    }
  };

  // Handler to open dialog and activate camera together
  const handleOpenScanner = () => {
    setIsOpen(true);
    
    // Short delay to ensure dialog is mounted before camera activation
    setTimeout(() => {
      setCameraActive(true);
    }, 100);
  };

  return (
    <>
      <Button 
        variant={buttonVariant}
        size={buttonSize}
        className={`flex items-center gap-1 ${className}`}
        onClick={handleOpenScanner}
      >
        <Receipt className="h-4 w-4" />
        {buttonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) handleClose();
        else setIsOpen(true);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Scan Receipt
              </div>
              <div className="flex gap-2">
                {hasTorch && cameraActive && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={handleToggleTorch}
                    aria-label={torchEnabled ? "Turn off torch" : "Turn on torch"}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
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

          <div className="relative overflow-hidden rounded-md">
            {cameraError ? (
              <div className="bg-red-50 dark:bg-red-900/30 p-4 text-red-700 dark:text-red-300 rounded-md">
                <p className="font-medium">Camera Error</p>
                <p className="text-sm mt-1">{cameraError}</p>
                {isCameraSupported && (
                  <Button 
                    className="mt-3" 
                    size="sm" 
                    onClick={() => {
                      setCameraError(null);
                      setCameraActive(true);
                    }}
                  >
                    Retry
                  </Button>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-black relative rounded-md overflow-hidden">
                {cameraActive && (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2/3 h-1/3 border-2 border-white/30 rounded-lg"></div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                  Position receipt within the frame
                </div>
                {cameraActive && !cameraError && (
                  <Button
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    onClick={handleCapture}
                  >
                    Capture Receipt
                  </Button>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Position the receipt clearly within the frame and ensure good lighting
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReceiptScannerButton; 