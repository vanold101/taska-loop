
import { Megaphone, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type FloatingActionButtonProps = {
  onClick: () => void;
  className?: string;
  tripMode?: boolean;
};

const FloatingActionButton = ({ 
  onClick,
  className,
  tripMode 
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
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsPressed(false)}
      aria-label={isTripsPage ? "Broadcast Trip" : "Create New Task"}
      className={cn(
        "fixed z-20 bottom-20 right-6 w-14 h-14 bg-gloop-accent text-gloop-text-main",
        "rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-400",
        "transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gloop-accent",
        isPressed && "scale-95 bg-yellow-500",
        className
      )}
    >
      {isTripsPage ? (
        <Megaphone className="h-6 w-6" />
      ) : (
        <Plus className="h-6 w-6" />
      )}
      
      {/* Subtle ripple effect */}
      <span className={cn(
        "absolute inset-0 rounded-full bg-yellow-300 opacity-30",
        isPressed ? "scale-100" : "scale-0",
        "transition-transform duration-300"
      )} />
    </button>
  );
};

export default FloatingActionButton;
