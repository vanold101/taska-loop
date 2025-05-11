
import { useState } from "react";
import { Megaphone, Plus, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

type FloatingActionButtonProps = {
  onClick: () => void;
  className?: string;
  tripMode?: boolean;
  icon?: ReactNode;
  label?: string;
  expanded?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  showShadow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
};

const FloatingActionButton = ({ 
  onClick,
  className,
  tripMode,
  icon,
  label,
  expanded = false,
  variant = 'primary',
  showShadow = true,
  size = 'md',
  position = 'bottom-right'
}: FloatingActionButtonProps) => {
  const location = useLocation();
  const { toast } = useToast();
  const [isPressed, setIsPressed] = useState(false);
  
  // Context-aware FAB - show different icon based on the current route
  const isTripsPage = location.pathname === "/trips" || tripMode;
  
  const handleClick = () => {
    // Log interaction for debugging
    console.log(`FAB clicked on route: ${location.pathname}`);
    
    // Add haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Call the provided onClick handler
    onClick();
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  // Size variations
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };
  
  // Position variations
  const positionClasses = {
    'bottom-right': "bottom-28 right-6",
    'bottom-center': "bottom-28 left-1/2 -translate-x-1/2",
    'bottom-left': "bottom-28 left-6"
  };
  
  // Variant styling
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600",
    secondary: "bg-gradient-to-r from-gray-600 to-gray-700",
    success: "bg-gradient-to-r from-green-500 to-green-600",
    danger: "bg-gradient-to-r from-red-500 to-red-600"
  };
  
  // Default gradient for trips/general
  const defaultGradient = isTripsPage
    ? "bg-gradient-to-r from-green-500 to-blue-500"
    : "bg-gradient-to-r from-blue-500 to-green-500";
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.3
      }}
      className={cn("fixed z-50", positionClasses[position], className)}
    >
      <AnimatePresence>
        {expanded && label && (
          <motion.div 
            className="absolute right-full -translate-y-1/2 top-1/2 mr-3 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md whitespace-nowrap text-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        className={cn(
          sizeClasses[size],
          "rounded-full text-white shadow-lg flex items-center justify-center",
          variant === 'primary' ? defaultGradient : variantClasses[variant],
          showShadow && "shadow-[0_4px_14px_rgba(59,130,246,0.4)]",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          e.preventDefault(); // Prevent default
          handleClick();
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        aria-label={label || "Action button"}
      >
        {icon ? icon : <Plus className="h-6 w-6" />}
      </motion.button>
      
      {/* Shadow element */}
      {showShadow && (
        <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-md -z-10 animate-pulse-subtle" />
      )}
    </motion.div>
  );
};

export default FloatingActionButton;
