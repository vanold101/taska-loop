"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Home, Map, Airplay, User, Wallet, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface NavBarProps {
  activeItem?: string;
}

const NextNavBar = ({ activeItem: propActiveItem }: NavBarProps) => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(propActiveItem || pathname);
  const { toast } = useToast();

  // Update active item when location or propActiveItem changes
  useEffect(() => {
    if (propActiveItem) {
      setActiveItem(propActiveItem);
    } else {
      setActiveItem(pathname);
    }
  }, [pathname, propActiveItem]);

  const navItems = [
    { name: 'Home', path: '/home', icon: <Home className="w-5 h-5" /> },
    { name: 'Map', path: '/map', icon: <Map className="w-5 h-5" /> },
    { name: 'Trips', path: '/trips', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Ledger', path: '/ledger', icon: <Wallet className="w-5 h-5" /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-effect border-t py-1 z-30 shadow-lg border-gloop-outline bg-white/90 dark:bg-gloop-dark-surface/90 dark:border-gloop-dark-surface">
      <nav className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeItem === item.path || 
                          activeItem === item.name.toLowerCase() ||
                          (item.path === '/home' && activeItem === '/');
          return (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => setActiveItem(item.path)}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-colors relative",
                isActive 
                  ? "text-gloop-primary dark:text-gloop-primary"
                  : "text-gloop-text-muted hover:text-gloop-text-main dark:text-gloop-dark-text-muted dark:hover:text-gloop-dark-text-main"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-1.5 w-1/2 h-1 rounded-full bg-gloop-primary"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="p-1.5 rounded-full bg-gloop-accent/50 mb-1"
              >
                {item.icon}
              </motion.div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default NextNavBar; 