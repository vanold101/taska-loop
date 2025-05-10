import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Home, Map, User, Wallet, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import DarkModeToggle from './DarkModeToggle';
import NotificationCenter, { Notification } from './NotificationCenter';
import { useToast } from "@/hooks/use-toast";

interface NavBarProps {
  activeItem?: string;
}

const NavBar = ({ activeItem: propActiveItem }: NavBarProps) => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(propActiveItem || location.pathname);
  const { toast } = useToast();

  // Mock notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      title: 'Rachel added a new item',
      message: 'Rachel added "Milk" to your shopping trip to Trader Joe\'s',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
      actionText: 'View Trip',
      actionUrl: '/trips',
      sender: {
        name: 'Rachel',
      }
    },
    {
      id: '2',
      type: 'success',
      title: 'Trip Completed',
      message: 'Your shopping trip to Kroger has been completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: true
    },
    {
      id: '3',
      type: 'warning',
      title: 'Item running low',
      message: 'Pasta is running low in your pantry. Add it to your next shopping trip?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      actionText: 'Add to Trip',
      actionUrl: '/trips/new'
    }
  ]);

  // Update active item when location or propActiveItem changes
  useEffect(() => {
    if (propActiveItem) {
      setActiveItem(propActiveItem);
    } else {
      setActiveItem(location.pathname);
    }
  }, [location.pathname, propActiveItem]);

  const navItems = [
    { name: 'Home', path: '/home', icon: <Home className="w-5 h-5" /> },
    { name: 'Map', path: '/map', icon: <Map className="w-5 h-5" /> },
    { name: 'Trips', path: '/trips', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Ledger', path: '/ledger', icon: <Wallet className="w-5 h-5" /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> }
  ];

  // Handle notification actions
  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(note => 
      note.id === id ? { ...note, read: true } : note
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(note => ({ ...note, read: true })));
    toast({
      title: "All notifications marked as read"
    });
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast({
      title: "All notifications cleared"
    });
  };

  const handleNotificationAction = (notification: Notification) => {
    if (notification.actionUrl && notification.actionText) {
      toast({
        title: `Action: ${notification.actionText}`,
        description: `Would navigate to: ${notification.actionUrl}`
      });
      // Here you would handle different actions based on the notification
      // For example, redirect to the trip, add an item, etc.
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gloop-dark-surface border-t border-gloop-outline dark:border-gloop-dark-outline shadow-lg">
      <div className="absolute top-0 right-0 -mt-16 pr-4 flex gap-2">
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClearAll={handleClearAll}
          onAction={handleNotificationAction}
        />
        <DarkModeToggle />
      </div>
      <nav className="flex justify-between items-center max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = activeItem === item.path || 
                          activeItem === item.name.toLowerCase() ||
                          (item.path === '/home' && activeItem === '/');
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={() => setActiveItem(item.path)}
              className={cn(
                "flex flex-col items-center py-2 px-1 transition-colors relative",
                isActive 
                  ? "text-gloop-primary dark:text-gloop-primary"
                  : "text-gloop-text-muted hover:text-gloop-text-main dark:text-gloop-dark-text-muted dark:hover:text-gloop-dark-text-main"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-gloop-primary"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <div className={cn(
                "p-1.5 rounded-full mb-1",
                isActive ? "bg-gloop-accent/80 dark:bg-gloop-dark-accent/80" : ""
              )}>
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default NavBar;
