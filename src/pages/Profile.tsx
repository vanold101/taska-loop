import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  CreditCard, 
  LogOut, 
  Settings, 
  User, 
  UserPlus, 
  Users, 
  HelpCircle, 
  Star, 
  Shield, 
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  Edit,
  CheckCircle,
  Moon,
  TreeDeciduous
} from "lucide-react";
import { motion } from "framer-motion";
import SignOutDialog from "@/components/SignOutDialog";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  // Check system preference for dark mode on initial load
  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check if there's a saved preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkModeEnabled(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkModeEnabled(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = (enabled: boolean) => {
    setDarkModeEnabled(enabled);
    
    if (enabled) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Add friend to circle
  const handleAddFriend = () => {
    if (newFriendName && newFriendEmail) {
      const newFriend = {
        id: friends.length + 1,
        name: newFriendName,
        avatar: null,
        isOnline: false
      };
      
      setFriends([...friends, newFriend]);
      setNewFriendName("");
      setNewFriendEmail("");
      setShowAddFriendModal(false);
      
      // Show toast or notification
      alert(`${newFriendName} has been added to your circle!`);
    }
  };

  // Mock user data
  const user = {
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    avatar: "/avatar.png",
    memberSince: "January 2023",
    completedTasks: 47,
    savedMoney: "$235",
    savedTime: "12 hours",
    isPremium: true
  };

  // Mock friends data
  const [friends, setFriends] = useState([
    { id: 1, name: "Alex Chen", avatar: null, isOnline: true },
    { id: 2, name: "Jamie Smith", avatar: null, isOnline: false },
    { id: 3, name: "Taylor Wong", avatar: null, isOnline: true },
    { id: 4, name: "Jordan Lee", avatar: null, isOnline: false }
  ]);

  // Mock payment methods
  const paymentMethods = [
    { id: 1, type: "Visa", last4: "4242", isDefault: true },
    { id: 2, type: "Mastercard", last4: "8888", isDefault: false }
  ];

  // Mock activity history
  const activityHistory = [
    { id: 1, action: "Completed shopping trip", location: "Trader Joe's", date: "Today", time: "2:30 PM" },
    { id: 2, action: "Added items to Jamie's trip", location: "Costco", date: "Yesterday", time: "11:15 AM" },
    { id: 3, action: "Created new task", location: "Home Depot", date: "May 1", time: "4:45 PM" },
    { id: 4, action: "Shared trip with circle", location: "Whole Foods", date: "April 28", time: "10:00 AM" }
  ];

  return (
    <div className="pb-20 pt-16 px-4 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end">My Profile</h1>
      </header>

      <div className="mb-6">
        <Card className="premium-card overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end"></div>
          <CardContent className="pt-0 relative">
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-center -mt-10">
                <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xl bg-gradient-to-br from-gloop-premium-gradient-start to-gloop-premium-gradient-end text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-2 font-semibold text-lg">{user.name}</h2>
                <p className="text-sm text-gloop-text-muted">{user.email}</p>
                
                {user.isPremium && (
                  <Badge className="mt-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 border-0">
                    <Star className="h-3 w-3 mr-1" /> Premium
                  </Badge>
                )}
              </div>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute top-2 right-4 rounded-full h-8 w-8 p-0 hover:bg-black/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <motion.div 
                className="p-2 rounded-lg bg-gloop-bg/30"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <p className="text-xs text-gloop-text-muted">Tasks</p>
                <p className="font-semibold">{user.completedTasks}</p>
              </motion.div>
              <motion.div 
                className="p-2 rounded-lg bg-gloop-bg/30"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <p className="text-xs text-gloop-text-muted">Saved</p>
                <p className="font-semibold">{user.savedMoney}</p>
              </motion.div>
              <motion.div 
                className="p-2 rounded-lg bg-gloop-bg/30"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <p className="text-xs text-gloop-text-muted">Time</p>
                <p className="font-semibold">{user.savedTime}</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="account" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="flex w-full overflow-x-auto no-scrollbar glass-effect">
          <TabsTrigger value="account" className="flex-shrink-0 data-[state=active]:bg-transparent data-[state=active]:text-gloop-primary relative">
            <User className="h-4 w-4 mr-2" />
            <span>Account</span>
            {activeTab === "account" && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end"
                layoutId="activeTabIndicator"
              />
            )}
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex-shrink-0 data-[state=active]:bg-transparent data-[state=active]:text-gloop-primary relative">
            <Users className="h-4 w-4 mr-2" />
            <span>Circle</span>
            {activeTab === "friends" && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end"
                layoutId="activeTabIndicator"
              />
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-shrink-0 data-[state=active]:bg-transparent data-[state=active]:text-gloop-primary relative">
            <Clock className="h-4 w-4 mr-2" />
            <span>Activity</span>
            {activeTab === "activity" && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end"
                layoutId="activeTabIndicator"
              />
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4 mt-4">
          <Card className="premium-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Bell className="h-5 w-5 mr-2 text-gloop-primary" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <Label htmlFor="location-services" className="cursor-pointer">
                    Location Services
                  </Label>
                </div>
                <Switch 
                  id="location-services" 
                  checked={locationEnabled}
                  onCheckedChange={setLocationEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between premium-card p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-gloop-primary" />
                  <Label htmlFor="dark-mode" className="cursor-pointer">
                    Dark Mode
                  </Label>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={darkModeEnabled}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
              
              <div className="flex items-center justify-between premium-card p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <TreeDeciduous className="h-4 w-4 text-green-500" />
                  <Label htmlFor="eco-friendly" className="cursor-pointer">
                    Eco-Friendly Mode
                  </Label>
                </div>
                <Switch 
                  id="eco-friendly"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="premium-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-gloop-primary" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.map(method => (
                <div 
                  key={method.id}
                  className="flex items-center justify-between p-3 premium-card rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    {method.type === "Visa" ? (
                      <div className="text-blue-600 font-bold">VISA</div>
                    ) : (
                      <div className="text-red-600 font-bold">MC</div>
                    )}
                    <div>
                      <p className="font-medium">•••• {method.last4}</p>
                      <p className="text-xs text-gloop-text-muted">Expires 12/25</p>
                    </div>
                  </div>
                  {method.isDefault && (
                    <Badge variant="outline" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
              ))}
              
              <Button variant="outline" className="w-full premium-card mt-2">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
          
          <Card className="premium-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2 text-gloop-primary" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start premium-card">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help & Support
              </Button>
              
              <Button variant="outline" className="w-full justify-start premium-card">
                <Settings className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 premium-card hover:text-red-700"
                onClick={() => setShowSignOutDialog(true)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="friends" className="space-y-4 mt-4">
          <Card className="premium-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-gloop-primary" />
                  My Circle
                </div>
                <Badge variant="outline" className="ml-2">{friends.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {friends.map(friend => (
                <motion.div 
                  key={friend.id}
                  className="flex items-center justify-between p-3 premium-card rounded-lg hover:shadow-md transition-all"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-gloop-premium-gradient-start to-gloop-premium-gradient-end text-white">
                        {friend.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{friend.name}</p>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-1 ${friend.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <p className="text-xs text-gloop-text-muted">{friend.isOnline ? 'Online' : 'Offline'}</p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gloop-text-muted" />
                </motion.div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full premium-card mt-2"
                onClick={() => setShowAddFriendModal(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add to Circle
              </Button>
            </CardContent>
          </Card>
          
          <Card className="premium-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-gloop-primary" />
                Invitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-center text-gloop-text-muted">
                <Users className="h-12 w-12 mb-2 opacity-30" />
                <p>No pending invitations</p>
                <p className="text-sm mt-1">When someone invites you to their circle, it will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4 mt-4">
          <Card className="premium-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gloop-primary" />
                  Recent Activity
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activityHistory.map(activity => (
                <motion.div 
                  key={activity.id}
                  className="p-3 premium-card rounded-lg hover:shadow-md transition-all"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1 text-gloop-text-muted" />
                        <p className="text-xs text-gloop-text-muted">{activity.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{activity.date}</p>
                      <p className="text-xs text-gloop-text-muted">{activity.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <Button variant="outline" className="w-full premium-card mt-2">
                <Clock className="h-4 w-4 mr-2" />
                View All Activity
              </Button>
            </CardContent>
          </Card>
          
          <Card className="premium-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Star className="h-5 w-5 mr-2 text-amber-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <motion.div 
                  className="p-3 premium-card rounded-lg text-center"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="font-medium text-sm">Early Adopter</p>
                </motion.div>
                <motion.div 
                  className="p-3 premium-card rounded-lg text-center"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="font-medium text-sm">Task Master</p>
                </motion.div>
                <motion.div 
                  className="p-3 premium-card rounded-lg text-center bg-gray-100 dark:bg-gray-800/50"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="font-medium text-sm text-gray-400">Super Saver</p>
                </motion.div>
                <motion.div 
                  className="p-3 premium-card rounded-lg text-center bg-gray-100 dark:bg-gray-800/50"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="font-medium text-sm text-gray-400">Team Player</p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NavBar />
      
      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            className="bg-white dark:bg-gloop-dark-surface rounded-lg shadow-lg max-w-md w-full p-4 premium-card"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-gloop-primary" />
              Add to Circle
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="friend-name">Name</Label>
                <input
                  id="friend-name"
                  className="w-full p-2 mt-1 border rounded-md dark:bg-gloop-dark-bg dark:border-gloop-dark-border"
                  placeholder="Enter name"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="friend-email">Email</Label>
                <input
                  id="friend-email"
                  className="w-full p-2 mt-1 border rounded-md dark:bg-gloop-dark-bg dark:border-gloop-dark-border"
                  placeholder="Enter email"
                  type="email"
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAddFriendModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 premium-gradient-btn"
                  onClick={handleAddFriend}
                  disabled={!newFriendName || !newFriendEmail}
                >
                  Add Friend
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Sign Out Dialog */}
      <SignOutDialog 
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
      />
    </div>
  );
};

export default Profile;
