import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Home, Map, Airplay, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import DarkModeToggle from './DarkModeToggle';

const NavBar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  // Update active item when location changes
  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const navItems = [
    { name: 'Home', path: '/home', icon: <Home className="w-5 h-5" /> },
    { name: 'Map', path: '/map', icon: <Map className="w-5 h-5" /> },
    { name: 'Trips', path: '/trips', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Pantry', path: '/pantry', icon: <Airplay className="w-5 h-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-effect border-t py-2 px-4 z-30 shadow-lg border-gloop-outline bg-white/80 dark:bg-gloop-dark-surface/80 dark:border-gloop-dark-surface">
      <div className="absolute top-0 right-4 -mt-16 flex gap-2">
        <DarkModeToggle />
      </div>
      <nav className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeItem === item.path || 
                          (item.path === '/home' && activeItem === '/');
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={() => setActiveItem(item.path)}
              className={cn(
                "flex flex-col items-center px-4 py-2 rounded-lg transition-colors relative",
                isActive 
                  ? "text-gloop-primary dark:text-gloop-primary"
                  : "text-gloop-text-muted hover:text-gloop-text-main dark:text-gloop-dark-text-muted dark:hover:text-gloop-dark-text-main"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-2 w-1/2 h-1 rounded-full bg-gloop-primary"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
              </motion.div>
              <span className="text-xs mt-1 font-medium">{item.name}</span>
              
              {/* Add a subtle hover effect */}
              {!isActive && (
                <motion.span 
                  className="absolute inset-0 rounded-lg z-[-1] opacity-0 bg-white/50 dark:bg-gloop-dark-surface/50"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default NavBar;
