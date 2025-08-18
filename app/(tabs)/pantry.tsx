import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { fetchProductFromOpenFoodFacts } from '../../src/services/OpenFoodFactsService';
import { findProductByBarcode } from '../../src/services/ProductService';

export default function PantryPage() {
  const [pantryItems, setPantryItems] = useState<Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: string;
    expiry: string | null;
    barcode: string | null;
  }>>([
    { id: '1', name: 'Apples', quantity: 5, unit: 'pieces', category: 'Produce', expiry: '2024-01-20', barcode: null },
    { id: '2', name: 'Milk', quantity: 1, unit: 'gallon', category: 'Dairy', expiry: '2024-01-18', barcode: null },
    { id: '3', name: 'Bread', quantity: 2, unit: 'loaves', category: 'Bakery', expiry: '2024-01-22', barcode: null },
    { id: '4', name: 'Rice', quantity: 3, unit: 'cups', category: 'Pantry', expiry: '2025-01-01', barcode: null },
    { id: '5', name: 'Chicken', quantity: 2, unit: 'lbs', category: 'Meat', expiry: '2024-01-16', barcode: null },
  ]);
  
  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [newItemExpiry, setNewItemExpiry] = useState('');

  // Barcode scanning state
  const [isBarcodeScannerVisible, setIsBarcodeScannerVisible] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<{
    name?: string;
    brand?: string;
    image?: string;
    category?: string;
    ingredients?: string;
    quantity?: string;
  } | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'expiry' | 'category'>('name');

  const categories = ['Produce', 'Dairy', 'Bakery', 'Pantry', 'Meat', 'Seafood', 'Snacks', 'Beverages', 'Frozen', 'Household'];

  // Request camera permission on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (e) {
        setHasPermission(false);
      }
    })();
  }, []);

  const handleBarCodeScanned = async (result: any) => {
    if (result && result.data) {
      const barcode = result.data;
      setScanned(true);
      setScannedBarcode(barcode);
      setIsBarcodeScannerVisible(false);
      setIsScanning(false);
      setIsAddItemModalVisible(true);
      setIsFetchingProduct(true);
      setScannedProduct(null);

      try {
        // Try Open Food Facts first
        const offProduct = await fetchProductFromOpenFoodFacts(barcode);
        if (offProduct) {
          setScannedProduct(offProduct);
          if (offProduct.name && offProduct.name.trim().length > 0) {
            setNewItemName(offProduct.name);
          } else {
            setNewItemName(`Item (${barcode})`);
          }
          // Try to map category heuristically
          if (offProduct.category) {
            const match = categories.find(cat => offProduct.category!.toLowerCase().includes(cat.toLowerCase()));
            if (match) setNewItemCategory(match);
          }
        } else {
          // Fallback to local mock product DB
          const localProduct = findProductByBarcode(barcode);
          if (localProduct) {
            setScannedProduct({ name: localProduct.name, category: localProduct.defaultCategory });
            setNewItemName(localProduct.name);
            if (localProduct.defaultCategory) setNewItemCategory(localProduct.defaultCategory);
          } else {
            setNewItemName(`Item (${barcode})`);
          }
        }
      } catch (e) {
        setNewItemName(`Item (${barcode})`);
      } finally {
        setIsFetchingProduct(false);
      }
    }
  };

  const addItem = () => {
    if (newItemName.trim()) {
      const newItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        quantity: newItemQuantity.trim() ? parseFloat(newItemQuantity) : 1,
        unit: newItemUnit.trim() || 'piece',
        category: newItemCategory,
        expiry: newItemExpiry || null,
        barcode: scannedBarcode || null
      };
      setPantryItems([...pantryItems, newItem]);
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemUnit('');
      setNewItemCategory('Produce');
      setNewItemExpiry('');
      setScannedBarcode('');
      setIsAddItemModalVisible(false);
    }
  };

  const openBarcodeScanner = async () => {
    if (hasPermission === null) {
      Alert.alert('Permission', 'Requesting camera permission...');
      return;
    }
    if (hasPermission === false) {
      Alert.alert('Permission', 'No access to camera');
      return;
    }
    
    setScanned(false);
    setIsBarcodeScannerVisible(true);
    
    // Start scanning after modal is visible
    setTimeout(() => {
      startScanning();
    }, 100);
  };

  const startScanning = async () => {
    // Real scanning is handled by BarCodeScanner component
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const closeScanner = () => {
    stopScanning();
    setIsBarcodeScannerVisible(false);
  };

  const deleteItem = (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setPantryItems(pantryItems.filter(item => item.id !== itemId))
        }
      ]
    );
  };

  const updateItemQuantity = (itemId: string, delta: number) => {
    setPantryItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const nextQty = Math.max(0, (Number(item.quantity) || 0) + delta);
      return { ...item, quantity: nextQty };
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Produce': return 'leaf';
      case 'Dairy': return 'water';
      case 'Bakery': return 'restaurant';
      case 'Pantry': return 'cube';
      case 'Meat': return 'nutrition';
      case 'Seafood': return 'fish';
      case 'Snacks': return 'fast-food';
      case 'Beverages': return 'cafe';
      case 'Frozen': return 'snow';
      case 'Household': return 'home';
      default: return 'cube';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Produce': return '#4CAF50';
      case 'Dairy': return '#2196F3';
      case 'Bakery': return '#FF9800';
      case 'Pantry': return '#9C27B0';
      case 'Meat': return '#F44336';
      case 'Seafood': return '#00BCD4';
      case 'Snacks': return '#FF5722';
      case 'Beverages': return '#795548';
      case 'Frozen': return '#607D8B';
      case 'Household': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const filteredItems = pantryItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategoryFilter || item.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'expiry':
          if (!a.expiry && !b.expiry) return 0;
          if (!a.expiry) return 1;
          if (!b.expiry) return -1;
          return new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Pantry</Text>
          <Text style={styles.subtitle}>Manage your household items</Text>
        </View>

        {/* Add Item Button */}
        <View style={styles.addItemContainer}>
          <TouchableOpacity 
            style={styles.addItemButton}
            onPress={() => setIsAddItemModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addItemText}>Add New Item</Text>
          </TouchableOpacity>
          
          {/* Barcode Scanner Button */}
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={openBarcodeScanner}
          >
            <Ionicons name="scan" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchFilterContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !selectedCategoryFilter && styles.filterChipActive
                ]}
                onPress={() => setSelectedCategoryFilter(null)}
              >
                <Text style={[
                  styles.filterChipText,
                  !selectedCategoryFilter && styles.filterChipTextActive
                ]}>All</Text>
              </TouchableOpacity>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    selectedCategoryFilter === category && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedCategoryFilter(category)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedCategoryFilter === category && styles.filterChipTextActive
                  ]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === 'name' && styles.sortButtonActive
              ]}
              onPress={() => setSortBy('name')}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === 'name' && styles.sortButtonTextActive
              ]}>Name</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === 'expiry' && styles.sortButtonActive
              ]}
              onPress={() => setSortBy('expiry')}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === 'expiry' && styles.sortButtonTextActive
              ]}>Expiry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === 'category' && styles.sortButtonActive
              ]}
              onPress={() => setSortBy('category')}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === 'category' && styles.sortButtonTextActive
              ]}>Category</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pantry Items */}
        <View style={styles.itemsContainer}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="basket-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>No items found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
            </View>
          ) : (
            filteredItems.map(item => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.categoryIconContainer}>
                    <Ionicons 
                      name={getCategoryIcon(item.category) as any} 
                      size={20} 
                      color={getCategoryColor(item.category)} 
                    />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                <View style={styles.itemDetails}>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      style={[styles.qtyButton, styles.qtyMinus]}
                      onPress={() => updateItemQuantity(item.id, -1)}
                    >
                      <Ionicons name="remove" size={18} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.itemQuantity}>
                      {item.quantity} {item.unit}
                    </Text>
                    <TouchableOpacity
                      style={[styles.qtyButton, styles.qtyPlus]}
                      onPress={() => updateItemQuantity(item.id, 1)}
                    >
                      <Ionicons name="add" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  {item.expiry && (
                    <Text style={styles.itemExpiry}>
                      Expires: {item.expiry}
                    </Text>
                  )}
                  {item.barcode && (
                    <Text style={styles.itemBarcode}>
                      Barcode: {item.barcode}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Item Modal */}
      <Modal
        visible={isAddItemModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Item</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsAddItemModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {scannedBarcode && (
              <View style={styles.barcodeInfo}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.barcodeText}>Barcode scanned: {scannedBarcode}</Text>
                <TouchableOpacity
                  style={styles.clearBarcodeButton}
                  onPress={() => setScannedBarcode('')}
                >
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            )}

            {/* Product details from API lookup */}
            {isFetchingProduct ? (
              <View style={styles.productInfo}>
                <Text style={styles.productInfoTitle}>Looking up product details…</Text>
              </View>
            ) : scannedProduct ? (
              <View style={styles.productInfo}>
                {!!scannedProduct.name && (
                  <Text style={styles.productName}>{scannedProduct.name}</Text>
                )}
                {!!scannedProduct.brand && (
                  <Text style={styles.productMeta}>Brand: {scannedProduct.brand}</Text>
                )}
                {!!scannedProduct.quantity && (
                  <Text style={styles.productMeta}>Quantity: {scannedProduct.quantity}</Text>
                )}
                {!!scannedProduct.category && (
                  <Text style={styles.productMeta}>Category: {scannedProduct.category}</Text>
                )}
                {!!scannedProduct.ingredients && (
                  <Text style={styles.productDesc} numberOfLines={3}>
                    {scannedProduct.ingredients}
                  </Text>
                )}
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput
                style={styles.input}
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="Enter item name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.nameRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  value={newItemQuantity}
                  onChangeText={setNewItemQuantity}
                  placeholder="1"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Unit</Text>
                <TextInput
                  style={styles.input}
                  value={newItemUnit}
                  onChangeText={setNewItemUnit}
                  placeholder="piece"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      newItemCategory === category && styles.categoryOptionActive
                    ]}
                    onPress={() => setNewItemCategory(category)}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      newItemCategory === category && styles.categoryOptionTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expiry Date (Optional)</Text>
              <TextInput
                style={styles.input}
                value={newItemExpiry}
                onChangeText={setNewItemExpiry}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={addItem}
            >
              <Text style={styles.saveButtonText}>Add Item</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Barcode Scanner */}
      {isBarcodeScannerVisible && (
        <Modal
          visible={isBarcodeScannerVisible}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <SafeAreaView style={styles.scannerContainer}>
            <View style={styles.scannerHeader}>
              <Text style={styles.scannerTitle}>Scan Barcode</Text>
              <TouchableOpacity
                style={styles.closeScannerButton}
                onPress={closeScanner}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.scannerContent}>
              {hasPermission ? (
                <>
                  <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : ({ type, data }: { type: string; data: string }) => handleBarCodeScanned({ type, data })}
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr', 'upc_a', 'upc_e', 'ean13', 'ean8', 'code128', 'code39']
                    }}
                  />
                  <View style={styles.scanOverlay}>
                    <View style={styles.scanFrame} />
                    <Text style={styles.scanText}>
                      {isScanning ? 'Scanning for barcodes...' : 'Camera ready'}
                    </Text>
                    <Text style={styles.scanSubtext}>
                      {isScanning ? 'Point camera at barcode' : 'Camera access granted'}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.permissionOverlay}>
                  <Ionicons name="camera" size={64} color="white" />
                  <Text style={styles.scanText}>Camera Permission Required</Text>
                  <Text style={styles.scanSubtext}>Please allow camera access to scan barcodes</Text>
                  <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={async () => {
                      const { status } = await Camera.requestCameraPermissionsAsync();
                      setHasPermission(status === 'granted');
                    }}
                  >
                    <Text style={styles.permissionButtonText}>Enable Scanner</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  addItemContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 12,
  },
  addItemButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  addItemText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  itemsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyMinus: {
    backgroundColor: '#FF3B30',
  },
  qtyPlus: {
    backgroundColor: '#34C759',
  },
  itemExpiry: {
    fontSize: 14,
    color: '#FF3B30',
  },
  itemBarcode: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
  },
  searchFilterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#000000',
    marginBottom: 12,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  sortButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sortButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
  },
  sortButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  barcodeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
  },
  barcodeText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  productInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  productInfoTitle: {
    fontSize: 14,
    color: '#666',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  productMeta: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  productDesc: {
    fontSize: 13,
    color: '#444',
    marginTop: 8,
  },
  clearBarcodeButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#000000',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#666',
  },
  categoryOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  closeScannerButton: {
    padding: 8,
  },
  scannerContent: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scanSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  permissionOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    position: 'relative',
  },
});

