import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ShoppingCart, Calendar, Settings, LayoutDashboard, Menu, X } from "lucide-react";
import MobileButton from "@/components/ui/mobile-button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/dashboard",
  },
  {
    label: "Home",
    icon: <Home className="h-5 w-5" />,
    href: "/",
  },
  {
    label: "Grocery",
    icon: <ShoppingCart className="h-5 w-5" />,
    href: "/grocery",
  },
  {
    label: "Chores",
    icon: <Calendar className="h-5 w-5" />,
    href: "/chores",
  },
  {
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    href: "/settings",
  },
];

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const location = useLocation();
  const [previousPath, setPreviousPath] = useState(location.pathname);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null);

  // Track route changes to determine transition direction
  useEffect(() => {
    // Find index of current and previous paths in navItems
    const currentIndex = navItems.findIndex(item => item.href === location.pathname);
    const previousIndex = navItems.findIndex(item => item.href === previousPath);
    
    // If both are found in our nav items
    if (currentIndex !== -1 && previousIndex !== -1) {
      setTransitionDirection(currentIndex > previousIndex ? 'right' : 'left');
    } else {
      setTransitionDirection(null);
    }
    
    setPreviousPath(location.pathname);
  }, [location.pathname]);

  if (!isMobile) {
    return null;
  }

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    
    // Add haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    
    navigate(href);
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-primary text-primary-foreground shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </motion.button>

      {/* Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 bg-background"
          >
            <div className="flex flex-col h-full pt-20 px-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MobileButton
                    variant="ghost"
                    className="w-full justify-start text-lg py-4"
                    onClick={() => handleNavigation(item.href)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </div>
                  </MobileButton>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t pb-safe"
      >
        <div className="flex justify-around items-center h-16 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <MobileButton
                key={item.href}
                variant="ghost"
                size="icon"
                className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : ''}`}
                onClick={() => handleNavigation(item.href)}
              >
                <div className="relative">
                  {item.icon}
                  {isActive && (
                    <motion.div
                      className="tab-indicator"
                      layoutId="activeTabIndicator"
                      transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <motion.span 
                  className="text-xs"
                  animate={{ 
                    scale: isActive ? 1.05 : 1,
                    fontWeight: isActive ? 600 : 400
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
              </MobileButton>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};

export default MobileNav; 