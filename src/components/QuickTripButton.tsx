import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Store, Clock, X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useTaskContext } from "@/context/TaskContext";
import { findStoreByName } from '@/data/stores';

type QuickTripButtonProps = {
  onCreateTrip?: (data: { store: string; eta: string }) => void;
  store?: string;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "premium"; 
};

const QuickTripButton = ({ 
  onCreateTrip, 
  store, 
  onClick,
  className,
  variant = "default" 
}: QuickTripButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [storeInput, setStoreInput] = useState("");
  const [eta, setEta] = useState("15");
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { addTrip } = useTaskContext();

  // Reset form when popover closes
  useEffect(() => {
    if (!isOpen) {
      setStoreInput("");
      setEta("15");
    }
  }, [isOpen]);

  // If we have a store prop and onClick handler, render a simple button
  if (store && onClick) {
    return (
      <Button
        variant="outline"
        className={cn(
          "shrink-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700",
          className
        )}
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          onClick();
        }}
      >
        <Store className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
        {store}
      </Button>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeInput.trim()) {
      toast({
        title: "Store name required",
        description: "Please enter a store name",
        variant: "destructive",
      });
      return;
    }
    
    // Find store coordinates from stores data
    const storeInfo = findStoreByName(storeInput);
    const coordinates = storeInfo ? 
      { lat: storeInfo.lat, lng: storeInfo.lng } : 
      { lat: 39.9622, lng: -83.0007 }; // Default Columbus coordinates
    
    // If onCreateTrip prop is provided, use it
    if (onCreateTrip) {
      onCreateTrip({ store: storeInput, eta });
    } else {
      // Otherwise, use the default behavior to create a trip
      const trip = {
        store: storeInput,
        eta: eta,
        status: 'open' as 'open' | 'shopping' | 'completed' | 'cancelled',
        items: [],
        participants: [
          { id: '1', name: 'You', avatar: '' }
        ],
        coordinates: coordinates,
        location: storeInput,
        date: new Date().toISOString(),
        shopper: {
          name: 'You',
          avatar: ''
        }
      };

      // Add trip using context
      addTrip(trip);
      
      // Show success toast
      toast({
        title: "Trip Created",
        description: `Your trip to ${storeInput} has been created.`,
      });

      // Navigate to trips page if not already there
      if (location.pathname !== "/trips") {
        navigate("/trips");
      }
    }

    setIsOpen(false);
    setStoreInput("");
    setEta("15");
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className={cn("fixed bottom-24 right-4 z-40", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <motion.button
            className={cn(
              "w-16 h-16 rounded-full text-white shadow-lg flex items-center justify-center",
              variant === "premium" 
                ? "bg-premium-gradient shadow-[0_4px_14px_rgba(59,130,246,0.4)]" 
                : "bg-gradient-to-r from-blue-500 to-green-500"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Store className="h-6 w-6" />
          </motion.button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-80 p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          sideOffset={5}
          align="end"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-blue-500" />
                Quick Trip
              </h3>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="store" className="flex items-center">
                <Store className="h-4 w-4 mr-1.5 text-blue-500" />
                Where are you going?
              </Label>
              <Input
                id="store"
                placeholder="Store name"
                value={storeInput}
                onChange={(e) => setStoreInput(e.target.value)}
                autoFocus
                className="border-blue-100 focus:ring-blue-500 dark:border-blue-900 dark:focus:ring-blue-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eta" className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5 text-blue-500" />
                How long will you be there? (minutes)
              </Label>
              <Input
                id="eta"
                type="number"
                min="5"
                max="180"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="border-blue-100 focus:ring-blue-500 dark:border-blue-900 dark:focus:ring-blue-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5 text-blue-500" />
                When are you going?
              </Label>
              <Input
                id="date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="border-blue-100 focus:ring-blue-500 dark:border-blue-900 dark:focus:ring-blue-700"
              />
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Start Trip
              </Button>
              
              <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                Your circle will be notified you're shopping
              </p>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default QuickTripButton;
