import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScanLine, Camera, X } from "lucide-react";
import BarcodeScanner from "react-qr-barcode-scanner";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerButtonProps {
  onScan: (data: string) => void;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const BarcodeScannerButton = ({
  onScan,
  buttonText = "Scan Barcode",
  buttonVariant = "outline",
  buttonSize = "sm",
  className = ""
}: BarcodeScannerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stopStream, setStopStream] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (cameraActive) {
      checkFlashAvailability();
    }
  }, [cameraActive]);
  
  useEffect(() => {
    if (isOpen && cameraActive && !stopStream) {
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, cameraActive, stopStream]);

  const checkFlashAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      if (cameras.length > 0) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        setHasFlash('torch' in capabilities);
        track.stop();
      }
    } catch (error) {
      console.error('Error checking flash availability:', error);
      setHasFlash(false);
    }
  };

  const handleScan = (error: any, result: any) => {
    if (result) {
      // Success, got a result
      const scannedCode = result.text;
      onScan(scannedCode);
      
      // Close the modal safely
      handleClose();
      
      toast({
        title: "Barcode Scanned",
        description: `Successfully scanned code: ${scannedCode.substring(0, 15)}${scannedCode.length > 15 ? '...' : ''}`,
      });
    } else if (error) {
      console.error("Barcode scanning error:", error);
      handleCameraError(error);
    }
  };

  const handleCameraError = (error: any) => {
    console.error("Camera error:", error);
    let errorMessage = "Failed to access camera";
    
    if (error.name === "NotAllowedError") {
      errorMessage = "Camera access denied. Please enable camera permissions in your browser settings.";
    } else if (error.name === "NotFoundError") {
      errorMessage = "No camera found on your device. Please ensure you have a working camera.";
    } else if (error.name === "NotReadableError") {
      errorMessage = "Camera is already in use by another application. Please close other apps using the camera.";
    } else if (error.name === "OverconstrainedError") {
      errorMessage = "Could not find a suitable camera. Please try a different one.";
    } else if (error.name === "StreamApiNotSupportedError") {
      errorMessage = "Your browser doesn't support camera access. Please try a different browser.";
    }
    
    setCameraError(errorMessage);
    toast({
      title: "Camera Error",
      description: errorMessage,
      variant: "destructive"
    });
  };

  const handleClose = () => {
    setStopStream(true);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setTorchEnabled(false);
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

        // Check if torch is available on the active track
        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();
        setHasFlash('torch' in capabilities);
      }
    } catch (error) {
      handleCameraError(error);
    }
  };

  const toggleTorch = async () => {
    if (!videoRef.current?.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const videoTrack = stream.getVideoTracks()[0];

    try {
      const capabilities = videoTrack.getCapabilities();
      if ('torch' in capabilities) {
        const newTorchState = !torchEnabled;
        await videoTrack.applyConstraints({
          advanced: [{ torch: newTorchState } as any]
        });
        setTorchEnabled(newTorchState);
      } else {
        throw new Error('Torch not supported');
      }
    } catch (error) {
      console.error("Error toggling torch:", error);
      toast({
        title: "Torch Error",
        description: "Failed to toggle the torch. Your device may not support this feature.",
        variant: "destructive"
      });
    }
  };

  const handleOpenScanner = () => {
    setIsOpen(true);
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
        <ScanLine className="h-4 w-4" />
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
                <ScanLine className="h-4 w-4" />
                Scan Barcode
              </div>
              <div className="flex gap-2">
                {hasFlash && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={toggleTorch}
                  >
                    <Camera className={`h-4 w-4 ${torchEnabled ? 'text-yellow-500' : ''}`} />
                  </Button>
                )}
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
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    <BarcodeScanner
                      width="100%"
                      height="100%"
                      onUpdate={handleScan}
                      onError={handleCameraError}
                      facingMode="environment"
                      stopStream={stopStream}
                      torch={torchEnabled}
                    />
                  </>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2/3 h-1/3 border-2 border-white/30 rounded-lg"></div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                  Position barcode within the frame
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Works with most product and QR codes. Keep your device steady.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BarcodeScannerButton; 