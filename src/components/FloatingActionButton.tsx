
import { Megaphone, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  
  // Context-aware FAB - show different icon based on the current route
  const isTripsPage = location.pathname === "/trips" || tripMode;
  
  const handleClick = () => {
    // Log interaction for debugging
    console.log(`FAB clicked on route: ${location.pathname}`);
    
    // Call the provided onClick handler
    onClick();
  };
  
  return (
    <button
      onClick={handleClick}
      aria-label={isTripsPage ? "Broadcast Trip" : "Create New Task"}
      className={cn(
        "fixed z-20 bottom-20 right-6 w-14 h-14 bg-gloop-accent text-gloop-text-main",
        "rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-400",
        "transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gloop-accent",
        className
      )}
    >
      {isTripsPage ? (
        <Megaphone className="h-6 w-6" />
      ) : (
        <Plus className="h-6 w-6" />
      )}
    </button>
  );
};

export default FloatingActionButton;
