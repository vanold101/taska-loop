import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Home, Map, User, Wallet, LayoutDashboard, Package, Plus, MoreHorizontal } from "lucide-react";
import { cn, haptics } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeToggle from './DarkModeToggle';
import NotificationCenter, { Notification } from './NotificationCenter';
import FileSystemNavigation from './FileSystemNavigation';
import { useAuth } from '@/context/AuthContext';
import { useDeviceDetection } from '../hooks/useDeviceDetection';

interface NavBarProps {
  activeItem?: string;
}

const NavBar = ({ activeItem: propActiveItem }: NavBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, screenWidth } = useDeviceDetection();
  const [activeItem, setActiveItem] = useState(propActiveItem || location.pathname);
  const [showMenu, setShowMenu] = useState(false);
  const { user, isAdmin } = useAuth();
  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  // Notifications based on admin status
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (isAdmin) {
      // Admin accounts get example notifications for testing
      return [
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
          actionUrl: '/trips'
        }
      ];
    } else {
      // Regular users get welcome/onboarding notifications
      return [
        {
          id: 'welcome-1',
          type: 'info',
          title: 'Welcome to TaskaLoop!',
          message: 'Start by creating your first shopping trip or adding items to your pantry',
          timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
          read: false,
          actionText: 'Create Trip',
          actionUrl: '/trips'
        }
      ];
    }
  });

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
    { name: 'Home', path: '/home', icon: <Home className={isMobile ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} /> },
    { name: 'Map', path: '/map', icon: <Map className={isMobile ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} /> },
    { name: 'Trips', path: '/trips', icon: <ShoppingCart className={isMobile ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} /> },
    { name: 'Pantry', path: '/pantry', icon: <Package className={isMobile ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} /> },
    { name: 'Ledger', path: '/ledger', icon: <Wallet className={isMobile ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className={isMobile ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} /> },
    { name: 'Profile', path: '/profile', icon: <User className={isMobile ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} /> }
  ];

  // Handle notification actions
  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(note => 
      note.id === id ? { ...note, read: true } : note
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(note => ({ ...note, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationAction = (notification: Notification) => {
    if (notification.actionUrl && notification.actionText) {
      if (notification.actionUrl.startsWith('/')) {
        navigate(notification.actionUrl);
      } else {
        // For external links, open in a new tab
        window.open(notification.actionUrl, '_blank');
      }
      
      // Mark the notification as read
      handleMarkAsRead(notification.id);
    }
  };

  // Handle navigation item click with haptic feedback
  const handleNavItemClick = (path: string) => {
    // Add haptic feedback when navigation item is clicked
    haptics.light();
    
    setActiveItem(path);
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gloop-dark-surface border-t border-gloop-outline dark:border-gloop-dark-outline shadow-lg ${isMobile ? 'pb-safe' : ''}`}>
      <div className={`absolute top-0 right-0 ${isMobile ? '-mt-12 pr-2' : '-mt-16 pr-4'} flex gap-2`}>
        {/* NotificationCenter is now integrated with the FAB */}
        <DarkModeToggle />
      </div>
      <nav className={`flex justify-between items-center w-full ${isMobile ? 'max-w-full px-1' : 'max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl px-1 sm:px-2'} mx-auto`}>
        {navItems.map((item) => {
          const isActive = activeItem === item.path || 
                          activeItem === item.name.toLowerCase() ||
                          (item.path === '/home' && activeItem === '/');
          return (
            <motion.div
              key={item.path}
              className="flex flex-col items-center"
              whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Link 
                to={item.path} 
                onClick={() => handleNavItemClick(item.path)}
                className={cn(
                  `flex flex-col items-center transition-all duration-300 relative`,
                  isMobile ? "py-1 px-1" : "py-1.5 sm:py-2 px-1.5 sm:px-2.5",
                  isActive 
                    ? "text-gloop-primary dark:text-gloop-primary"
                    : "text-gloop-text-muted hover:text-gloop-text-main dark:text-gloop-dark-text-muted dark:hover:text-gloop-dark-text-main"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className={`absolute -top-1 ${isMobile ? 'w-4 h-0.5' : 'w-6 sm:w-8 h-1'} rounded-full bg-gloop-primary`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30,
                      opacity: { duration: 0.2 }
                    }}
                  />
                )}
                
                <motion.div 
                  className={cn(
                    "rounded-full transition-all duration-300",
                    isMobile ? "p-1 mb-0.5" : "p-1.5 sm:p-2 mb-0.5 sm:mb-1",
                    isActive 
                      ? "bg-gloop-accent/80 dark:bg-gloop-dark-accent/80 scale-110" 
                      : "hover:bg-gloop-outline/50 dark:hover:bg-gloop-dark-outline/50"
                  )}
                  whileHover={{ 
                    backgroundColor: isActive 
                      ? "rgba(var(--gloop-accent), 0.9)" 
                      : "rgba(var(--gloop-outline), 0.7)" 
                  }}
                >
                  {item.icon}
                </motion.div>
                
                <span className={cn(
                  "transition-all duration-300 text-center font-medium",
                  isMobile ? "text-xs leading-tight" : "text-xs sm:text-sm leading-tight sm:leading-normal",
                  isActive 
                    ? "text-gloop-primary dark:text-gloop-primary font-semibold" 
                    : "text-gloop-text-muted dark:text-gloop-dark-text-muted"
                )}>
                  {item.name}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </div>
  );
};

export default NavBar;
