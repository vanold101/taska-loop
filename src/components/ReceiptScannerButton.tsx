import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [stopStream, setStopStream] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Start camera when dialog opens AND camera should be active
  useEffect(() => {
    // Only start camera when dialog is open AND user has explicitly activated the camera
    if (isOpen && cameraActive && !stopStream) {
      // Small delay to ensure the dialog is fully mounted before accessing camera
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, cameraActive, stopStream]);

  const handleCapture = async () => {
    try {
      if (!videoRef.current) return;

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

  const handleCameraError = (error: any) => {
    console.error("Camera error:", error);
    let errorMessage = "Failed to access camera";
    
    if (error.name === "NotAllowedError") {
      errorMessage = "Camera access denied. Please enable camera permissions.";
    } else if (error.name === "NotFoundError") {
      errorMessage = "No camera found on your device.";
    } else if (error.name === "NotReadableError") {
      errorMessage = "Camera is already in use by another application.";
    }
    
    setCameraError(errorMessage);
  };

  const handleClose = () => {
    setStopStream(true);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setTimeout(() => {
      setIsOpen(false);
      setCameraActive(false);
      setTimeout(() => {
        setStopStream(false);
        setCameraError(null);
      }, 300);
    }, 100);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      handleCameraError(error);
    }
  };

  // Handler to open dialog and activate camera together
  const handleOpenScanner = () => {
    // First open the dialog, then activate camera to prevent race conditions
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
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setTorchEnabled(!torchEnabled)}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleClose}
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
                <Button
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  onClick={handleCapture}
                >
                  Capture Receipt
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Position the receipt clearly within the frame and ensure good lighting
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReceiptScannerButton; 