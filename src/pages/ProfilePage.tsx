import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { AppLayout } from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  Clock
} from "lucide-react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Switch } from "../components/ui/switch"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
                      <AvatarImage src="/placeholder.svg?height=96&width=96" />
                      <AvatarFallback className="text-2xl bg-teal-100 text-teal-700">JD</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="border-slate-200">
                      Change Avatar
                    </Button>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="Jane" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue="jane.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" defaultValue="(555) 123-4567" />
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
                      <p className="text-sm text-slate-500">Connected as jane.doe@gmail.com</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-slate-200">
                    Disconnect
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
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>Manage your subscription and billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-800">Free Plan</h4>
                      <p className="text-sm text-slate-500">Your current plan</p>
                    </div>
                    <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">Active</Badge>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-slate-600">Features included:</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      <li className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-teal-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Up to 5 shopping lists
                      </li>
                      <li className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-teal-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Basic expense splitting
                      </li>
                      <li className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-teal-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Limited pantry tracking
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-800">Premium Plan</h4>
                      <p className="text-sm text-slate-500">$4.99/month</p>
                    </div>
                    <Button className="bg-teal-600 hover:bg-teal-700">Upgrade</Button>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-slate-600">Additional features:</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      <li className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-teal-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Unlimited shopping lists
                      </li>
                      <li className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-teal-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Advanced expense analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-teal-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Full pantry management
                      </li>
                      <li className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-teal-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Priority support
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="border-slate-200">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
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
      </div>
    </AppLayout>
  )
} 