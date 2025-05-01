
import { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { BadgeCheck, Bell, Moon, User, Shield, LogOut, Trophy, TreeDeciduous } from "lucide-react";

const ProfilePage = () => {
  const { toast } = useToast();
  const [user] = useState({
    name: "Alex Smith",
    phone: "+1 (555) 123-4567",
    paymentHandle: "@alexsmith",
    avatarUrl: "",
    points: {
      taskPoints: 15,
      loopPoints: 23
    },
    preferences: {
      darkMode: false,
      notifications: true,
      locationServices: true,
      highContrastMode: false
    }
  });

  const [preferences, setPreferences] = useState(user.preferences);

  const handleTogglePreference = (setting: keyof typeof preferences) => {
    setPreferences({
      ...preferences,
      [setting]: !preferences[setting],
    });
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile saved",
      description: "Your profile changes have been saved.",
    });
  };

  return (
    <div className="pb-20 pt-6 px-4 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
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
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gloop-accent" />
              My Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-medium">Task Points</h3>
                <p className="text-2xl font-bold text-gloop-primary">{user.points.taskPoints}</p>
              </div>
              <div>
                <h3 className="font-medium">Loop Points</h3>
                <p className="text-2xl font-bold text-gloop-accent">{user.points.loopPoints}</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center gap-3">
              <TreeDeciduous className="text-green-600 h-5 w-5" />
              <div>
                <p className="text-sm text-green-800 font-medium">You've helped plant 2 trees!</p>
                <p className="text-xs text-green-600">Earn 10 more points for another tree</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <Label htmlFor="notifications-toggle" className="cursor-pointer">
                  Notifications
                </Label>
              </div>
              <Switch 
                id="notifications-toggle" 
                checked={preferences.notifications}
                onCheckedChange={() => handleTogglePreference('notifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <Label htmlFor="darkmode-toggle" className="cursor-pointer">
                  Dark Mode
                </Label>
              </div>
              <Switch 
                id="darkmode-toggle" 
                checked={preferences.darkMode}
                onCheckedChange={() => handleTogglePreference('darkMode')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <Label htmlFor="location-toggle" className="cursor-pointer">
                  Location Services
                </Label>
              </div>
              <Switch 
                id="location-toggle" 
                checked={preferences.locationServices}
                onCheckedChange={() => handleTogglePreference('locationServices')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" />
                <Label htmlFor="contrast-toggle" className="cursor-pointer">
                  High Contrast Mode
                </Label>
              </div>
              <Switch 
                id="contrast-toggle" 
                checked={preferences.highContrastMode}
                onCheckedChange={() => handleTogglePreference('highContrastMode')}
              />
            </div>

            <Button 
              variant="outline"
              className="w-full mt-4 flex items-center justify-center gap-2 text-red-500 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </section>

      <NavBar />
    </div>
  );
};

export default ProfilePage;
