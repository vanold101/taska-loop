import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useTutorial } from '../context/TutorialContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { AppLayout } from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import SubscriptionManager from '../components/SubscriptionManager';
import { stripeService } from '../services/stripeService';
import {
  Bell,
  Calculator,
  CalendarDays,
  CreditCard,
  Globe,
  HelpCircle,
  Key,
  ListTodo,
  LogOut,
  MapPin,
  Package,
  Save,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  User,
  Users,
  Mail,
  Phone,
  Edit,
  Clock,
  Crown,
  Star,
  Check,
  Zap,
  ExternalLink,
  Play
} from "lucide-react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Switch } from "../components/ui/switch"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"

export default function ProfilePage() {
  const { user, logout, isAdmin } = useAuth();
  const { currentTier, limits } = useSubscription();
  const { startTutorial } = useTutorial();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast({
        title: "Successfully signed out",
        description: "You have been signed out of your account.",
      });
      navigate('/');
    } catch (error) {
      console.error("Sign out failed:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getTierDisplayInfo = () => {
    switch (currentTier) {
      case 'free':
        return {
          name: 'TaskaLoop Basic',
          price: 'Free',
          icon: <Users className="h-5 w-5" />,
          color: 'bg-gray-500',
          badgeColor: 'bg-gray-100 text-gray-800'
        };
      case 'plus':
        return {
          name: 'TaskaLoop Plus',
          price: '$4.99/month',
          icon: <Star className="h-5 w-5" />,
          color: 'bg-blue-500',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
      case 'family':
        return {
          name: 'TaskaLoop Family',
          price: '$8.99/month',
          icon: <Crown className="h-5 w-5" />,
          color: 'bg-purple-500',
          badgeColor: 'bg-purple-100 text-purple-800'
        };
    }
  };

  const tierInfo = getTierDisplayInfo();

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Profile Settings</h1>
            <p className="text-slate-500">Manage your account settings and preferences</p>
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-4 md:inline-flex mb-6">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            {/* Profile Information */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-2xl bg-teal-100 text-teal-700">
                        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="border-slate-200">
                      Change Avatar
                    </Button>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          defaultValue={user?.name?.split(' ')[0] || ""} 
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          defaultValue={user?.name?.split(' ').slice(1).join(' ') || ""} 
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        defaultValue={user?.email || ""} 
                        placeholder="Enter your email"
                        disabled
                      />
                      <p className="text-xs text-slate-500">Email cannot be changed as it's linked to your Google account</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            {/* Preferences */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language" className="w-full md:w-[240px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="america_los_angeles">
                    <SelectTrigger id="timezone" className="w-full md:w-[240px]">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america_los_angeles">Pacific Time (US & Canada)</SelectItem>
                      <SelectItem value="america_denver">Mountain Time (US & Canada)</SelectItem>
                      <SelectItem value="america_chicago">Central Time (US & Canada)</SelectItem>
                      <SelectItem value="america_new_york">Eastern Time (US & Canada)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="darkMode">Dark Mode</Label>
                      <p className="text-sm text-slate-500">Enable dark mode for the application</p>
                    </div>
                    <Switch id="darkMode" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compactView">Compact View</Label>
                      <p className="text-sm text-slate-500">Use a more compact layout for lists</p>
                    </div>
                    <Switch id="compactView" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* Password */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Key className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardFooter>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-medium text-slate-800">Enable Two-Factor Authentication</h4>
                    <p className="text-sm text-slate-500">Protect your account with an additional security layer</p>
                  </div>
                  <Switch id="twoFactor" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="border-slate-200">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Learn More
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Setup 2FA
                </Button>
              </CardFooter>
            </Card>

            {/* Connected Accounts */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Manage accounts connected to your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">Google</h4>
                      <p className="text-sm text-slate-500">Connected as {user?.email || "Not connected"}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-slate-200" disabled>
                    Connected
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-800">Email Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailShoppingReminders">Shopping Reminders</Label>
                        <p className="text-sm text-slate-500">Receive reminders about your shopping lists</p>
                      </div>
                      <Switch id="emailShoppingReminders" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailExpenseAlerts">Expense Alerts</Label>
                        <p className="text-sm text-slate-500">Get notified about new expenses and payments</p>
                      </div>
                      <Switch id="emailExpenseAlerts" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailWeeklyDigest">Weekly Digest</Label>
                        <p className="text-sm text-slate-500">Receive a weekly summary of your activities</p>
                      </div>
                      <Switch id="emailWeeklyDigest" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-800">Push Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="pushShoppingReminders">Shopping Reminders</Label>
                        <p className="text-sm text-slate-500">Receive reminders about your shopping lists</p>
                      </div>
                      <Switch id="pushShoppingReminders" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="pushExpenseAlerts">Expense Alerts</Label>
                        <p className="text-sm text-slate-500">Get notified about new expenses and payments</p>
                      </div>
                      <Switch id="pushExpenseAlerts" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="pushLocationReminders">Location-based Reminders</Label>
                        <p className="text-sm text-slate-500">Get reminded when you're near a store on your list</p>
                      </div>
                      <Switch id="pushLocationReminders" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Bell className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            {!isAdmin && (
              <>
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>Current Subscription</CardTitle>
                    <CardDescription>Your current plan and features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className={`${tierInfo.color === 'bg-gray-500' ? 'bg-gray-50 border-gray-200' : tierInfo.color === 'bg-blue-500' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'} border rounded-lg p-6`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`${tierInfo.color} rounded-full p-2 text-white`}>
                            {tierInfo.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">{tierInfo.name}</h4>
                            <p className="text-sm text-slate-600">{tierInfo.price}</p>
                          </div>
                        </div>
                        <Badge className={tierInfo.badgeColor}>
                          Active
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <h5 className="font-medium text-slate-700">Current Usage & Limits</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Active Trips:</span>
                              <span className="font-medium">
                                {limits.maxActiveTrips === Infinity ? 'Unlimited' : `${limits.maxActiveTrips} max`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Active Tasks:</span>
                              <span className="font-medium">
                                {limits.maxActiveTasks === Infinity ? 'Unlimited' : `${limits.maxActiveTasks} max`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Pantry Items:</span>
                              <span className="font-medium">
                                {limits.maxPantryItems === Infinity ? 'Unlimited' : `${limits.maxPantryItems} max`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Household Members:</span>
                              <span className="font-medium">
                                {limits.maxHouseholdMembers === Infinity ? 'Unlimited' : `${limits.maxHouseholdMembers} max`}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="font-medium text-slate-700">Features Included</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              {limits.hasReceiptScanning ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <span className="w-3 h-3 text-red-400">×</span>
                              )}
                              <span className={limits.hasReceiptScanning ? 'text-slate-700' : 'text-slate-400'}>
                                Receipt Scanning
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {limits.hasAIFeatures ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <span className="w-3 h-3 text-red-400">×</span>
                              )}
                              <span className={limits.hasAIFeatures ? 'text-slate-700' : 'text-slate-400'}>
                                AI-Powered Features
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {limits.hasRecurringItems ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <span className="w-3 h-3 text-red-400">×</span>
                              )}
                              <span className={limits.hasRecurringItems ? 'text-slate-700' : 'text-slate-400'}>
                                Recurring Items
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {limits.hasAdvancedAnalytics ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <span className="w-3 h-3 text-red-400">×</span>
                              )}
                              <span className={limits.hasAdvancedAnalytics ? 'text-slate-700' : 'text-slate-400'}>
                                Advanced Analytics
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {currentTier !== 'family' && (
                        <Button 
                          onClick={() => setShowSubscriptionManager(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Upgrade Plan
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {currentTier !== 'free' && (
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle>Billing & Payments</CardTitle>
                      <CardDescription>Manage your subscription billing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stripeService.isConfigured() ? (
                        <div className="space-y-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                              <span className="font-medium text-blue-800">Stripe Customer Portal</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              Manage your subscription, payment methods, and billing history through our secure portal powered by Stripe.
                            </p>
                          </div>
                          
                          <div className="flex gap-3">
                            <Button 
                              variant="outline" 
                              onClick={async () => {
                                try {
                                  // In production, you'd pass the actual Stripe customer ID
                                  await stripeService.openCustomerPortal('cus_demo_customer_id');
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to open customer portal. Please try again.",
                                    variant: "destructive"
                                  });
                                }
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Manage Billing
                            </Button>
                            <Button variant="outline">
                              <Package className="h-4 w-4 mr-2" />
                              Download Invoices
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="font-semibold mb-2">Stripe Configuration Required</h3>
                          <p className="text-sm text-slate-600 mb-4">
                            Stripe is not configured. Please add your Stripe keys to enable billing features.
                          </p>
                          <Button variant="outline" disabled>
                            Manage Billing
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
            
            {isAdmin && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Admin Account</CardTitle>
                  <CardDescription>You have an admin account with full access to all features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Admin Access</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      All premium features are enabled for testing and development purposes.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-medium text-slate-800">Welcome Tutorial</h4>
                      <p className="text-sm text-slate-500">Restart the welcome tutorial to see the feature overview</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-slate-200"
                      onClick={() => {
                        // Clear tutorial completion status and start tutorial
                        if (user) {
                          localStorage.removeItem(`tutorial_completed_${user.id}`);
                          startTutorial();
                          toast({
                            title: "Tutorial Started",
                            description: "The welcome tutorial has been restarted.",
                          });
                        }
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Restart Tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Account Actions */}
        <div className="mt-8 space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-slate-800">Export Your Data</h4>
                  <p className="text-sm text-slate-500">Download a copy of your data</p>
                </div>
                <Button variant="outline" className="border-slate-200">
                  Export Data
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-red-600">Delete Account</h4>
                  <p className="text-sm text-slate-500">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-slate-800">Sign Out</h4>
                  <p className="text-sm text-slate-500">Sign out from your account</p>
                </div>
                <Button variant="outline" className="border-slate-200" onClick={handleSignOut} disabled={isLoggingOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Manager Modal */}
        {!isAdmin && (
          <SubscriptionManager
            isOpen={showSubscriptionManager}
            onClose={() => setShowSubscriptionManager(false)}
            showUpgradeOnly={currentTier !== 'free'}
          />
        )}
      </div>
    </AppLayout>
  )
} 