import { Megaphone, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type FloatingActionButtonProps = {
  onClick: () => void;
  className?: string;
  tripMode?: boolean;
  icon?: ReactNode;
};

const FloatingActionButton = ({ 
  onClick,
  className,
  tripMode,
  icon
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
      className="fixed z-20 bottom-24 left-6"
    >
      <motion.button
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsPressed(false)}
        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(58, 91, 220, 0.5)" }}
        whileTap={{ scale: 0.95 }}
        aria-label={isTripsPage ? "Broadcast Trip" : "Create New Task"}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg",
          "transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gloop-accent",
          "bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end text-white",
          className
        )}
      >
        {icon ? (
          icon
        ) : isTripsPage ? (
          <Megaphone className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
        
        {/* Subtle glow effect */}
        <span className="absolute inset-0 rounded-full bg-gloop-premium-gradient-end opacity-0 hover:opacity-30 transition-opacity duration-300" />
        
        {/* Ripple effect */}
        <span className={cn(
          "absolute inset-0 rounded-full bg-white",
          isPressed ? "animate-ripple opacity-20" : "opacity-0",
        )} />
      </motion.button>
      
      {/* Shadow element */}
      <div className="absolute -inset-1 bg-gloop-primary/20 rounded-full blur-md -z-10 animate-pulse-subtle" />
    </motion.div>
  );
};

export default FloatingActionButton;
