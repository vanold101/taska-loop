import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function BarcodeTestPage() {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>([]);

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

  const startBarcodeScanning = async () => {
    if (!cameraActive) {
      setCameraError('Camera must be active to start scanning');
      return;
    }

    try {
      setScanning(true);
      console.log('Barcode scanning started - ready to scan');
    } catch (error) {
      console.error('Error setting up barcode detection:', error);
      setCameraError('Failed to initialize barcode detection');
      setScanning(false);
    }
  };

  const stopBarcodeScanning = () => {
    setScanning(false);
  };

  const stopCamera = () => {
    stopBarcodeScanning();
    setCameraActive(false);
    setCameraError(null);
    setLastBarcode(null);
  };

  const clearHistory = () => {
    setScanHistory([]);
    setLastBarcode(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Barcode Scanner Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Camera Controls */}
          <div className="space-y-6">
            {/* Camera Controls */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Camera Controls</h2>
              <div className="flex gap-4 flex-wrap">
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
            </div>

            {/* Barcode Scanning Controls */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Barcode Scanning</h2>
              <div className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <Button 
                    onClick={startBarcodeScanning} 
                    disabled={!cameraActive || scanning}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Start Scanning
                  </Button>
                  <Button 
                    onClick={stopBarcodeScanning} 
                    disabled={!scanning}
                    variant="outline"
                  >
                    Stop Scanning
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-lg">
                    Scanning: {scanning ? 'Active' : 'Inactive'}
                  </p>
                  {cameraError && (
                    <p className="text-red-600 mt-2">{cameraError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Last Scanned Barcode */}
            {lastBarcode && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Last Scanned Barcode</h2>
                <div className="bg-gray-100 p-4 rounded font-mono text-lg break-all">
                  {lastBarcode}
                </div>
                <Button 
                  onClick={clearHistory} 
                  variant="outline" 
                  className="mt-4"
                >
                  Clear History
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Camera View and History */}
          <div className="space-y-6">
            {/* Camera View */}
            {cameraActive && !cameraError && hasPermission && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Camera Feed</h2>
                <div className="relative overflow-hidden w-full aspect-video bg-black rounded-lg">
                  <BarCodeScanner
                    onBarCodeScanned={({ type, data }) => {
                      if (scanning) {
                        console.log('Barcode detected:', data);
                        setLastBarcode(data);
                        setScanHistory(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 scans
                        stopBarcodeScanning();
                      }
                    }}
                    style={{ width: '100%', height: '100%' }}
                    barCodeTypes={[
                      BarCodeScanner.Constants.BarCodeType.upc_a,
                      BarCodeScanner.Constants.BarCodeType.upc_e,
                      BarCodeScanner.Constants.BarCodeType.ean13,
                      BarCodeScanner.Constants.BarCodeType.ean8,
                      BarCodeScanner.Constants.BarCodeType.code128,
                      BarCodeScanner.Constants.BarCodeType.code39,
                      BarCodeScanner.Constants.BarCodeType.qr
                    ]}
                  />
                  {scanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-green-500/80 text-white px-4 py-2 rounded animate-pulse">
                        Scanning for barcodes...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scan History */}
            {scanHistory.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Scan History</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {scanHistory.map((barcode, index) => (
                    <div key={index} className="bg-gray-100 p-3 rounded font-mono text-sm break-all">
                      {barcode}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">How to Test Barcode Scanning:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click "Start Camera" to activate your device's camera</li>
            <li>Allow camera permissions when prompted by your browser</li>
            <li>Click "Start Scanning" to begin barcode detection</li>
            <li>Point your camera at a barcode (UPC, EAN, QR code, etc.)</li>
            <li>The scanner will detect the barcode and display it</li>
            <li>Click "Stop Scanning" to pause detection or "Stop Camera" to close</li>
          </ol>
          
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>Supported Barcode Types:</strong> UPC-A, UPC-E, EAN-13, EAN-8, Code 128, Code 39, QR Code, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 