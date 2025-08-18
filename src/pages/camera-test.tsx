import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'expo-camera';

export default function CameraTestPage() {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Check camera permissions on component mount
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      
      // Request camera permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        setCameraError('Camera permission denied. Please enable camera access in your device settings.');
        return;
      }

      setHasPermission(true);
      setCameraActive(true);
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Failed to start camera');
    }
  };

  const stopCamera = () => {
    setCameraActive(false);
    setCameraError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Camera Test Page</h1>
        
        <div className="space-y-6">
          {/* Camera Controls */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={startCamera} 
              disabled={cameraActive}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Camera
            </Button>
            <Button 
              onClick={stopCamera} 
              disabled={!cameraActive}
              variant="destructive"
            >
              Stop Camera
            </Button>
          </div>

          {/* Camera Status */}
          <div className="text-center">
            <p className="text-lg">
              Status: {cameraActive ? 'Active' : 'Inactive'}
            </p>
            {cameraError && (
              <p className="text-red-600 mt-2">{cameraError}</p>
            )}
          </div>

          {/* Camera View */}
          {cameraActive && !cameraError && hasPermission && (
            <div className="relative overflow-hidden w-full aspect-video bg-black rounded-lg">
              <Camera
                style={{ width: '100%', height: '100%' }}
                type={Camera.Constants.Type.back}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 text-white px-4 py-2 rounded">
                  Camera is active - Point camera at objects
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">How to Test:</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "Start Camera" to activate your device's camera</li>
              <li>Allow camera permissions when prompted by your browser</li>
              <li>You should see the camera feed in the video element above</li>
              <li>Click "Stop Camera" to deactivate the camera</li>
            </ol>
            
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This test requires HTTPS in production or localhost for development. 
                Make sure your browser supports the MediaDevices API.
              </p>
            </div>
          </div>

          {/* Browser Support Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Browser Support:</h2>
            <ul className="space-y-2">
              <li>✅ Chrome 53+ (Desktop & Mobile)</li>
              <li>✅ Firefox 36+ (Desktop & Mobile)</li>
              <li>✅ Safari 11+ (Desktop & Mobile)</li>
              <li>✅ Edge 12+ (Desktop)</li>
              <li>❌ Internet Explorer (Not supported)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
