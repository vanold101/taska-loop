import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface RecurringItem {
  id: string;
  name: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  lastPurchased: string;
  nextPurchase: string;
  quantity: number;
  unit: string;
  isActive: boolean;
  estimatedCost: number;
}

export default function RecurringItemsPage() {
  const router = useRouter();
  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([
    {
      id: '1',
      name: 'Milk',
      category: 'Dairy',
      frequency: 'weekly',
      lastPurchased: '2024-01-08',
      nextPurchase: '2024-01-15',
      quantity: 1,
      unit: 'gallon',
      isActive: true,
      estimatedCost: 4.50
    },
    {
      id: '2',
      name: 'Bread',
      category: 'Bakery',
      frequency: 'weekly',
      lastPurchased: '2024-01-08',
      nextPurchase: '2024-01-15',
      quantity: 2,
      unit: 'loaves',
      isActive: true,
      estimatedCost: 3.00
    },
    {
      id: '3',
      name: 'Toilet Paper',
      category: 'Household',
      frequency: 'monthly',
      lastPurchased: '2024-01-01',
      nextPurchase: '2024-02-01',
      quantity: 1,
      unit: 'pack',
      isActive: true,
      estimatedCost: 12.00
    },
    {
      id: '4',
      name: 'Coffee Beans',
      category: 'Beverages',
      frequency: 'biweekly',
      lastPurchased: '2024-01-01',
      nextPurchase: '2024-01-15',
      quantity: 1,
      unit: 'bag',
      isActive: false,
      estimatedCost: 15.00
    }
  ]);

  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [newItemFrequency, setNewItemFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'>('weekly');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemCost, setNewItemCost] = useState('');

  const categories = ['Produce', 'Dairy', 'Bakery', 'Pantry', 'Meat', 'Seafood', 'Snacks', 'Beverages', 'Frozen', 'Household'];
  const frequencies = [
    { value: 'daily', label: 'Daily', icon: 'calendar' },
    { value: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
    { value: 'biweekly', label: 'Bi-weekly', icon: 'calendar' },
    { value: 'monthly', label: 'Monthly', icon: 'calendar' },
    { value: 'custom', label: 'Custom', icon: 'settings' }
  ];

  const addItem = () => {
    if (newItemName.trim()) {
      const today = new Date();
      const nextPurchaseDate = new Date();
      
      // Calculate next purchase date based on frequency
      switch (newItemFrequency) {
        case 'daily':
          nextPurchaseDate.setDate(today.getDate() + 1);
          break;
        case 'weekly':
          nextPurchaseDate.setDate(today.getDate() + 7);
          break;
        case 'biweekly':
          nextPurchaseDate.setDate(today.getDate() + 14);
          break;
        case 'monthly':
          nextPurchaseDate.setMonth(today.getMonth() + 1);
          break;
        case 'custom':
          nextPurchaseDate.setDate(today.getDate() + 7); // Default to weekly
          break;
      }

      const newItem: RecurringItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        category: newItemCategory,
        frequency: newItemFrequency,
        lastPurchased: today.toISOString().split('T')[0],
        nextPurchase: nextPurchaseDate.toISOString().split('T')[0],
        quantity: newItemQuantity.trim() ? parseFloat(newItemQuantity) : 1,
        unit: newItemUnit.trim() || 'piece',
        isActive: true,
        estimatedCost: newItemCost.trim() ? parseFloat(newItemCost) : 0
      };

      setRecurringItems([...recurringItems, newItem]);
      setNewItemName('');
      setNewItemCategory('Produce');
      setNewItemFrequency('weekly');
      setNewItemQuantity('');
      setNewItemUnit('');
      setNewItemCost('');
      setIsAddItemModalVisible(false);
      Alert.alert('Success', 'Recurring item added successfully!');
    }
  };

  const toggleItemStatus = (itemId: string) => {
    setRecurringItems(recurringItems.map(item => 
      item.id === itemId ? { ...item, isActive: !item.isActive } : item
    ));
  };

  const markAsPurchased = (itemId: string) => {
    const today = new Date();
    const item = recurringItems.find(i => i.id === itemId);
    
    if (item) {
      const nextPurchaseDate = new Date();
      
      // Calculate next purchase date based on frequency
      switch (item.frequency) {
        case 'daily':
          nextPurchaseDate.setDate(today.getDate() + 1);
          break;
        case 'weekly':
          nextPurchaseDate.setDate(today.getDate() + 7);
          break;
        case 'biweekly':
          nextPurchaseDate.setDate(today.getDate() + 14);
          break;
        case 'monthly':
          nextPurchaseDate.setMonth(today.getMonth() + 1);
          break;
        case 'custom':
          nextPurchaseDate.setDate(today.getDate() + 7);
          break;
      }

      setRecurringItems(recurringItems.map(i => 
        i.id === itemId ? { 
          ...i, 
          lastPurchased: today.toISOString().split('T')[0],
          nextPurchase: nextPurchaseDate.toISOString().split('T')[0]
        } : i
      ));
      
      Alert.alert('Success', `${item.name} marked as purchased!`);
    }
  };

  const deleteItem = (itemId: string) => {
    const item = recurringItems.find(i => i.id === itemId);
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setRecurringItems(recurringItems.filter(i => i.id !== itemId));
            Alert.alert('Deleted', 'Item removed successfully!');
          }
        }
      ]
    );
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'calendar';
      case 'weekly': return 'calendar-outline';
      case 'biweekly': return 'calendar';
      case 'monthly': return 'calendar';
      case 'custom': return 'settings';
      default: return 'calendar';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '#F44336';
      case 'weekly': return '#4CAF50';
      case 'biweekly': return '#FF9800';
      case 'monthly': return '#2196F3';
      case 'custom': return '#9C27B0';
      default: return '#666';
    }
  };

  const getDaysUntilNext = (nextPurchase: string) => {
    const today = new Date();
    const nextDate = new Date(nextPurchase);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const getDaysUntilNextColor = (nextPurchase: string) => {
    const today = new Date();
    const nextDate = new Date(nextPurchase);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#F44336';
    if (diffDays <= 2) return '#FF9800';
    return '#4CAF50';
  };

  const totalEstimatedCost = recurringItems
    .filter(item => item.isActive)
    .reduce((sum, item) => sum + item.estimatedCost, 0);

  const overdueItems = recurringItems.filter(item => {
    const today = new Date();
    const nextDate = new Date(item.nextPurchase);
    return nextDate < today && item.isActive;
  });

  const dueSoonItems = recurringItems.filter(item => {
    const today = new Date();
    const nextDate = new Date(item.nextPurchase);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0 && item.isActive;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Recurring Items</Text>
          <Text style={styles.subtitle}>Manage items you buy regularly</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{overdueItems.length}</Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{dueSoonItems.length}</Text>
            <Text style={styles.summaryLabel}>Due Soon</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>${totalEstimatedCost.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Monthly Cost</Text>
          </View>
        </View>

        {/* Add Item Button */}
        <View style={styles.addItemContainer}>
          <TouchableOpacity 
            style={styles.addItemButton}
            onPress={() => setIsAddItemModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addItemText}>Add Recurring Item</Text>
          </TouchableOpacity>
        </View>

        {/* Recurring Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Items ({recurringItems.length})</Text>
          
          {recurringItems.map(item => (
            <View key={item.id} style={[styles.itemCard, !item.isActive && styles.inactiveItem]}>
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, !item.isActive && styles.inactiveText]}>{item.name}</Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                    <Text style={styles.itemQuantity}>{item.quantity} {item.unit}</Text>
                  </View>
                </View>
                
                <View style={styles.itemStatus}>
                  <Switch
                    value={item.isActive}
                    onValueChange={() => toggleItemStatus(item.id)}
                    trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                    thumbColor={item.isActive ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>
              </View>

              <View style={styles.itemDetails}>
                <View style={styles.frequencyInfo}>
                  <Ionicons 
                    name={getFrequencyIcon(item.frequency) as any} 
                    size={16} 
                    color={getFrequencyColor(item.frequency)} 
                  />
                  <Text style={[styles.frequencyText, { color: getFrequencyColor(item.frequency) }]}>
                    {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
                  </Text>
                </View>

                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Last:</Text>
                  <Text style={styles.dateValue}>{item.lastPurchased}</Text>
                </View>

                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Next:</Text>
                  <Text style={[styles.dateValue, { color: getDaysUntilNextColor(item.nextPurchase) }]}>
                    {getDaysUntilNext(item.nextPurchase)}
                  </Text>
                </View>

                <Text style={styles.costText}>${item.estimatedCost.toFixed(2)}</Text>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => markAsPurchased(item.id)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.actionButtonText}>Mark Purchased</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => router.push('/pantry')}
                >
                  <Ionicons name="create" size={20} color="#2196F3" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteItem(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#F44336" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Item Modal */}
      <Modal
        visible={isAddItemModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddItemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Recurring Item</Text>
            
            <TextInput
              style={styles.itemInput}
              placeholder="Item name (required)..."
              placeholderTextColor="#666"
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
            />
            
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.itemInput, { flex: 1, marginRight: 8 }]}
                placeholder="Quantity..."
                placeholderTextColor="#666"
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
                keyboardType="numeric"
              />
              
              <TextInput
                style={[styles.itemInput, { flex: 1, marginLeft: 8 }]}
                placeholder="Unit..."
                placeholderTextColor="#666"
                value={newItemUnit}
                onChangeText={setNewItemUnit}
              />
            </View>

            <TextInput
              style={styles.itemInput}
              placeholder="Estimated cost..."
              placeholderTextColor="#666"
              value={newItemCost}
              onChangeText={setNewItemCost}
              keyboardType="numeric"
            />

            <View style={styles.frequencyContainer}>
              <Text style={styles.frequencyLabel}>Purchase Frequency:</Text>
              <View style={styles.frequencyOptions}>
                {frequencies.map(freq => (
                  <TouchableOpacity
                    key={freq.value}
                    style={[
                      styles.frequencyOption,
                      newItemFrequency === freq.value && styles.frequencyOptionActive
                    ]}
                    onPress={() => setNewItemFrequency(freq.value as any)}
                  >
                    <Ionicons 
                      name={freq.icon as any} 
                      size={16} 
                      color={newItemFrequency === freq.value ? 'white' : '#666'} 
                    />
                    <Text style={[
                      styles.frequencyOptionText,
                      newItemFrequency === freq.value && styles.frequencyOptionTextActive
                    ]}>
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsAddItemModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addItem}
              >
                <Text style={styles.saveButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  addItemContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addItemButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  addItemText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveItem: {
    opacity: 0.6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  inactiveText: {
    color: '#666666',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: 14,
    color: '#666666',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666666',
  },
  itemStatus: {
    marginLeft: 12,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  frequencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  dateInfo: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  costText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  itemInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#000000',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  frequencyContainer: {
    marginBottom: 20,
  },
  frequencyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 12,
  },
  frequencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: '48%',
    justifyContent: 'center',
  },
  frequencyOptionActive: {
    backgroundColor: '#007AFF',
  },
  frequencyOptionText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
    fontWeight: '500',
  },
  frequencyOptionTextActive: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
