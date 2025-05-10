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
      className="fixed z-50 bottom-28 right-6"
    >
      <motion.button
        className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          e.preventDefault(); // Prevent default
          onClick();
        }}
      >
        {icon ? icon : <Plus className="h-6 w-6" />}
      </motion.button>
      
      {/* Shadow element */}
      <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-md -z-10 animate-pulse-subtle" />
    </motion.div>
  );
};

export default FloatingActionButton;
