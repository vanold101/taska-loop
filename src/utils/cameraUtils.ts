import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';

// Web camera utilities
export const isCameraSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

export const requestCameraAccess = async (constraints: MediaStreamConstraints = {}): Promise<{ stream: MediaStream | null; error: string | null }> => {
  try {
    if (!isCameraSupported()) {
      return { stream: null, error: 'Camera not supported in this browser' };
    }

    const defaultConstraints: MediaStreamConstraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
        ...(constraints.video as any)
      },
      audio: false
    };

    const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
    return { stream, error: null };
  } catch (error: any) {
    console.error('Camera access error:', error);
    let errorMessage = 'Failed to access camera';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Camera access denied. Please allow camera permissions.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera found on this device.';
    } else if (error.name === 'NotSupportedError') {
      errorMessage = 'Camera not supported in this browser.';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Camera is already in use by another application.';
    }
    
    return { stream: null, error: errorMessage };
  }
};

export const stopMediaStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
};

export const retryWithDifferentConstraints = async (fallbackConstraints: MediaStreamConstraints): Promise<{ stream: MediaStream | null; error: string | null }> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
    return { stream, error: null };
  } catch (error: any) {
    return { stream: null, error: error.message || 'Failed to access camera with fallback constraints' };
  }
};

export const toggleTorch = async (stream: MediaStream | null): Promise<boolean> => {
  if (!stream) return false;
  
  try {
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return false;
    
    const capabilities = videoTrack.getCapabilities();
    // Check if torch is supported using type assertion
    if ('torch' in capabilities && capabilities.torch) {
      const settings = videoTrack.getSettings();
      const currentTorch = 'torch' in settings ? settings.torch : false;
      
      // Use type assertion for advanced constraints
      await videoTrack.applyConstraints({
        advanced: [{ torch: !currentTorch } as any]
      });
      return !currentTorch;
    }
    return false;
  } catch (error) {
    console.error('Error toggling torch:', error);
    return false;
  }
};

export const checkTorchAvailability = async (stream: MediaStream | null): Promise<boolean> => {
  if (!stream) return false;
  
  try {
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return false;
    
    const capabilities = videoTrack.getCapabilities();
    // Check if torch is supported using 'in' operator
    return 'torch' in capabilities && !!capabilities.torch;
  } catch (error) {
    return false;
  }
};

export interface CameraSettings {
  type: 'front' | 'back';
  flashMode: 'off' | 'on' | 'auto' | 'torch';
  zoom: number;
}

export interface BarcodeResult {
  data: string;
  type: string;
  bounds?: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
}

export interface ImageResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
}

export class CameraUtils {
  /**
   * Request camera permissions
   */
  static async requestCameraPermissions(): Promise<boolean> {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Request media library permissions
   */
  static async requestMediaLibraryPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Check if camera permissions are granted
   */
  static async hasCameraPermissions(): Promise<boolean> {
    const { status } = await Camera.getCameraPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Check if media library permissions are granted
   */
  static async hasMediaLibraryPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Pick an image from the media library
   */
  static async pickImage(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    mediaTypes?: ImagePicker.MediaTypeOptions;
  }): Promise<ImageResult | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        ...options,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          width: asset.width || 0,
          height: asset.height || 0,
          type: asset.type || undefined,
          fileName: asset.fileName || undefined,
        };
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  }

  /**
   * Take a photo using the camera
   */
  static async takePhoto(options?: {
    quality?: number;
    allowsEditing?: boolean;
    aspect?: [number, number];
  }): Promise<ImageResult | null> {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        ...options,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          width: asset.width || 0,
          height: asset.height || 0,
          type: asset.type || undefined,
          fileName: asset.fileName || undefined,
        };
      }
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  }

  /**
   * Handle barcode scanning result
   */
  static handleBarcodeResult(result: BarCodeScannerResult): BarcodeResult | null {
    if (result.type && result.data) {
      return {
        data: result.data,
        type: result.type,
        bounds: result.bounds,
      };
    }
    return null;
  }

  /**
   * Get default camera settings
   */
  static getDefaultCameraSettings(): CameraSettings {
    return {
      type: 'back',
      flashMode: 'off',
      zoom: 0,
    };
  }

  /**
   * Toggle camera type (front/back)
   */
  static toggleCameraType(currentType: 'front' | 'back'): 'front' | 'back' {
    return currentType === 'back' ? 'front' : 'back';
  }

  /**
   * Toggle flash mode
   */
  static toggleFlashMode(currentMode: 'off' | 'on' | 'auto' | 'torch'): 'off' | 'on' | 'auto' | 'torch' {
    switch (currentMode) {
      case 'off':
        return 'on';
      case 'on':
        return 'auto';
      case 'auto':
        return 'torch';
      case 'torch':
        return 'off';
      default:
        return 'off';
    }
  }

  /**
   * Validate barcode data
   */
  static validateBarcodeData(data: string, type: string): boolean {
    if (!data || data.trim().length === 0) {
      return false;
    }

    // Add specific validation based on barcode type
    switch (type) {
      case BarCodeScanner.Constants.BarCodeType.upc_a:
      case BarCodeScanner.Constants.BarCodeType.upc_e:
        return /^\d{12,13}$/.test(data);
      case BarCodeScanner.Constants.BarCodeType.ean13:
        return /^\d{13}$/.test(data);
      case BarCodeScanner.Constants.BarCodeType.ean8:
        return /^\d{8}$/.test(data);
      case BarCodeScanner.Constants.BarCodeType.code128:
      case BarCodeScanner.Constants.BarCodeType.code39:
        return data.length > 0;
      default:
        return data.length > 0;
    }
  }

  /**
   * Format barcode data for display
   */
  static formatBarcodeData(data: string, type: string): string {
    if (!data) return '';

    // Format based on barcode type
    switch (type) {
      case BarCodeScanner.Constants.BarCodeType.upc_a:
      case BarCodeScanner.Constants.BarCodeType.ean13:
        return data.replace(/(\d{1})(\d{6})(\d{6})/, '$1-$2-$3');
      case BarCodeScanner.Constants.BarCodeType.ean8:
        return data.replace(/(\d{4})(\d{4})/, '$1-$2');
      default:
        return data;
    }
  }

  /**
   * Get barcode type display name
   */
  static getBarcodeTypeName(type: string): string {
    switch (type) {
      case BarCodeScanner.Constants.BarCodeType.upc_a:
        return 'UPC-A';
      case BarCodeScanner.Constants.BarCodeType.upc_e:
        return 'UPC-E';
      case BarCodeScanner.Constants.BarCodeType.ean13:
        return 'EAN-13';
      case BarCodeScanner.Constants.BarCodeType.ean8:
        return 'EAN-8';
      case BarCodeScanner.Constants.BarCodeType.code128:
        return 'Code 128';
      case BarCodeScanner.Constants.BarCodeType.code39:
        return 'Code 39';
      case BarCodeScanner.Constants.BarCodeType.qr:
        return 'QR Code';
      default:
        return type;
    }
  }
} 