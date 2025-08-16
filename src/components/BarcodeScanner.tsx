import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';

interface BarcodeScannerProps {
  isVisible: boolean;
  onClose: () => void;
  onBarcodeScanned: (barcode: string) => void;
}

export default function BarcodeScanner({ isVisible, onClose, onBarcodeScanned }: BarcodeScannerProps) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleManualSubmit = () => {
    if (barcodeInput.trim()) {
      onBarcodeScanned(barcodeInput.trim());
      onClose();
      setBarcodeInput('');
      setIsManualMode(false);
    } else {
      Alert.alert('Error', 'Please enter a barcode number');
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setIsManualMode(false);
    setBarcodeInput('');
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    onBarcodeScanned(data);
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Barcode Scanner</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.content}>
            <Text style={styles.scanText}>Requesting camera permission...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Barcode Scanner</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.content}>
            <Text style={styles.scanText}>No access to camera</Text>
            <Text style={styles.scanSubtext}>Please enable camera permissions in settings</Text>
            <TouchableOpacity 
              style={styles.manualButton}
              onPress={() => setIsManualMode(true)}
            >
              <Text style={styles.manualButtonText}>Enter Barcode Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Barcode Scanner</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.content}>
          {!isManualMode ? (
            <>
              <View style={styles.cameraContainer}>
                <BarCodeScanner
                  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                  style={styles.camera}
                />
                <View style={styles.scanOverlay}>
                  <View style={styles.scanFrame} />
                  <Text style={styles.scanText}>Position barcode within frame</Text>
                  <Text style={styles.scanSubtext}>Camera is active - scanning for barcodes</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.manualButton}
                onPress={() => setIsManualMode(true)}
              >
                <Text style={styles.manualButtonText}>Enter Barcode Manually</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.manualInputArea}>
              <Text style={styles.manualInputLabel}>Enter Barcode Number:</Text>
              <TextInput
                style={styles.barcodeInput}
                placeholder="e.g., 1234567890123"
                placeholderTextColor="#999"
                value={barcodeInput}
                onChangeText={setBarcodeInput}
                keyboardType="numeric"
                autoFocus
              />
              
              <View style={styles.manualButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleScanAgain}
                >
                  <Text style={styles.cancelButtonText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleManualSubmit}
                >
                  <Text style={styles.submitButtonText}>Use Barcode</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scanArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scanText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  scanSubtext: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 5,
  },
  scanNote: {
    color: '#999',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cameraButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  manualButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 40,
  },
  manualButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  manualInputArea: {
    width: '100%',
    alignItems: 'center',
  },
  manualInputLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  barcodeInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    width: '100%',
    textAlign: 'center',
    marginBottom: 20,
  },
  manualButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scanFrame: {
    width: '80%',
    height: '80%',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
  flipButton: {
    padding: 8,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
  },


});
