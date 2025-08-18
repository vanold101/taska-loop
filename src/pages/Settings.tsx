
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Moon, 
  Sun, 
  Bell, 
  MapPin, 
  Fingerprint, 
  Sync, 
  Download, 
  Trash2, 
  User, 
  Users, 
  CreditCard, 
  HelpCircle, 
  Shield, 
  FileText, 
  Share2, 
  Settings as SettingsIcon,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getCurrentTheme, toggleTheme } from '@/utils/theme';

interface SettingsData {
  darkMode: boolean;
  notifications: boolean;
  location: boolean;
  biometric: boolean;
  autoSync: boolean;
  compactView: boolean;
  ecoMode: boolean;
  language: string;
  timezone: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsData>({
    darkMode: false,
    notifications: true,
    location: true,
    biometric: false,
    autoSync: true,
    compactView: false,
    ecoMode: false,
    language: 'en',
    timezone: 'America/Los_Angeles'
  });

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
    { id: '1', type: 'Visa', last4: '1234', expiry: '12/25', default: true },
    { id: '2', type: 'Mastercard', last4: '5678', expiry: '06/26', default: false }
  ]);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isHouseholdOpen, setIsHouseholdOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Load settings from localStorage on component mount
  useEffect(() => {
    loadSettings();
    loadProfileData();
  }, []);

  // Initialize dark mode state
  useEffect(() => {
    const currentTheme = getCurrentTheme();
    setSettings(prev => ({ ...prev, darkMode: currentTheme === 'dark' }));
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadProfileData = () => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setProfileData(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveSettings = (key: keyof SettingsData, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      
      // Special handling for dark mode
      if (key === 'darkMode') {
        if (value) {
          toggleTheme(); // This will switch to dark mode
        } else {
          toggleTheme(); // This will switch to light mode
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    saveSettings('darkMode', enabled);
    toast({
      title: enabled ? "Dark mode enabled" : "Light mode enabled",
      description: enabled 
        ? "The app will use dark theme to reduce eye strain" 
        : "The app will use light theme for better visibility",
      variant: "default"
    });
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    saveSettings('notifications', enabled);
    
    if (enabled) {
      // Request notification permissions
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast({
              title: "Notifications enabled",
              description: "You will now receive push notifications for important updates.",
              variant: "default"
            });
          } else {
            toast({
              title: "Permission denied",
              description: "Please enable notifications in your browser settings to receive updates.",
              variant: "destructive"
            });
            // Revert the toggle if permission denied
            saveSettings('notifications', false);
          }
        });
      }
    } else {
      toast({
        title: "Notifications disabled",
        description: "You will no longer receive push notifications.",
        variant: "default"
      });
    }
  };

  const handleLocationToggle = (enabled: boolean) => {
    saveSettings('location', enabled);
    
    if (enabled) {
      // Request location permissions
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => {
            toast({
              title: "Location enabled",
              description: "Location services are now active for route optimization and nearby features.",
              variant: "default"
            });
          },
          () => {
            toast({
              title: "Location permission denied",
              description: "Please enable location access in your browser settings.",
              variant: "destructive"
            });
            // Revert the toggle if permission denied
            saveSettings('location', false);
          }
        );
      }
    } else {
      toast({
        title: "Location disabled",
        description: "Location services are now disabled. Some features may not work properly.",
        variant: "default"
      });
    }
  };

  const handleBiometricToggle = (enabled: boolean) => {
    saveSettings('biometric', enabled);
    
    if (enabled) {
      // Check if WebAuthn is supported
      if ('credentials' in navigator) {
        toast({
          title: "Biometric login enabled",
          description: "Biometric authentication is now enabled. You can use fingerprint or face ID to log in.",
          variant: "default"
        });
      } else {
        toast({
          title: "Biometric not supported",
          description: "Your device doesn't support biometric authentication.",
          variant: "destructive"
        });
        // Revert the toggle if not supported
        saveSettings('biometric', false);
      }
    } else {
      toast({
        title: "Biometric login disabled",
        description: "Biometric authentication is now disabled.",
        variant: "default"
      });
    }
  };

  const handleAutoSyncToggle = (enabled: boolean) => {
    saveSettings('autoSync', enabled);
    toast({
      title: enabled ? "Auto sync enabled" : "Auto sync disabled",
      description: enabled 
        ? "Your data will now automatically sync across devices." 
        : "Auto sync is now disabled. You will need to manually sync your data.",
      variant: "default"
    });
  };

  const handleExportData = () => {
    try {
      const exportData = {
        profile: profileData,
        household: householdData,
        paymentMethods: paymentMethods,
        settings: settings,
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `taska-loop-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      toast({
        title: "Data exported",
        description: "Your data has been exported successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClearCache = () => {
    try {
      // Clear localStorage cache
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('cache_') || key.startsWith('temp_'));
      cacheKeys.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      toast({
        title: "Cache cleared",
        description: "Cached data has been cleared successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Clear cache error:', error);
      toast({
        title: "Cache clear failed",
        description: "There was an error clearing the cache. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveProfile = () => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      setIsEditProfileOpen(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveHousehold = () => {
    try {
      localStorage.setItem('householdData', JSON.stringify(householdData));
      setIsHouseholdOpen(false);
      toast({
        title: "Household updated",
        description: "Your household settings have been updated successfully.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your household settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addPaymentMethod = () => {
    const newPayment = {
      id: Date.now().toString(),
      type: 'New Card',
      last4: '0000',
      expiry: 'MM/YY',
      default: false
    };
    setPaymentMethods([...paymentMethods, newPayment]);
    toast({
      title: "Payment method added",
      description: "New payment method has been added.",
      variant: "default"
    });
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    toast({
      title: "Payment method removed",
      description: "Payment method has been removed.",
      variant: "default"
    });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation === 'DELETE') {
      try {
        // Clear all user data
        localStorage.clear();
        sessionStorage.clear();
        
        toast({
          title: "Account deleted",
          description: "Your account has been deleted successfully.",
          variant: "default"
        });
        
        setIsDeleteAccountOpen(false);
        setDeleteConfirmation('');
        
        // Redirect to home page
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (error) {
        toast({
          title: "Delete failed",
          description: "There was an error deleting your account. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Invalid confirmation",
        description: "Please type DELETE exactly to confirm account deletion.",
        variant: "destructive"
      });
    }
  };

  const openExternalLink = (url: string, title: string) => {
    try {
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: "Link error",
        description: `Could not open ${title}. Please visit our website.`,
        variant: "destructive"
      });
    }
  };

  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Taska Loop',
        text: 'Check out Taska Loop - the ultimate household management app!',
        url: window.location.origin
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "Link copied",
        description: "App link has been copied to your clipboard.",
        variant: "default"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Customize your app experience</p>
        </div>

        <Tabs defaultValue="preferences" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  App Preferences
                </CardTitle>
                <CardDescription>Customize how the app looks and behaves</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {settings.darkMode ? <Moon className="h-5 w-5 text-blue-600" /> : <Sun className="h-5 w-5 text-yellow-600" />}
                    <div>
                      <Label htmlFor="dark-mode" className="text-base font-medium">Dark Mode</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Switch between light and dark themes
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={settings.darkMode}
                    onCheckedChange={handleDarkModeToggle}
                  />
                </div>

                <Separator />

                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-green-600" />
                    <div>
                      <Label htmlFor="notifications" className="text-base font-medium">Push Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive important updates and reminders
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={handleNotificationsToggle}
                  />
                </div>

                <Separator />

                {/* Location */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label htmlFor="location" className="text-base font-medium">Location Services</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enable location-based features and route optimization
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="location"
                    checked={settings.location}
                    onCheckedChange={handleLocationToggle}
                  />
                </div>

                <Separator />

                {/* Biometric */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="h-5 w-5 text-purple-600" />
                    <div>
                      <Label htmlFor="biometric" className="text-base font-medium">Biometric Login</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Use fingerprint or face ID for secure login
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="biometric"
                    checked={settings.biometric}
                    onCheckedChange={handleBiometricToggle}
                  />
                </div>

                <Separator />

                {/* Auto Sync */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sync className="h-5 w-5 text-orange-600" />
                    <div>
                      <Label htmlFor="auto-sync" className="text-base font-medium">Auto Sync</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Automatically sync data across devices
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="auto-sync"
                    checked={settings.autoSync}
                    onCheckedChange={handleAutoSyncToggle}
                  />
                </div>

                <Separator />

                {/* Compact View */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SettingsIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label htmlFor="compact-view" className="text-base font-medium">Compact View</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Use a more compact layout for lists and menus
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="compact-view"
                    checked={settings.compactView}
                    onCheckedChange={(enabled) => saveSettings('compactView', enabled)}
                  />
                </div>

                <Separator />

                {/* Eco Mode */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 text-green-600">🌱</div>
                    <div>
                      <Label htmlFor="eco-mode" className="text-base font-medium">Eco-Friendly Mode</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Reduce energy consumption and optimize performance
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="eco-mode"
                    checked={settings.ecoMode}
                    onCheckedChange={(enabled) => saveSettings('ecoMode', enabled)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{profileData.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{profileData.email}</p>
                  </div>
                  <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Edit Profile</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your personal information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={saveProfile}>Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Household Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Household Settings
                </CardTitle>
                <CardDescription>Manage your household and family members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{householdData.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {householdData.members.length} members • Invite code: {householdData.inviteCode}
                    </p>
                  </div>
                  <Dialog open={isHouseholdOpen} onOpenChange={setIsHouseholdOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Manage Household</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Household Settings</DialogTitle>
                        <DialogDescription>Update your household information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="household-name">Household Name</Label>
                          <Input
                            id="household-name"
                            value={householdData.name}
                            onChange={(e) => setHouseholdData({...householdData, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Members</Label>
                          <div className="space-y-2">
                            {householdData.members.map((member, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input value={member} readOnly />
                                <Button variant="outline" size="sm">Edit</Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsHouseholdOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={saveHousehold}>Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>Manage your payment options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{method.type} •••• {method.last4}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Expires {method.expiry}</p>
                      </div>
                      {method.default && <Badge variant="secondary">Default</Badge>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePaymentMethod(method.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addPaymentMethod} className="w-full">
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>Export, backup, and manage your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Download all your data as a JSON file
                    </p>
                  </div>
                  <Button onClick={handleExportData} variant="outline">
                    Export
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Clear Cache</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Remove temporary files and cached data
                    </p>
                  </div>
                  <Button onClick={handleClearCache} variant="outline">
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Support & Legal
                </CardTitle>
                <CardDescription>Get help and view legal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Help & Support</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get help with the app
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => openExternalLink('https://taska-loop.com/support', 'support page')}
                  >
                    Get Help
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Privacy Policy</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      View our privacy policy
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => openExternalLink('https://taska-loop.com/privacy-policy', 'privacy policy')}
                  >
                    View Policy
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Terms of Service</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      View our terms of service
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => openExternalLink('https://taska-loop.com/terms-of-service', 'terms of service')}
                  >
                    View Terms
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Share App</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Share Taska Loop with friends and family
                    </p>
                  </div>
                  <Button onClick={shareApp} variant="outline">
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* App Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  App Information
                </CardTitle>
                <CardDescription>Version and build information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Version</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Build</span>
                  <span className="font-medium">2024.1.15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Developer</span>
                  <span className="font-medium">Taska Loop Team</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="delete-confirmation">
                            Type DELETE to confirm
                          </Label>
                          <Input
                            id="delete-confirmation"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="Type DELETE to confirm"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteAccountOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmation !== 'DELETE'}
                        >
                          Delete Account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
