import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, Share, TextInput, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../src/context/AuthContext';

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] = useState(false);
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState('');
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  const [isHouseholdModalVisible, setIsHouseholdModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    avatar: null
  });
  const [householdData, setHouseholdData] = useState({
    name: 'Smith Family',
    members: ['John Doe', 'Jane Doe', 'Kid Doe'],
    inviteCode: 'SMITH2024'
  });
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', type: 'Visa', last4: '1234', expiry: '12/25' },
    { id: '2', type: 'Mastercard', last4: '5678', expiry: '06/26' }
  ]);

  // Load saved settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setIsDarkMode(settings.isDarkMode || false);
        setNotificationsEnabled(settings.notificationsEnabled !== false);
        setLocationEnabled(settings.locationEnabled !== false);
        setBiometricEnabled(settings.biometricEnabled || false);
        setAutoSync(settings.autoSync !== false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (key: string, value: any) => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings') || '{}';
      const settings = JSON.parse(savedSettings);
      settings[key] = value;
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    setIsDarkMode(value);
    saveSettings('isDarkMode', value);
    // Apply dark mode theme
    if (value) {
      // Apply dark theme
      console.log('Dark mode enabled');
    } else {
      // Apply light theme
      console.log('Light mode enabled');
    }
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSettings('notificationsEnabled', value);
    if (value) {
      // Request notification permissions
      Alert.alert('Notifications Enabled', 'You will now receive push notifications for important updates.');
    } else {
      Alert.alert('Notifications Disabled', 'You will no longer receive push notifications.');
    }
  };

  const handleLocationToggle = (value: boolean) => {
    setLocationEnabled(value);
    saveSettings('locationEnabled', value);
    if (value) {
      Alert.alert('Location Enabled', 'Location services are now active for route optimization and nearby features.');
    } else {
      Alert.alert('Location Disabled', 'Location services are now disabled. Some features may not work properly.');
    }
  };

  const handleBiometricToggle = (value: boolean) => {
    setBiometricEnabled(value);
    saveSettings('biometricEnabled', value);
    if (value) {
      Alert.alert('Biometric Login', 'Biometric authentication is now enabled. You can use fingerprint or face ID to log in.');
    } else {
      Alert.alert('Biometric Login', 'Biometric authentication is now disabled.');
    }
  };

  const handleAutoSyncToggle = (value: boolean) => {
    setAutoSync(value);
    saveSettings('autoSync', value);
    if (value) {
      Alert.alert('Auto Sync', 'Your data will now automatically sync across devices.');
    } else {
      Alert.alert('Auto Sync', 'Auto sync is now disabled. You will need to manually sync your data.');
    }
  };

  const handleExportData = async () => {
    try {
      // Create a comprehensive data export
      const exportData = {
        profile: profileData,
        household: householdData,
        paymentMethods: paymentMethods,
        settings: {
          isDarkMode,
          notificationsEnabled,
          locationEnabled,
          biometricEnabled,
          autoSync
        },
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0'
      };

      const fileName = `taska-loop-export-${new Date().toISOString().split('T')[0]}.json`;
      
      // Use cache directory instead of document directory for better permissions
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Export Taska Loop Data'
        });
      } else {
        Alert.alert('Export Complete', `Data exported to: ${filePath}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'There was an error exporting your data. Please try again.');
    }
  };

  const handleClearCache = async () => {
    try {
      // Clear AsyncStorage cache
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_') || key.startsWith('temp_'));
      await AsyncStorage.multiRemove(cacheKeys);
      
      // Clear file system cache with better error handling
      try {
        const cacheDir = `${FileSystem.cacheDirectory}`;
        if (cacheDir) {
          // Check if directory exists and is writable before attempting to delete
          const dirInfo = await FileSystem.getInfoAsync(cacheDir);
          if (dirInfo.exists) {
            await FileSystem.deleteAsync(cacheDir, { idempotent: true });
          }
        }
      } catch (fileSystemError) {
        console.log('File system cache clear failed, but AsyncStorage was cleared:', fileSystemError);
        // Don't fail the entire operation if file system clear fails
      }
      
      Alert.alert('Cache Cleared', 'Cached data has been cleared successfully.');
    } catch (error) {
      console.error('Clear cache error:', error);
      Alert.alert('Cache Clear Failed', 'There was an error clearing the cache. Please try again.');
    }
  };



  const openPrivacyPolicy = () => {
    const privacyUrl = 'https://taska-loop.com/privacy-policy';
    Linking.openURL(privacyUrl).catch(() => {
      Alert.alert('Error', 'Could not open privacy policy. Please visit our website.');
    });
  };

  const openTermsOfService = () => {
    const termsUrl = 'https://taska-loop.com/terms-of-service';
    Linking.openURL(termsUrl).catch(() => {
      Alert.alert('Error', 'Could not open terms of service. Please visit our website.');
    });
  };

  const openSupport = () => {
    const supportUrl = 'https://taska-loop.com/support';
    Linking.openURL(supportUrl).catch(() => {
      Alert.alert('Error', 'Could not open support page. Please visit our website.');
    });
  };

  const shareApp = () => {
    const appUrl = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/app/taska-loop/id123456789'
      : 'https://play.google.com/store/apps/details?id=com.taskaloop.app';
    
    Share.share({
      message: `Check out Taska Loop - the ultimate household management app! Download here: ${appUrl}`,
      title: 'Taska Loop',
      url: appUrl
    });
  };

  const editProfile = () => {
    setIsEditProfileModalVisible(true);
  };

  const householdSettings = () => {
    setIsHouseholdModalVisible(true);
  };

  const openPaymentMethods = () => {
    setIsPaymentModalVisible(true);
  };

  const saveProfile = () => {
    // Save profile data
    Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
    setIsEditProfileModalVisible(false);
  };

  const saveHousehold = () => {
    // Save household data
    Alert.alert('Household Updated', 'Your household settings have been updated successfully.');
    setIsHouseholdModalVisible(false);
  };

  const addPaymentMethod = () => {
    const newPayment = {
      id: Date.now().toString(),
      type: 'New Card',
      last4: '0000',
      expiry: 'MM/YY'
    };
    setPaymentMethods([...paymentMethods, newPayment]);
    Alert.alert('Payment Method Added', 'New payment method has been added.');
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    Alert.alert('Payment Method Removed', 'Payment method has been removed.');
  };



  const handleDeleteAccount = async () => {
    if (deleteAccountConfirmation === 'DELETE') {
      try {
        // Clear all user data
        await AsyncStorage.clear();
        
        // Clear file system data with better error handling
        try {
          const documentDir = FileSystem.documentDirectory;
          if (documentDir) {
            const dirInfo = await FileSystem.getInfoAsync(documentDir);
            if (dirInfo.exists) {
              await FileSystem.deleteAsync(documentDir, { idempotent: true });
            }
          }
        } catch (fileSystemError) {
          console.log('File system clear failed, but AsyncStorage was cleared:', fileSystemError);
          // Don't fail the entire operation if file system clear fails
        }
        
        Alert.alert('Account Deleted', 'Your account has been deleted successfully. The app will now close.');
        setIsDeleteAccountModalVisible(false);
        setDeleteAccountConfirmation('');
        
        // In a real app, you would navigate to login or close the app
        setTimeout(() => {
          // Close app or navigate to login
          console.log('App should close or navigate to login');
        }, 2000);
      } catch (error) {
        console.error('Delete account error:', error);
        Alert.alert('Error', 'There was an error deleting your account. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please type DELETE exactly to confirm account deletion.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your app experience</Text>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={20} color="#007AFF" />
              <Text style={styles.settingTitle}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={20} color="#007AFF" />
              <Text style={styles.settingTitle}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <Text style={styles.settingTitle}>Location Services</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              thumbColor={locationEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="finger-print" size={20} color="#007AFF" />
              <Text style={styles.settingTitle}>Biometric Login</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              thumbColor={biometricEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="sync" size={20} color="#007AFF" />
              <Text style={styles.settingTitle}>Auto Sync</Text>
            </View>
            <Switch
              value={autoSync}
              onValueChange={handleAutoSyncToggle}
              trackColor={{ false: '#E0E0E0', true: '#FFFFFF' }}
              thumbColor={autoSync ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.settingButton} onPress={handleExportData}>
            <View style={styles.settingInfo}>
              <Ionicons name="download" size={20} color="#4CAF50" />
              <Text style={styles.settingTitle}>Export Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton} onPress={handleClearCache}>
            <View style={styles.settingInfo}>
              <Ionicons name="trash" size={20} color="#FF9800" />
              <Text style={styles.settingTitle}>Clear Cache</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity style={styles.settingButton} onPress={editProfile}>
            <View style={styles.settingInfo}>
              <Ionicons name="person" size={20} color="#007AFF" />
              <Text style={styles.settingTitle}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton} onPress={householdSettings}>
            <View style={styles.settingInfo}>
              <Ionicons name="people" size={20} color="#007AFF" />
              <Text style={styles.settingTitle}>Household Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton} onPress={openPaymentMethods}>
            <View style={styles.settingInfo}>
              <Ionicons name="card" size={20} color="#007AFF" />
              <Text style={styles.settingTitle}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton} onPress={logout}>
            <View style={styles.settingInfo}>
              <Ionicons name="log-out" size={20} color="#FF3B30" />
              <Text style={styles.settingTitle}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Support & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Legal</Text>
          
          <TouchableOpacity style={styles.settingButton} onPress={openSupport}>
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle" size={20} color="#007AFF" />
              <Text style={styles.settingTitle}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton} onPress={openPrivacyPolicy}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark" size={20} color="#007AFF" />
              <Text style={styles.settingTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton} onPress={openTermsOfService}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text" size={20} color="#007AFF" />
              <Text style={styles.settingTitle}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* App Sharing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Sharing</Text>
          
          <TouchableOpacity style={styles.settingButton} onPress={shareApp}>
            <View style={styles.settingInfo}>
              <Ionicons name="share" size={20} color="#4CAF50" />
              <Text style={styles.settingTitle}>Share App</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.1.15</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Developer</Text>
            <Text style={styles.infoValue}>Taska Loop Team</Text>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
          <TouchableOpacity 
            style={[styles.settingButton, styles.dangerButton]} 
            onPress={() => setIsDeleteAccountModalVisible(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="warning" size={20} color="#F44336" />
              <Text style={[styles.settingTitle, styles.dangerText]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditProfileModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Full Name"
              value={profileData.name}
              onChangeText={(text) => setProfileData({...profileData, name: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              value={profileData.email}
              onChangeText={(text) => setProfileData({...profileData, email: text})}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Phone"
              value={profileData.phone}
              onChangeText={(text) => setProfileData({...profileData, phone: text})}
              keyboardType="phone-pad"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsEditProfileModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveProfile}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Household Settings Modal */}
      <Modal
        visible={isHouseholdModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsHouseholdModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Household Settings</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Household Name"
              value={householdData.name}
              onChangeText={(text) => setHouseholdData({...householdData, name: text})}
            />
            
            <View style={styles.householdMembers}>
              <Text style={styles.membersTitle}>Members:</Text>
              {householdData.members.map((member, index) => (
                <View key={index} style={styles.memberItem}>
                  <Text style={styles.memberText}>{member}</Text>
                  <TouchableOpacity 
                    style={styles.removeMemberButton}
                    onPress={() => {
                      const newMembers = householdData.members.filter((_, i) => i !== index);
                      setHouseholdData({...householdData, members: newMembers});
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity 
                style={styles.addMemberButton}
                onPress={() => {
                  const newMember = `Member ${householdData.members.length + 1}`;
                  setHouseholdData({
                    ...householdData, 
                    members: [...householdData.members, newMember]
                  });
                }}
              >
                <Ionicons name="add-circle" size={20} color="#4CAF50" />
                <Text style={styles.addMemberText}>Add Member</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inviteCode}>
              <Text style={styles.inviteCodeLabel}>Invite Code:</Text>
              <Text style={styles.inviteCodeValue}>{householdData.inviteCode}</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Ionicons name="copy" size={16} color="#007AFF" />
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsHouseholdModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveHousehold}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Methods Modal */}
      <Modal
        visible={isPaymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Payment Methods</Text>
            
            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.paymentMethodItem}>
                <View style={styles.paymentMethodInfo}>
                  <Ionicons name="card" size={24} color="#007AFF" />
                  <View style={styles.paymentMethodDetails}>
                    <Text style={styles.paymentMethodType}>{method.type}</Text>
                    <Text style={styles.paymentMethodNumber}>•••• {method.last4}</Text>
                    <Text style={styles.paymentMethodExpiry}>Expires {method.expiry}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.removePaymentButton}
                  onPress={() => removePaymentMethod(method.id)}
                >
                  <Ionicons name="trash" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.addPaymentButton}
              onPress={addPaymentMethod}
            >
              <Ionicons name="add-circle" size={20} color="#4CAF50" />
              <Text style={styles.addPaymentButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsPaymentModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={isDeleteAccountModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDeleteAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={48} color="#F44336" />
              <Text style={styles.modalTitle}>Delete Account</Text>
            </View>
            
            <Text style={styles.modalDescription}>
              This action cannot be undone. All your data, including tasks, trips, pantry items, and household information will be permanently deleted.
            </Text>
            
            <TextInput
              style={styles.confirmationInput}
              placeholder="Type DELETE to confirm"
              value={deleteAccountConfirmation}
              onChangeText={setDeleteAccountConfirmation}
              autoCapitalize="characters"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsDeleteAccountModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteButtonText}>Delete Account</Text>
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
  section: {
    margin: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#F44336',
  },
  dangerText: {
    color: '#F44336',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666666',
  },
  infoValue: {
    fontSize: 16,
    color: '#000000',
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
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  confirmationInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    backgroundColor: '#F9F9F9',
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
  deleteButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F44336',
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  // New modal styles
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    color: '#000000',
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
  // Household modal styles
  householdMembers: {
    marginBottom: 16,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  memberText: {
    fontSize: 14,
    color: '#000000',
  },
  removeMemberButton: {
    padding: 4,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginTop: 8,
  },
  addMemberText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '500',
  },
  inviteCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  inviteCodeLabel: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 8,
  },
  inviteCodeValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  copyButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
  },
  // Payment methods modal styles
  paymentMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  paymentMethodNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  paymentMethodExpiry: {
    fontSize: 12,
    color: '#8E8E93',
  },
  removePaymentButton: {
    padding: 8,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  addPaymentButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
});
