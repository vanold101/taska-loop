
import { useState } from "react";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const SettingsPage = () => {
  const { toast } = useToast();
  const [user] = useState({
    name: "Alex Smith",
    phone: "+1 (555) 123-4567",
    paymentHandle: "@alexsmith",
    avatarUrl: "",
    dietary: ["Vegetarian"]
  });

  const [notificationSettings, setNotificationSettings] = useState({
    tripAnnouncements: true,
    paymentRequests: true,
    expiryNotifications: false,
    locationServices: true,
  });

  const handleToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    });
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile saved",
      description: "Your profile changes have been saved.",
    });
  };

  const handleInvite = () => {
    toast({
      title: "Invite sent",
      description: "Invite link has been copied to clipboard.",
    });
  };

  return (
    <div className="pb-20 pt-6 px-4 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>

      <section className="mb-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="text-2xl bg-gloop-primary text-white">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={user.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue={user.phone} disabled />
              <p className="text-xs text-gloop-text-muted">Phone number can't be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment">Payment Handle</Label>
              <Input id="payment" defaultValue={user.paymentHandle} />
            </div>

            <Button onClick={handleSaveProfile} className="w-full bg-gloop-primary hover:bg-gloop-primary-dark">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>My Circle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Home Circle</h3>
                <p className="text-sm text-gloop-text-muted">3 members</p>
              </div>
              <Button variant="outline" onClick={handleInvite}>Invite</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="trip-announcements" className="cursor-pointer">
                  Trip Announcements
                </Label>
                <p className="text-sm text-gloop-text-muted">Get notified when someone announces a trip</p>
              </div>
              <Switch 
                id="trip-announcements" 
                checked={notificationSettings.tripAnnouncements}
                onCheckedChange={() => handleToggle('tripAnnouncements')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="payment-requests" className="cursor-pointer">
                  Payment Requests
                </Label>
                <p className="text-sm text-gloop-text-muted">Get notified about payment requests</p>
              </div>
              <Switch 
                id="payment-requests" 
                checked={notificationSettings.paymentRequests}
                onCheckedChange={() => handleToggle('paymentRequests')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="expiry-notifications" className="cursor-pointer">
                  Expiry Notifications
                </Label>
                <p className="text-sm text-gloop-text-muted">Get notified when items are about to expire</p>
              </div>
              <Switch 
                id="expiry-notifications" 
                checked={notificationSettings.expiryNotifications}
                onCheckedChange={() => handleToggle('expiryNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="location-services" className="cursor-pointer">
                  Location Services
                </Label>
                <p className="text-sm text-gloop-text-muted">Enable location-based reminders</p>
              </div>
              <Switch 
                id="location-services" 
                checked={notificationSettings.locationServices}
                onCheckedChange={() => handleToggle('locationServices')}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <NavBar />
    </div>
  );
};

export default SettingsPage;
