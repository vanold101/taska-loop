import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Store, Clock, X } from "lucide-react";
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

type QuickTripButtonProps = {
  onCreateTrip?: (data: { store: string; eta: string }) => void;
  store?: string;
  onClick?: () => void;
};

const QuickTripButton = ({ onCreateTrip, store, onClick }: QuickTripButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [storeInput, setStoreInput] = useState("");
  const [eta, setEta] = useState("15");
  const { toast } = useToast();

  // If we have a store prop and onClick handler, render a simple button
  if (store && onClick) {
    return (
      <Button
        variant="outline"
        className="shrink-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
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
    
    if (onCreateTrip) {
      onCreateTrip({ store: storeInput, eta });
    }
    setStoreInput("");
    setEta("15");
    setIsOpen(false);
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-40">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <motion.button
            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg flex items-center justify-center"
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
              <Label htmlFor="store">Where are you going?</Label>
              <Input
                id="store"
                placeholder="Store name"
                value={storeInput}
                onChange={(e) => setStoreInput(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eta">How long will you be there? (minutes)</Label>
              <Input
                id="eta"
                type="number"
                min="5"
                max="180"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
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
