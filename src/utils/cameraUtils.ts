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
 * Check if we have camera permissions
 * @returns Promise with boolean indicating if we have permission
 */
export const hasCameraPermission = async (): Promise<boolean> => {
  try {
    // Only available in secure contexts (HTTPS)
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return result.state === 'granted';
    }
    
    // Fallback for browsers that don't support permissions API
    return false;
  } catch (error) {
    console.warn("Could not check camera permissions:", error);
    return false;
  }
};

/**
 * Safely accesses the camera with proper error handling
 * @param constraints - Camera constraints
 * @param timeoutMs - Maximum time to wait for camera initialization
 * @returns Promise with MediaStream or detailed error
 */
export const requestCameraAccess = async (
  constraints: CameraConstraints = { 
    facingMode: 'environment', 
    width: { ideal: 1280 },
    height: { ideal: 720 }
  },
  timeoutMs = 10000
): Promise<{ stream: MediaStream | null; error: string | null }> => {
  try {
    // First check if camera is supported
    if (!isCameraSupported()) {
      return {
        stream: null,
        error: "Your browser doesn't support camera access. Try using a modern browser like Chrome, Firefox, or Safari."
      };
    }

    // Check for existing permissions
    const hasPermission = await hasCameraPermission();
    console.log(`Camera permission status: ${hasPermission ? 'granted' : 'not granted'}`);

    // Create a camera access promise with timeout
    const cameraPromise = (async () => {
      // Prepare constraints with provided options
      const videoConstraints: MediaTrackConstraints = {
        // On mobile, specifically request the back camera
        facingMode: {
          exact: constraints.facingMode || 'environment'
        }
      };
      
      if (constraints.width) {
        videoConstraints.width = constraints.width;
      }
      
      if (constraints.height) {
        videoConstraints.height = constraints.height;
      }
      
      if (constraints.frameRate) {
        videoConstraints.frameRate = constraints.frameRate;
      }

      // For mobile devices, try with ideal constraints first
      try {
        console.log("Attempting to access camera with constraints:", videoConstraints);
        
        // Request camera access with appropriate constraints
        return await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false
        });
      } catch (constraintError) {
        console.warn("Failed with exact constraints, trying with more flexible settings:", constraintError);
        
        // If that fails, try with more basic constraints (especially for mobile)
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
      }
    })();

    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Camera access timeout")), timeoutMs);
    });

    // Race the camera access against the timeout
    const stream = await Promise.race([cameraPromise, timeoutPromise]) as MediaStream;
    return { stream, error: null };

  } catch (error: any) {
    console.error("Camera access error:", error);

    // Prepare detailed error message based on error type
    let errorMessage = "Failed to access camera";
    const errorDetails = error.message || error.name || String(error);
    
    switch (error.name) {
      case "NotAllowedError":
        // This error occurs when the user denies permission or the permission was previously denied
        errorMessage = "Camera access was denied. Please grant camera permissions in your browser settings and try again.";
        break;
        
      case "NotFoundError":
        errorMessage = "No camera found on your device.";
        break;
        
      case "NotReadableError":
      case "AbortError":
        errorMessage = "The camera is already in use by another application or tab. Please close other applications using the camera and try again.";
        break;
        
      case "SecurityError":
        errorMessage = "Camera access is blocked by your browser's security settings.";
        break;
        
      case "OverconstrainedError":
        errorMessage = "Could not access the camera with the requested settings. Try using different settings.";
        break;
        
      case "TypeError":
        errorMessage = "Invalid camera constraints. Please try again with different settings.";
        break;
        
      default:
        if (error.message === "Camera access timeout") {
          errorMessage = "Camera access timed out. This often happens on mobile devices. Please try again or check your device settings.";
        } else {
          errorMessage = `Camera error: ${errorDetails}`;
        }
    }
    
    // Log detailed error information to help with debugging
    console.error(`Camera error details - Name: ${error.name}, Message: ${error.message}`);
    
    return { stream: null, error: errorMessage };
  }
};

/**
 * Retry camera access with different constraints
 * @param retries - Number of retry attempts
 * @returns Promise with MediaStream or error
 */
export const retryWithDifferentConstraints = async (retries = 3): Promise<{ stream: MediaStream | null; error: string | null }> => {
  const constraints: CameraConstraints[] = [
    // First try: Standard environment-facing camera with HD resolution
    { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
    
    // Second try: Environment-facing camera with lower resolution
    { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
    
    // Last try: Any camera with minimal constraints
    { facingMode: 'environment' }
  ];
  
  let lastError = null;
  
  for (let i = 0; i < Math.min(retries, constraints.length); i++) {
    try {
      console.log(`Camera access attempt ${i+1}/${retries} with constraints:`, constraints[i]);
      const result = await requestCameraAccess(constraints[i]);
      if (result.stream) {
        return result;
      }
      lastError = result.error;
      console.warn(`Attempt ${i+1} failed: ${lastError}`);
    } catch (error) {
      lastError = `Unexpected error: ${error}`;
      console.error(`Attempt ${i+1} error:`, error);
    }
  }
  
  return { stream: null, error: `Failed after ${retries} attempts. ${lastError}` };
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