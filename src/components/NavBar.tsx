
import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Home, Map, Airplay, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-30 shadow-lg backdrop-blur-lg bg-white/90">
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
                  ? "text-gloop-primary" 
                  : "text-gloop-text-muted hover:text-gloop-text-main"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-2 w-1/2 h-1 bg-gloop-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
              
              {/* Add a subtle hover effect */}
              {!isActive && (
                <motion.span 
                  className="absolute inset-0 bg-slate-100 rounded-lg z-[-1] opacity-0"
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
