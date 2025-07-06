import { useState, useRef, useEffect } from "react";
import { Megaphone, Plus, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

type ActionItem = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

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
  actions?: ActionItem[];
  enableLongPress?: boolean;
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
  position = 'bottom-right',
  actions = [],
  enableLongPress = true
}: FloatingActionButtonProps) => {
  const location = useLocation();
  const [isPressed, setIsPressed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const LONG_PRESS_DURATION = 500; // ms
  
  // Context-aware FAB - show different icon based on the current route
  const isTripsPage = location.pathname === "/trips" || tripMode;
  
  const handleClick = () => {
    // Log interaction for debugging
    console.log(`FAB clicked on route: ${location.pathname}`);
    
    // Add haptic feedback
    haptics.medium();
    
    // Call the provided onClick handler
    onClick();
  };

  const handleLongPress = () => {
    // Only expand if long press is enabled and there are actions
    if (!enableLongPress || actions.length === 0) return;
    
    // Trigger long-press action to show the mini menu with haptic feedback
    haptics.longPress();
    
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (action: ActionItem) => {
    // Provide haptic feedback for action clicks
    haptics.light();
    
    // Close the expanded menu
    setIsExpanded(false);
    
    // Execute the action
    action.onClick();
  };

  const handleMouseDown = () => {
    setIsPressed(true);
    
    // Set long press timer only if long press is enabled and there are actions
    if (enableLongPress && actions.length > 0) {
      longPressTimer.current = setTimeout(() => {
        handleLongPress();
      }, LONG_PRESS_DURATION);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Clean up the timer if component unmounts while pressed
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Size variations
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };
  
  // Position variations - increased bottom spacing to prevent list overlap
  const positionClasses = {
    'bottom-right': "bottom-32 right-6",
    'bottom-center': "bottom-32 left-1/2 -translate-x-1/2",
    'bottom-left': "bottom-32 left-6"
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
        {/* Mini menu for additional actions */}
        {isExpanded && (
          <motion.div 
            className="absolute right-0 bottom-full mb-4 flex flex-col gap-3 items-center"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Render all action items */}
            {actions.map((action, index) => (
              <motion.button
                key={index}
                className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center relative group"
                whileHover={{ scale: 1.05, backgroundColor: '#f0f9ff' }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick(action);
                }}
              >
                {action.icon}
                
                {/* Tooltip/label for the action */}
                <span className="absolute right-full -translate-y-1/2 top-1/2 mr-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-md whitespace-nowrap text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {action.label}
                </span>
              </motion.button>
            ))}
            
            {/* Close button */}
            <motion.button
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center"
              whileHover={{ scale: 1.05, backgroundColor: '#f0f9ff' }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                haptics.light();
                setIsExpanded(false);
              }}
            >
              <X className="h-5 w-5 text-gray-500" />
            </motion.button>
          </motion.div>
        )}

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
          enableLongPress && actions.length > 0 && "touch-action-none", // Prevent default touch actions for long press
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.075, // 75ms scale animation as recommended
          type: "spring",
          stiffness: 500, 
          damping: 25 
        }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          e.preventDefault(); // Prevent default
          if (!isExpanded) { // Only trigger click if menu is not expanded
            handleClick();
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        aria-label={label || "Action button"}
        aria-haspopup={actions.length > 0}
        aria-expanded={isExpanded}
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
