import { Toast } from "@/components/ui/toast";

/**
 * Checks if the browser supports camera access through mediaDevices API
 */
export const isCameraSupported = (): boolean => {
  return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
};

/**
 * Type for camera constraints
 */
export interface CameraConstraints {
  facingMode?: 'user' | 'environment';
  width?: number | { min?: number; ideal?: number; max?: number };
  height?: number | { min?: number; ideal?: number; max?: number };
  frameRate?: number | { min?: number; ideal?: number; max?: number };
}

/**
 * Safely accesses the camera with proper error handling
 * @param constraints - Camera constraints
 * @returns Promise with MediaStream or detailed error
 */
export const requestCameraAccess = async (
  constraints: CameraConstraints = { 
    facingMode: 'environment', 
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
): Promise<{ stream: MediaStream | null; error: string | null }> => {
  try {
    // First check if camera is supported
    if (!isCameraSupported()) {
      return {
        stream: null,
        error: "Your browser doesn't support camera access. Try using a modern browser like Chrome, Firefox, or Safari."
      };
    }

    // Try to enumerate devices to check if there's a camera
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      
      if (cameras.length === 0) {
        return {
          stream: null,
          error: "No camera detected on your device."
        };
      }
    } catch (enumError) {
      console.warn("Could not enumerate devices:", enumError);
      // Continue anyway, as some browsers might not allow enumeration without permission
    }

    // Prepare constraints with provided options
    const videoConstraints: MediaTrackConstraints = {};
    
    if (constraints.facingMode) {
      videoConstraints.facingMode = constraints.facingMode;
    }
    
    if (constraints.width) {
      videoConstraints.width = constraints.width;
    }
    
    if (constraints.height) {
      videoConstraints.height = constraints.height;
    }
    
    if (constraints.frameRate) {
      videoConstraints.frameRate = constraints.frameRate;
    }

    // Request camera access with appropriate constraints
    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false
    });

    return { stream, error: null };

  } catch (error: any) {
    console.error("Camera access error:", error);

    // Prepare detailed error message based on error type
    let errorMessage = "Failed to access camera";
    
    switch (error.name) {
      case "NotAllowedError":
        // This error occurs when the user denies permission or the permission was previously denied
        errorMessage = "Camera access was denied. Please grant camera permissions in your browser settings and try again.";
        break;
        
      case "NotFoundError":
        errorMessage = "No camera found or the camera is not accessible.";
        break;
        
      case "NotReadableError":
      case "AbortError":
        errorMessage = "The camera is already in use by another application or tab. Please close other applications using the camera and try again.";
        break;
        
      case "SecurityError":
        errorMessage = "Camera access is blocked by your browser's security settings.";
        break;
        
      case "OverconstrainedError":
        errorMessage = "Could not find a camera that meets the required constraints. Try using different settings.";
        break;
        
      case "TypeError":
        errorMessage = "The camera constraints were invalid. This is a development issue.";
        break;
        
      default:
        errorMessage = `Camera error: ${error.message || "Unknown error"}`;
    }
    
    return { stream: null, error: errorMessage };
  }
};

/**
 * Safely stops a media stream by stopping all tracks
 * @param stream - MediaStream to stop
 */
export const stopMediaStream = (stream: MediaStream | null): void => {
  if (!stream) return;
  
  try {
    stream.getTracks().forEach(track => {
      try {
        track.stop();
      } catch (err) {
        console.warn("Error stopping media track:", err);
      }
    });
  } catch (error) {
    console.error("Error stopping media stream:", error);
  }
};

/**
 * Checks if the device has flash/torch capability
 * @param stream - Active camera stream
 * @returns Promise<boolean> indicating if torch is available
 */
export const checkTorchAvailability = async (stream: MediaStream): Promise<boolean> => {
  try {
    const track = stream.getVideoTracks()[0];
    if (!track) return false;

    // Check if the track supports torch mode
    const capabilities = track.getCapabilities();
    return capabilities.torch === true;
  } catch (error) {
    console.error("Error checking torch availability:", error);
    return false;
  }
};

/**
 * Attempts to toggle torch/flashlight for a video track
 * @param stream - Active camera stream
 * @param turnOn - Whether to turn the torch on or off
 * @returns Promise<boolean> indicating success
 */
export const toggleTorch = async (stream: MediaStream, turnOn: boolean): Promise<boolean> => {
  try {
    const track = stream.getVideoTracks()[0];
    if (!track) return false;
    
    // Check if the track supports torch mode
    const capabilities = track.getCapabilities();
    if (!capabilities || typeof capabilities.torch !== 'boolean') return false;
    
    // Apply torch setting using any to bypass type checking for now
    // This is necessary because torch is a valid constraint in modern browsers
    // but TypeScript definitions might not have been updated
    await track.applyConstraints({ 
      advanced: [{ ['torch' as any]: turnOn }] 
    });
    return true;
  } catch (error) {
    console.error("Error toggling torch:", error);
    return false;
  }
}; 