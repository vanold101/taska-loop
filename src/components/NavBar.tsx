
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Home, Map, User, Wallet, LayoutDashboard, Package, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeToggle from './DarkModeToggle';
import NotificationCenter, { Notification } from './NotificationCenter';
import { useToast } from "@/hooks/use-toast";
import FileSystemNavigation from './FileSystemNavigation';

interface NavBarProps {
  activeItem?: string;
}

const NavBar = ({ activeItem: propActiveItem }: NavBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(propActiveItem || location.pathname);
  const [showMenu, setShowMenu] = useState(false);
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

  // Close menu when navigating
  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Home', path: '/home', icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { name: 'Map', path: '/map', icon: <Map className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { name: 'Trips', path: '/trips', icon: <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { name: 'Pantry', path: '/pantry', icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { name: 'Ledger', path: '/ledger', icon: <Wallet className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-4 h-4 sm:w-5 sm:h-5" /> }
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
      if (notification.actionUrl.startsWith('/')) {
        navigate(notification.actionUrl);
        toast({
          title: `Navigating to ${notification.actionText}`,
          description: `Action: ${notification.actionText}`
        });
      } else {
        toast({
          title: `Action: ${notification.actionText}`,
          description: `Would navigate to: ${notification.actionUrl}`
        });
      }
      
      // Mark the notification as read
      handleMarkAsRead(notification.id);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-30 glass-effect border-t border-gloop-outline dark:border-gloop-dark-outline shadow-lg">
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
        
        <nav className="flex justify-between items-center w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto px-2 sm:px-4 relative">
          {navItems.slice(0, 5).map((item) => {
            const isActive = activeItem === item.path || 
                          activeItem === item.name.toLowerCase() ||
                          (item.path === '/home' && activeItem === '/');
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setActiveItem(item.path)}
                className={cn(
                  "flex flex-col items-center py-1.5 sm:py-2 px-1.5 sm:px-2.5 transition-colors relative",
                  isActive 
                    ? "text-gloop-primary dark:text-gloop-primary"
                    : "text-gloop-text-muted hover:text-gloop-text-main dark:text-gloop-dark-text-muted dark:hover:text-gloop-dark-text-main"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -top-1 w-6 sm:w-8 h-1 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                
                <div className={cn(
                  "p-1.5 sm:p-2 rounded-full mb-0.5 sm:mb-1",
                  isActive ? "bg-gloop-accent/80 dark:bg-gloop-dark-accent/80" : ""
                )}>
                  {item.icon}
                </div>
                <span className="text-[10px] sm:text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          {/* More button */}
          <button 
            className={cn(
              "flex flex-col items-center py-1.5 sm:py-2 px-1.5 sm:px-2.5 transition-colors relative",
              showMenu 
                ? "text-gloop-primary dark:text-gloop-primary"
                : "text-gloop-text-muted hover:text-gloop-text-main dark:text-gloop-dark-text-muted dark:hover:text-gloop-dark-text-main"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <div className={cn(
              "p-1.5 sm:p-2 rounded-full mb-0.5 sm:mb-1 relative",
              showMenu ? "bg-gloop-accent/80 dark:bg-gloop-dark-accent/80" : ""
            )}>
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              {showMenu && (
                <motion.div 
                  layoutId="menuIndicator"
                  className="absolute -top-1 inset-x-0 h-1 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-medium">More</span>
          </button>
        </nav>
      </div>
      
      {/* Expanded menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
            />
            
            <motion.div
              className="fixed bottom-20 inset-x-4 z-50 rounded-lg overflow-hidden"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <FileSystemNavigation className="w-full max-w-sm mx-auto" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
