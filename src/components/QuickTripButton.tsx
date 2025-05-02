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
  onCreateTrip: (data: { store: string; eta: string }) => void;
};

const QuickTripButton = ({ onCreateTrip }: QuickTripButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [store, setStore] = useState("");
  const [eta, setEta] = useState("15");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!store.trim()) {
      toast({
        title: "Store name required",
        description: "Please enter a store name",
        variant: "destructive",
      });
      return;
    }
    
    onCreateTrip({ store, eta });
    setStore("");
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
            className="w-16 h-16 rounded-full bg-gloop-primary text-white shadow-lg flex items-center justify-center"
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
          className="w-80 p-4 premium-card border-gloop-outline dark:border-gloop-dark-surface"
          sideOffset={5}
          align="end"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-gloop-primary" />
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
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="premium-card"
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
                className="premium-card"
              />
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full premium-gradient-btn"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Start Trip
              </Button>
              
              <p className="text-xs text-center mt-2 text-gloop-text-muted">
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
